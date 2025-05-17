# jd_loader.py
import pandas as pd
import numpy as np
from typing import Tuple, List

class JDLoader:
    def __init__(self, embedding_prefix: str = "dim_"):
        """
        embedding_prefix：CSV 中 embedding 列的前缀
        """
        self.embedding_prefix = embedding_prefix

    def load(self, csv_path: str) -> Tuple[pd.DataFrame, np.ndarray]:
        # 1) 读取 CSV
        df = pd.read_csv(csv_path)

        # 2) 找出所有 embedding 列，比如 dim_0, dim_1, …
        emb_cols: List[str] = [
            col for col in df.columns
            if col.startswith(self.embedding_prefix)
        ]
        if not emb_cols:
            raise ValueError(f"在 {csv_path} 中找不到任何以 '{self.embedding_prefix}' 开头的列。")

        # 3) 按数字顺序排序（确保 dim_0 在前，dim_1 在后，…）
        emb_cols = sorted(
            emb_cols,
            key=lambda x: int(x.replace(self.embedding_prefix, ""))
        )
        print(f"📦 Found embedding columns: {emb_cols[:3]} ... {emb_cols[-3:]}")
        
        # 4) 将这些列拼成 N×D 的矩阵
        embs = df[emb_cols].to_numpy(dtype=float)  # shape=(N, D)

        return df, embs
