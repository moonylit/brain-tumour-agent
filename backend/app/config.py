from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

# -----------------------------
# Model Configuration
# -----------------------------

MODEL_PATH = BASE_DIR / "models" / "resnet50_best.keras"

IMAGE_SIZE = (224, 224)

CLASS_NAMES = [
    "glioma",
    "meningioma",
    "notumor",
    "pituitary",
]

# -----------------------------
# API Configuration
# -----------------------------

API_VERSION = "1.1.0"

MODEL_NAME = "ResNet50 Transfer Learning"

FRONTEND_URL = "http://localhost:3000"

# -----------------------------
# Upload Configuration
# -----------------------------

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/bmp",
    "image/tiff",
    "image/gif",
    "image/avif",
    "image/x-icon",
    "image/vnd.microsoft.icon",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

# -----------------------------
# Static Directories
# -----------------------------

HEATMAP_DIRECTORY = "heatmaps"

PLOTS_DIRECTORY = "../outputs/plots"

LOG_LEVEL = "INFO"