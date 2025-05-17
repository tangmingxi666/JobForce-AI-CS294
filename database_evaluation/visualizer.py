import json
import os
import pandas as pd
from typing import Tuple

class Visualizer:
    @staticmethod
    def export_match_results(
        df: pd.DataFrame,
        output_path: str = "match_results.json",
        title_col: str = "Job Title",
        desc_col: str = "Job Description",
        score_col: str = "score"
    ):
        """
        不生成图表，而是将匹配结果导出为 JSON 文件，
        并将分数从 0-1 转为百分制（0-100，保留两位小数）。

        参数:
          df           - 包含岗位名称、描述、原始分数的 DataFrame
          output_path  - 输出 JSON 文件路径
          title_col    - 岗位名称所在列名
          desc_col     - 岗位描述所在列名
          score_col    - 分数所在列名
        """
        # 复制 df，防止修改原始数据
        export_df = df[[title_col, desc_col, score_col]].copy()

        # 转成百分制
        export_df[score_col] = (export_df[score_col] * 100).round(2)

        # 重命名列为 JSON 友好格式
        export_df = export_df.rename(columns={
            title_col: "job_title",
            desc_col: "job_description",
            score_col: "score_percent"
        })

        # 转换为字典列表
        records = export_df.to_dict(orient="records")

        # 确保目录存在
        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

        # 写入 JSON 文件
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(records, f, ensure_ascii=False, indent=2)

        print(f"Exported match results to {output_path}")