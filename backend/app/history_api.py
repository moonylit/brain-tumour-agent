import json
from pathlib import Path


HISTORY_PATH = (
    Path(__file__).resolve().parents[1]
    / "prediction_history.json"
)


def load_prediction_history():

    if not HISTORY_PATH.exists():
        return []

    with open(
        HISTORY_PATH,
        "r",
    ) as file:

        return json.load(file)