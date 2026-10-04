from pathlib import Path

import cv2
import matplotlib.pyplot as plt
import numpy as np
from tensorflow.keras.models import load_model

from src.classification.gradcam import GradCAM


MODEL_PATH = "models/resnet50_best.keras"

IMAGE_FOLDER = Path(
    "data/processed/classification/val/glioma"
)

image_path = next(
    IMAGE_FOLDER.glob("*")
)

model = load_model(MODEL_PATH)

gradcam = GradCAM(model)

processed = gradcam.preprocess(image_path)

heatmap = gradcam.make_gradcam_heatmap(processed)

# ---------------------------------
# Load original MRI
# ---------------------------------

original = cv2.imread(str(image_path))

original = cv2.cvtColor(
    original,
    cv2.COLOR_BGR2RGB,
)

original = cv2.resize(
    original,
    (224, 224),
)

# ---------------------------------
# Resize and smooth heatmap
# ---------------------------------

heatmap = cv2.resize(
    heatmap,
    (224, 224),
)

heatmap = cv2.GaussianBlur(
    heatmap,
    (25, 25),
    0,
)


heatmap = np.uint8(
    255 * heatmap
)

heatmap = cv2.applyColorMap(
    heatmap,
    cv2.COLORMAP_JET,
)

heatmap = cv2.cvtColor(
    heatmap,
    cv2.COLOR_BGR2RGB,
)

# ---------------------------------
# Overlay
# ---------------------------------

overlay = cv2.addWeighted(
    original,
    0.75,
    heatmap,
    0.25,
    0,
)

# ---------------------------------
# Save output
# ---------------------------------

output_dir = Path("outputs")

output_dir.mkdir(
    exist_ok=True,
)

plt.figure(
    figsize=(15, 5)
)

plt.subplot(1, 3, 1)
plt.imshow(original)
plt.title("Original MRI")
plt.axis("off")

plt.subplot(1, 3, 2)
plt.imshow(heatmap)
plt.title("Grad-CAM Heatmap")
plt.axis("off")

plt.subplot(1, 3, 3)
plt.imshow(overlay)
plt.title("MRI + Grad-CAM Overlay")
plt.axis("off")

plt.tight_layout()

plt.savefig(
    output_dir / "gradcam_overlay.png",
    dpi=600,
    bbox_inches="tight",
)

plt.show()