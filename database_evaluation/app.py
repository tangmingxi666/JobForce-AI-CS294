#!/usr/bin/env python3
# app.py

import os
import json

from config import (
    JD_EMBEDDED_CSV,
    RESUME_JSON_PATH,
    SELECTED_JOBS_PATH,
    EMBEDDING_MODEL_NAME
)
from utils import setup_logger
from resume_parser import ResumeParser
from jd_loader import JDLoader
from matcher import Matcher
from visualizer import Visualizer


def main():
    # —— 日志 —— 
    logger = setup_logger("static_app")

    # —— 初始化 & 预加载岗位数据 —— 
parser  = ResumeParser(model_name=EMBEDDING_MODEL_NAME)
loader  = JDLoader(embedding_prefix="dim_")
matcher = Matcher()

jd_df, jd_embs = loader.load(JD_EMBEDDED_CSV)
    logger.info(f"Loaded {len(jd_df)} jobs, embedding dim = {jd_embs.shape[1]}")

    # —— 1. 读取本地简历 JSON —— 
    if not os.path.exists(RESUME_JSON_PATH):
        logger.error(f"Missing file: {RESUME_JSON_PATH}")
        return
    resume_json = parser.load_from_file(RESUME_JSON_PATH)

    # —— 2. 读取本地选岗 JSON —— 
    if not os.path.exists(SELECTED_JOBS_PATH):
        logger.error(f"Missing file: {SELECTED_JOBS_PATH}")
        return
    with open(SELECTED_JOBS_PATH, "r", encoding="utf-8") as f:
        job_data = json.load(f)

    # 从 job_position 中获取选中的职位
    if isinstance(job_data, dict) and "job_position" in job_data:
        selected_titles = list(job_data["job_position"].values())
    else:
        logger.error("Invalid job_data format: missing job_position")
        return

    if not selected_titles:
        logger.error("No job titles found in selected_jobs.json")
        return
    logger.info(f"Selected titles: {selected_titles}")

    # —— 3. 简历文本化 & 生成 embedding —— 
    resume_text = parser.parse_json(resume_json)
    resume_emb  = parser.embed(resume_text)

    # —— 4. 模糊校正 & 建议 —— 
    _, raw_suggestions = matcher.match_titles(
        resume_emb, jd_df, jd_embs, selected_titles
    )

    # —— 5. 构建 enhanced_suggestions（含 job_id & job_title） —— 
    enhanced_suggestions = {}
    for orig, sugg in raw_suggestions.items():
        if sugg and sugg in jd_df["Job Title"].values:
            job_id = int(jd_df.loc[jd_df["Job Title"] == sugg, "job_id"].iloc[0])
            enhanced_suggestions[orig] = {"job_id": job_id, "job_title": sugg}
        else:
            enhanced_suggestions[orig] = None

    # —— 6. 对建议岗位做匹配 & 排序 —— 
    df_sel = matcher.match_suggestions(
        resume_emb, enhanced_suggestions, jd_df, jd_embs
    )
    if df_sel.empty:
        logger.warning("No matching jobs found among suggestions")
        return

    # —— 7. 导出百分制 JSON —— 
    Visualizer.export_match_results(
        df_sel,
        output_path="match_results.json",
        title_col="Job Title",
        desc_col="Job Description",
        score_col="score"
    )

    # —— 8. 更新 job_data 中的 job_description —— 
    for _, row in df_sel.iterrows():
        job_title = row["Job Title"]
        job_desc = row["Job Description"]
        # 找到对应的 job_id
        for job_id, title in job_data["job_position"].items():
            if title == job_title:
                job_data["job_description"][job_id] = job_desc
                break

    # 保存更新后的 job_data
    with open(SELECTED_JOBS_PATH, "w", encoding="utf-8") as f:
        json.dump(job_data, f, ensure_ascii=False, indent=2)

    # —— 9. 同时打印结果到控制台 —— 
    console_output = df_sel.rename(columns={
        "Job Title": "job_title",
        "Job Description": "job_description"
    })[["job_id", "job_title", "job_description", "score"]]
    print(json.dumps(console_output.to_dict(orient="records"), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
