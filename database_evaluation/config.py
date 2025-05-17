# config.py
import os

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")

JD_EMBEDDED_CSV      = os.path.join(DATA_DIR, "job_descriptions_with_embeddings.csv")
RESUME_JSON_PATH     = os.path.join(DATA_DIR, "../frontend/output/resume-data.json")
SELECTED_JOBS_PATH   = os.path.join(DATA_DIR, "selected_jobs.json")

EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
