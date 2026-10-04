from collections import Counter
from statistics import mean

from app.history_api import load_prediction_history


def get_prediction_statistics():
    """
    Calculate summary statistics from the prediction history.
    """

    history = load_prediction_history()

    if not history:
        return {
            "total_predictions": 0,
            "average_confidence": 0.0,
            "average_processing_time_ms": 0.0,
            "class_distribution": {},
            "class_percentages": {},
            "most_common_prediction": None,
        }

    confidences = [
        item["confidence"]
        for item in history
    ]

    processing_times = [
        item["processing_time_ms"]
        for item in history
    ]

    predictions = [
        item["prediction"]
        for item in history
    ]

    class_distribution = dict(
        Counter(predictions)
    )

    total_predictions = len(history)

    class_percentages = {
        tumour_class: round(
            (count / total_predictions) * 100,
            2,
        )
        for tumour_class, count in class_distribution.items()
    }

    most_common_prediction = max(
        class_distribution,
        key=class_distribution.get,
    )

    return {
        "total_predictions": total_predictions,
        "average_confidence": round(
            mean(confidences),
            2,
        ),
        "average_processing_time_ms": round(
            mean(processing_times),
            2,
        ),
        "class_distribution": class_distribution,
        "class_percentages": class_percentages,
        "most_common_prediction": most_common_prediction,
    }