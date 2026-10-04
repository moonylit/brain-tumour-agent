from tensorflow.keras.models import load_model

from src.config import (
    TRAIN_DIR,
    VALIDATION_DIR,
    MODEL_PATH,
)

from src.classification.dataset import load_datasets
from src.classification.evaluator import Evaluator


train_dataset, validation_dataset = load_datasets(
    TRAIN_DIR,
    VALIDATION_DIR,
)

model = load_model(
    MODEL_PATH,
)

evaluator = Evaluator(model)

evaluator.evaluate(
    validation_dataset,
)