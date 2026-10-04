import json
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]
REPORT_PATH = BASE_DIR / "outputs" / "reports" / "metrics.json"
EVALUATION_DATA_PATH = BASE_DIR / "outputs" / "reports" / "evaluation_data.json"


def load_metrics():

    if EVALUATION_DATA_PATH.exists():
        with open(EVALUATION_DATA_PATH, "r") as file:
            data = json.load(file)
            return {
                "accuracy": data["accuracy"],
                "precision": data["precision"],
                "recall": data["recall"],
                "f1_score": data["f1_score"],
            }

    with open(
        REPORT_PATH,
        "r",
    ) as file:

        metrics = json.load(
            file,
        )

    return {
        "accuracy": metrics["accuracy"],
        "precision": metrics["macro avg"]["precision"],
        "recall": metrics["macro avg"]["recall"],
        "f1_score": metrics["macro avg"]["f1-score"],
    }


def load_plot_paths():

    return {
        "confusion_matrix": "/plots/confusion_matrix.png",
        "roc_curve": "/plots/roc_curve.png",
        "precision_recall_curve": "/plots/precision_recall_curve.png",
    }


def load_evaluation_data():

    if EVALUATION_DATA_PATH.exists():
        with open(EVALUATION_DATA_PATH, "r") as file:
            return json.load(file)

    metrics = load_metrics()
    plots = load_plot_paths()
    return {
        **metrics,
        "class_labels": ["glioma", "meningioma", "notumor", "pituitary"],
        "confusion_matrix": [],
        "roc_curve": {},
        "precision_recall_curve": {},
        "plots": plots,
    }