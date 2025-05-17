import difflib
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Tuple, Dict

class Matcher:
    @staticmethod
    def match_titles(
        resume_emb: np.ndarray,
        jd_df: pd.DataFrame,
        jd_embs: np.ndarray,
        selected_titles: List[str],
        cutoff: float = 0.5
    ) -> Tuple[pd.DataFrame, Dict[str, str]]:
        """
        对用户传入的 selected_titles 列表先做模糊匹配校正（difflib），
        然后过滤出这几条岗位，计算余弦相似度并按分数降序排序。

        返回: (df_sel, suggestions)
        df_sel: 包含原字段+"score"的排序后 DataFrame
        suggestions: { 原输入: 校正后标题或 None }
        """
        # 模糊校正
        all_titles = jd_df["Job Title"].tolist()
        resolved: List[str] = []
        suggestions: Dict[str, str] = {}
        for title in selected_titles:
            if title in all_titles:
                resolved.append(title)
            else:
                closest = difflib.get_close_matches(title, all_titles, n=1, cutoff=cutoff)
                if closest:
                    suggestions[title] = closest[0]
                    resolved.append(closest[0])
                else:
                    suggestions[title] = None

        # 过滤
        mask = jd_df["Job Title"].isin(resolved)
        df_sel = jd_df[mask].reset_index(drop=True).copy()
        embs_sel = jd_embs[mask.values]

        if df_sel.empty:
            return df_sel, suggestions

        # 相似度计算
        sims = cosine_similarity(resume_emb.reshape(1, -1), embs_sel).flatten()
        df_sel["score"] = sims
        df_sel = df_sel.sort_values("score", ascending=False)
        return df_sel, suggestions

    @staticmethod
    def match_suggestions(
        resume_emb: np.ndarray,
        suggestions: Dict[str, Dict[str, str]],
        jd_df: pd.DataFrame,
        jd_embs: np.ndarray
    ) -> pd.DataFrame:
        """
        只对 suggestions 中建议的岗位做 embedding 相似度匹配。
        """
        # 提取有效的建议列表
        valid = [v for v in suggestions.values() if v]
        if not valid:
            return pd.DataFrame(columns=["job_id", "Job Title", "score"])

        ids = [v["job_id"] for v in valid]
        mask = jd_df["job_id"].isin(ids)
        df_sel = jd_df[mask].reset_index(drop=True).copy()
        embs_sel = jd_embs[mask.values]

        sims = cosine_similarity(resume_emb.reshape(1, -1), embs_sel).flatten()
        df_sel["score"] = sims
        df_sel = df_sel.sort_values("score", ascending=False)
        return df_sel

    @staticmethod
    def recommend_top_k(
        resume_emb: np.ndarray,
        jd_embs: np.ndarray,
        jd_df: pd.DataFrame,
        k: int = 5
    ) -> pd.DataFrame:
        """
        对全量岗位做匹配并返回 Top-K。
        """
        sims = cosine_similarity(resume_emb.reshape(1, -1), jd_embs).flatten()
        topk_idx = sims.argsort()[::-1][:k]
        result_df = jd_df.iloc[topk_idx].copy()
        result_df["score"] = sims[topk_idx]
        return result_df
