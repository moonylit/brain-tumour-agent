import json
from pathlib import Path
from datetime import datetime

HISTORY_PATH = (
    Path(__file__).resolve().parents[1]
    / "prediction_history.json"
)


def save_prediction(
    filename: str,
    prediction: str,
    confidence: float,
    processing_time_ms: float,
    heatmap_filename: str,
):
    if HISTORY_PATH.exists():
        with open(HISTORY_PATH, "r") as file:
            history = json.load(file)
    else:
        history = []

    history.append(
        {
            "timestamp": datetime.now().isoformat(),
            "filename": filename,
            "prediction": prediction,
            "confidence": confidence,
            "processing_time_ms": processing_time_ms,
            "heatmap_filename": heatmap_filename,
        }
    )

    with open(HISTORY_PATH, "w") as file:
        json.dump(
            history,
            file,
            indent=4,
        )