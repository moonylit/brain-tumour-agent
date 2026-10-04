import json
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any

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
    agent_research: Optional[Dict[str, Any]] = None,
    probabilities: Optional[Dict[str, float]] = None,
    accession_id: Optional[str] = None,
    region: Optional[str] = None,
):
    if HISTORY_PATH.exists():
        try:
            with open(HISTORY_PATH, "r") as file:
                history = json.load(file)
        except Exception:
            history = []
    else:
        history = []

    record = {
        "timestamp": datetime.now().isoformat(),
        "filename": filename,
        "prediction": prediction,
        "confidence": confidence,
        "processing_time_ms": processing_time_ms,
        "heatmap_filename": heatmap_filename,
    }

    if agent_research is not None:
        record["agent_research"] = agent_research
    if probabilities is not None:
        record["probabilities"] = probabilities
    if accession_id is not None:
        record["accession_id"] = accession_id
    if region is not None:
        record["region"] = region

    history.append(record)

    with open(HISTORY_PATH, "w") as file:
        json.dump(
            history,
            file,
            indent=4,
        )