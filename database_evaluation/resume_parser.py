# resume_parser.py
import json
from sentence_transformers import SentenceTransformer
from config import EMBEDDING_MODEL_NAME

class ResumeParser:
    def __init__(self, model_name: str = EMBEDDING_MODEL_NAME):
        self.model = SentenceTransformer(model_name)

    def load_from_file(self, path: str) -> dict:
        """从磁盘读取结构化简历 JSON"""
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    def parse_json(self, resume_json: dict) -> str:
        """
        把结构化的 resume_json 拍平成一段纯文本，
        以便做整体 embedding。
        """
        parts = []
        # 摘要
        if resume_json.get("summary"):
            parts.append(resume_json["summary"])
        # 工作经历
        for exp in resume_json.get("work_experience", []):
            parts.append(
                f"{exp.get('company','')}，"
                f"{exp.get('role','')}，"
                f"{exp.get('duration','')}："
                f"{exp.get('description','')}"
            )
        # 技能
        if resume_json.get("skills"):
            parts.append("技能：" + "，".join(resume_json["skills"]))
        # 教育经历
        for edu in resume_json.get("education", []):
            parts.append(
                f"{edu.get('school','')} "
                f"{edu.get('degree','')} "
                f"{edu.get('major','')} "
                f"({edu.get('year','')})"
            )
        return "\n\n".join(parts)

    def embed(self, text: str):
        """对文本生成 embedding 向量"""
        return self.model.encode(text)
