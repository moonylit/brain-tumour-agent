import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    classification_report,
    confusion_matrix,
    roc_curve,
    auc,
    precision_recall_curve,
    average_precision_score,
)
from sklearn.preprocessing import label_binarize


class Evaluator:

    def __init__(self, model):
        self.model = model

    def evaluate(self, dataset):

        all_predictions = []
        all_labels = []
        all_probabilities = []

        for images, labels in dataset:

            predictions = self.model.predict(
                images,
                verbose=0,
            )

            all_probabilities.extend(predictions)

            predicted_labels = np.argmax(
                predictions,
                axis=1,
            )

            all_predictions.extend(predicted_labels)
            all_labels.extend(labels.numpy())

        report = classification_report(
            all_labels,
            all_predictions,
            digits=4,
        )

        print("\nClassification Report\n")
        print(report)

        reports_dir = Path("outputs/reports")
        reports_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        with open(
            reports_dir / "classification_report.txt",
            "w",
        ) as file:

            file.write(report)

        metrics = classification_report(
            all_labels,
            all_predictions,
            output_dict=True,
        )

        with open(
            reports_dir / "metrics.json",
            "w",
        ) as file:

            json.dump(
                metrics,
                file,
                indent=4,
            )

        cm = confusion_matrix(
            all_labels,
            all_predictions,
        )

        print("\nConfusion Matrix\n")
        print(cm)

        plots_dir = Path("outputs/plots")
        plots_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        display = ConfusionMatrixDisplay(
            confusion_matrix=cm,
        )

        figure, axis = plt.subplots(
            figsize=(6, 6),
        )

        display.plot(
            ax=axis,
            cmap="Blues",
            colorbar=False,
        )

        plt.title("Confusion Matrix")

        plt.savefig(
            plots_dir / "confusion_matrix.png",
            dpi=300,
            bbox_inches="tight",
        )

        plt.close()

        all_labels = np.array(all_labels)
        all_probabilities = np.array(all_probabilities)

        binary_labels = label_binarize(
            all_labels,
            classes=[0, 1, 2, 3],
        )

        plt.figure(figsize=(8, 6))

        for index in range(4):

            fpr, tpr, _ = roc_curve(
                binary_labels[:, index],
                all_probabilities[:, index],
            )

            roc_auc = auc(
                fpr,
                tpr,
            )

            plt.plot(
                fpr,
                tpr,
                label=f"Class {index} (AUC = {roc_auc:.3f})",
            )

        plt.plot(
            [0, 1],
            [0, 1],
            linestyle="--",
        )

        plt.xlabel("False Positive Rate")
        plt.ylabel("True Positive Rate")
        plt.title("ROC Curve")
        plt.legend()

        plt.savefig(
            plots_dir / "roc_curve.png",
            dpi=300,
            bbox_inches="tight",
        )

        plt.close()

        plt.figure(figsize=(8, 6))

        for index in range(4):

            precision, recall, _ = precision_recall_curve(
                binary_labels[:, index],
                all_probabilities[:, index],
            )

            average_precision = average_precision_score(
                binary_labels[:, index],
                all_probabilities[:, index],
            )

            plt.plot(
                recall,
                precision,
                label=f"Class {index} (AP = {average_precision:.3f})",
            )

        plt.xlabel("Recall")
        plt.ylabel("Precision")
        plt.title("Precision-Recall Curve")
        plt.legend()

        plt.savefig(
            plots_dir / "precision_recall_curve.png",
            dpi=300,
            bbox_inches="tight",
        )

        plt.close()

        # Save structured evaluation data for API and dashboard consumption
        class_names = ["glioma", "meningioma", "notumor", "pituitary"]
        roc_data = {}
        for index, name in enumerate(class_names):
            fpr, tpr, _ = roc_curve(
                binary_labels[:, index],
                all_probabilities[:, index],
            )
            roc_auc = float(auc(fpr, tpr))
            roc_data[name] = {
                "fpr": [round(float(x), 4) for x in fpr],
                "tpr": [round(float(x), 4) for x in tpr],
                "auc": round(roc_auc, 4),
            }

        pr_data = {}
        for index, name in enumerate(class_names):
            precision, recall, _ = precision_recall_curve(
                binary_labels[:, index],
                all_probabilities[:, index],
            )
            ap = float(average_precision_score(
                binary_labels[:, index],
                all_probabilities[:, index],
            ))
            pr_data[name] = {
                "precision": [round(float(x), 4) for x in precision],
                "recall": [round(float(x), 4) for x in recall],
                "average_precision": round(ap, 4),
            }

        evaluation_data = {
            "accuracy": float(metrics["accuracy"]),
            "precision": float(metrics["macro avg"]["precision"]),
            "recall": float(metrics["macro avg"]["recall"]),
            "f1_score": float(metrics["macro avg"]["f1-score"]),
            "class_labels": class_names,
            "confusion_matrix": cm.tolist(),
            "roc_curve": roc_data,
            "precision_recall_curve": pr_data,
            "plots": {
                "confusion_matrix": "/plots/confusion_matrix.png",
                "roc_curve": "/plots/roc_curve.png",
                "precision_recall_curve": "/plots/precision_recall_curve.png",
            },
        }

        with open(
            reports_dir / "evaluation_data.json",
            "w",
        ) as file:
            json.dump(
                evaluation_data,
                file,
                indent=4,
            )