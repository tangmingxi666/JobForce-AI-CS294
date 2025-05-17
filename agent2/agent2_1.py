from __future__ import annotations
"""Agent 2 – Resume Integration & Compression  (v2-c-api)

This revision builds on **v2-c** and adds an **import-friendly API** so that
other Python programs can call the pipeline directly without touching
`argparse`.

New public helper
-----------------
```python
from agent2_integrator_v2_c import run_pipeline
md_paths = run_pipeline(jd_file, resume_file, out_dir="./resumes")
```
`jd_file` / `resume_file` can be **Path or str pointing to JSON** *or* the
already-loaded Python object (dict / list). The function returns the same
`Dict[int, Path]` of generated Markdown files.
"""

import json
import logging
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Union, Iterable

import faiss  # type: ignore
import numpy as np
from sentence_transformers import SentenceTransformer  # type: ignore

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
LOGGER = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────────
# Helpers to extract bullets from resume.json
# ──────────────────────────────────────────────────────────────────────────────

def _clean_ws(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip())


def _bullet_from_experience(raw: dict) -> str:
    parts: List[str] = []
    for field in ("projectName", "position", "department", "city"):
        val = _clean_ws(raw.get(field, ""))
        if val:
            parts.append(val)
    desc = _clean_ws(raw.get("description", ""))
    if desc:
        parts.append(desc)
    return " – ".join(parts) if parts else "N/A"


def extract_experiences(resume_json: dict) -> Dict[str, str]:
    exp_dict: Dict[str, str] = {}
    for i, item in enumerate(resume_json.get("workExperience", []), 1):
        exp_dict[f"Work_{i}"] = _bullet_from_experience(item)
    for i, item in enumerate(resume_json.get("projectExperience", []), 1):
        exp_dict[f"Project_{i}"] = _bullet_from_experience(item)
    return exp_dict


# ──────────────────────────────────────────────────────────────────────────────
# Integrator
# ──────────────────────────────────────────────────────────────────────────────

class Agent2Integrator:
    """End-to-end integration pipeline (v2-c-api)."""

    DEFAULT_SECTION_WEIGHTS = {"Work": 1.4, "Project": 1.2}

    # Init ------------------------------------------------------------------

    def __init__(
        self,
        emb_model: str = "all-MiniLM-L6-v2",
        faiss_dim: int = 384,
        max_words_page: int = 450,
        min_exps: int = 1,
        section_weights: Dict[str, float] | None = None,
        compress: bool = False,
        pdf_root: Path | str = "./resumes",
    ) -> None:
        self.encoder = SentenceTransformer(emb_model)
        self.max_words_page = max_words_page
        self.min_exps = min_exps
        self.section_weights = section_weights or self.DEFAULT_SECTION_WEIGHTS
        self.compress = compress
        self.pdf_root = Path(pdf_root)
        self.pdf_root.mkdir(parents=True, exist_ok=True)
        self.index = faiss.IndexFlatIP(faiss_dim)

    # Low-level utils --------------------------------------------------------

    def _embed(self, texts: List[str]) -> np.ndarray:
        vecs = self.encoder.encode(texts, convert_to_numpy=True, show_progress_bar=False)
        faiss.normalize_L2(vecs)
        return vecs

    def _clean(self, text: str) -> str:
        text = re.sub(r"<[^>]+>", " ", text)
        text = re.sub(r"\s+", " ", text)
        return text.strip().lower()

    # JD normalisation -------------------------------------------------------

    @staticmethod
    def _normalise_jd_input(jd_input: Union[List[str], Dict]) -> List[str]:
        """Convert supported JD formats to a list of strings."""
        if isinstance(jd_input, list):
            jd_list = jd_input
        elif isinstance(jd_input, dict):
            if "job_description" in jd_input and isinstance(jd_input["job_description"], dict):
                inner = jd_input["job_description"]
                try:
                    jd_list = [inner[k] for k in sorted(inner, key=lambda x: int(x))]
                except Exception:
                    jd_list = list(inner.values())
            else:
                try:
                    jd_list = [jd_input[k] for k in sorted(jd_input, key=lambda x: int(x))]
                except Exception:
                    jd_list = list(jd_input.values())
        else:
            raise TypeError("Unsupported JD input type; expected list or dict.")
        
        if not jd_list:
            raise ValueError("No job descriptions provided.")
            
        if not all(isinstance(t, str) and t.strip() for t in jd_list):
            raise ValueError("Each job description must be a non-empty string.")
            
        return jd_list

    # Scoring & selection ----------------------------------------------------

    def score_experiences(self, jd: str, exps: Dict[str, str]) -> Dict[str, float]:
        jd_vec = self._embed([self._clean(jd)])[0]
        ids, texts = zip(*exps.items()) if exps else ([], [])
        vecs = self._embed([self._clean(t) for t in texts]) if texts else np.empty((0, len(jd_vec)))
        raw_scores = (vecs @ jd_vec).tolist()
        weighted: Dict[str, float] = {}
        for eid, s in zip(ids, raw_scores):
            section = eid.split("_")[0]
            weighted[eid] = s * self.section_weights.get(section, 1.0)
        return weighted

    def _word_count(self, txt: str) -> int:
        return len(txt.split())

    def select(self, scores: Dict[str, float], exps: Dict[str, str]) -> List[str]:
        ordered = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
        chosen: List[str] = []
        total = 0
        for eid, _ in ordered:
            bullet = exps[eid]
            wc = self._word_count(bullet)
            if total + wc <= self.max_words_page or len(chosen) < self.min_exps:
                chosen.append(bullet)
                total += wc
            if total >= self.max_words_page:
                break
        if len(chosen) < self.min_exps:
            for eid, _ in ordered[len(chosen):]:
                chosen.append(exps[eid])
                if len(chosen) >= self.min_exps:
                    break
        return chosen

    # Layout & export --------------------------------------------------------

    def assemble_md(self, header: str, bullets: List[str]) -> str:
        lines = [f"# {header}", ""] + [f"• {b}" for b in bullets]
        return "\n".join(lines)

    def export_md(self, md_text: str, out_path: Path) -> None:
        with open(out_path.with_suffix(".md"), "w", encoding="utf-8") as f:
            f.write(md_text)

    # Public API -------------------------------------------------------------

    def run_from_resume(
        self,
        jd_input: Union[List[str], Dict],
        resume_json: dict,
        header: str | None = None,
    ) -> Dict[int, Path]:
        jd_list = self._normalise_jd_input(jd_input)
        exp_dict = extract_experiences(resume_json)
        header = header or "Your Name – Resume"
        today_dir = self.pdf_root / datetime.now().strftime("%Y%m%d")
        today_dir.mkdir(parents=True, exist_ok=True)
        results: Dict[int, Path] = {}
        for idx, jd in enumerate(jd_list, 1):
            LOGGER.info("Scoring for JD %d", idx)
            scores = self.score_experiences(jd, exp_dict)
            bullets = self.select(scores, exp_dict)
            md = self.assemble_md(header, bullets)
            out_path = today_dir / f"resume_job{idx}"
            self.export_md(md, out_path)
            results[idx] = out_path.with_suffix(".md")
        return results

# ──────────────────────────────────────────────────────────────────────────────
# File utility
# ──────────────────────────────────────────────────────────────────────────────

def _load_json(path: Path | str):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

# ──────────────────────────────────────────────────────────────────────────────
# **Public helper function** (import-friendly)
# ──────────────────────────────────────────────────────────────────────────────

def run_pipeline(
    jd_file: Union[str, Path, List[str], Dict],
    resume_file: Union[str, Path, Dict],
    out_dir: Union[str, Path] = "./resumes",
) -> Dict[int, Path]:
    """High-level wrapper so external programs can call the full pipeline.

    Parameters
    ----------
    jd_file : str | Path | list | dict
        • Path / str → JSON file holding JD info (any supported format)
        • list / dict → already-loaded JD object
    resume_file : str | Path | dict
        • Path / str → resume JSON file
        • dict → already-loaded resume object
    out_dir : str | Path, default "./resumes"
        Root directory to store output Markdown files.

    Returns
    -------
    Dict[int, Path]
        Keys 1-5 map to the generated Markdown file paths.
    """
    # -------- JD --------
    if isinstance(jd_file, (str, Path)):
        jd_input = _load_json(jd_file)
    else:
        jd_input = jd_file

    # -------- resume --------
    if isinstance(resume_file, (str, Path)):
        resume_json = _load_json(resume_file)
    else:
        resume_json = resume_file

    integrator = Agent2Integrator(pdf_root=out_dir, compress=False)
    md_paths = integrator.run_from_resume(jd_input, resume_json)

    # 运行 agent3 生成 PDF
    for idx, md_path in md_paths.items():
        try:
            from markdown2pdf.json2latex2pdf import resume_output, latex_to_pdf
            resume_output(
                f"Agent1/output_resume/{idx}_revised_resume.json",  # 可替换为 resume_file
                str(md_path),
                "markdown2pdf/example/example1_consulting.json",
                "markdown2pdf/example/example.tex"
            )
            latex_to_pdf("agent3_output/agent3_output_resume.tex")
            print(f"[INFO] PDF generated for JD {idx}")
        except json.JSONDecodeError:
            print(f"[WARNING] Skipping JD {idx}: resume JSON decode failed")
        except Exception as e:
            print(f"[ERROR] Unexpected error for JD {idx}: {e}")

    return md_paths

# ──────────────────────────────────────────────────────────────────────────────
# CLI (仍兼容命令行用法)
# ──────────────────────────────────────────────────────────────────────────────

def main() -> None:
    import argparse

    p = argparse.ArgumentParser(description="Agent 2 Integrator v2-c-api CLI")
    p.add_argument("--jd_file", required=True, help="Path to JD JSON (flexible format)")
    p.add_argument("--resume_file", required=True, help="Single resume JSON file")
    p.add_argument("--out_dir", default="./resumes", help="Root output dir")
    args = p.parse_args()

    md_paths = run_pipeline(args.jd_file, args.resume_file, args.out_dir)
    for idx, pth in md_paths.items():
        LOGGER.info("JD %d → %s", idx, pth)


if __name__ == "__main__":
    main()

