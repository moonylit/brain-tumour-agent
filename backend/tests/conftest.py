import os
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is the working directory and in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
os.chdir(BACKEND_DIR)
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app

HISTORY_FILE = BACKEND_DIR / "prediction_history.json"
HEATMAPS_DIR = BACKEND_DIR / "heatmaps"
PROJECT_ROOT = BACKEND_DIR.parent
SAMPLE_IMAGE_PATH = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "classification"
    / "train"
    / "glioma"
    / "gg (1).jpg"
)


@pytest.fixture(scope="session")
def client():
    """
    Session-scoped TestClient.
    Initializes FastAPI and the ML model once for all test modules.
    """
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def preserve_history():
    """
    Function-scoped fixture to guarantee prediction_history.json and heatmaps/
    remain completely unchanged during and after tests.
    """
    # Record existing state
    original_history = None
    if HISTORY_FILE.exists():
        original_history = HISTORY_FILE.read_text(encoding="utf-8")

    existing_heatmaps = set()
    if HEATMAPS_DIR.exists():
        existing_heatmaps = set(HEATMAPS_DIR.iterdir())

    yield

    # Restore history file
    if original_history is not None:
        HISTORY_FILE.write_text(original_history, encoding="utf-8")
    elif HISTORY_FILE.exists():
        HISTORY_FILE.unlink()

    # Clean up any new heatmap files generated during the test
    if HEATMAPS_DIR.exists():
        current_heatmaps = set(HEATMAPS_DIR.iterdir())
        for new_file in current_heatmaps - existing_heatmaps:
            try:
                new_file.unlink()
            except OSError:
                pass


@pytest.fixture(scope="session")
def sample_mri_path():
    """
    Returns the path to a valid MRI test image from the dataset.
    """
    assert SAMPLE_IMAGE_PATH.exists(), f"Sample MRI not found at {SAMPLE_IMAGE_PATH}"
    return SAMPLE_IMAGE_PATH
