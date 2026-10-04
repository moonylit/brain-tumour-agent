import sys
import time
from pathlib import Path

import numpy as np
from tensorflow.keras.models import load_model

from src.classification.predictor import Predictor


MODEL_PATH = "models/resnet50_best.keras"

CLASS_NAMES = [
    "glioma",
    "meningioma",
    "notumor",
    "pituitary",
]


def main():

    if len(sys.argv) != 2:
        print("Usage:")
        print("python -m scripts.predict <image_path>")
        return

    image_path = Path(sys.argv[1])

    if not image_path.exists():
        print(f"Image not found: {image_path}")
        return

    model = load_model(MODEL_PATH)

    predictor = Predictor(model)

    start = time.perf_counter()

    prediction, confidence = predictor.predict(image_path)

    image = predictor.preprocess(image_path)

    probabilities = model.predict(
        image,
        verbose=0,
    )[0]

    end = time.perf_counter()

    top2 = np.argsort(probabilities)[::-1][:2]

    print("\nPrediction Results")
    print("=" * 50)

    print(f"Image          : {image_path.name}")
    print(f"Prediction     : {prediction}")
    print(f"Confidence     : {confidence:.4f}")
    print(f"Inference Time : {(end-start)*1000:.2f} ms")

    print("\nTop Predictions")

    for idx in top2:
        print(
            f"{CLASS_NAMES[idx]:<12}: {probabilities[idx]:.4f}"
        )

    print("\nAll Class Probabilities")

    for class_name, probability in zip(
        CLASS_NAMES,
        probabilities,
    ):
        print(
            f"{class_name:<12}: {probability:.4f}"
        )


if __name__ == "__main__":
    main()