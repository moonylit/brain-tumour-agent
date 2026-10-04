from pathlib import Path

import matplotlib.pyplot as plt


def plot_history(history):

    plots_dir = Path("outputs/plots")
    plots_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    # Accuracy

    plt.figure(figsize=(8, 6))

    plt.plot(
        history.history["accuracy"],
        label="Training Accuracy",
    )

    plt.plot(
        history.history["val_accuracy"],
        label="Validation Accuracy",
    )

    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")
    plt.title("Training vs Validation Accuracy")
    plt.legend()

    plt.savefig(
        plots_dir / "accuracy.png",
        dpi=300,
        bbox_inches="tight",
    )

    plt.close()

    # Loss

    plt.figure(figsize=(8, 6))

    plt.plot(
        history.history["loss"],
        label="Training Loss",
    )

    plt.plot(
        history.history["val_loss"],
        label="Validation Loss",
    )

    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.title("Training vs Validation Loss")
    plt.legend()

    plt.savefig(
        plots_dir / "loss.png",
        dpi=300,
        bbox_inches="tight",
    )

    plt.close()