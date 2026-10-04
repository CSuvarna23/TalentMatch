from pathlib import Path

import joblib


MODEL_PATH = (
    Path(__file__).resolve().parents[2]
    / "resume_classifier.joblib"
)

_model = None


def predict_category(resume_text: str) -> str:
    global _model

    if not resume_text.strip():
        raise ValueError("No text could be extracted from the resume")

    if _model is None:
        _model = joblib.load(MODEL_PATH)

    return str(_model.predict([resume_text])[0])