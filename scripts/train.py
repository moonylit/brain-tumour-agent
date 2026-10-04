from tensorflow.keras.models import load_model

from src.config import (
    TRAIN_DIR,
    VALIDATION_DIR,
    NUM_CLASSES,
    INITIAL_EPOCHS,
    FINE_TUNE_EPOCHS,
    INITIAL_LEARNING_RATE,
    FINE_TUNE_LEARNING_RATE,
    MODEL_PATH,
)

from src.classification.dataset import load_datasets
from src.classification.model import build_model
from src.classification.trainer import Trainer

from scripts.plot_history import plot_history


train_dataset, validation_dataset = load_datasets(
    TRAIN_DIR,
    VALIDATION_DIR,
)

# -----------------------------
# Stage 1
# -----------------------------

model = build_model(NUM_CLASSES)

trainer = Trainer(model)

trainer.compile(
    learning_rate=INITIAL_LEARNING_RATE,
)

history_stage1 = trainer.train(
    train_dataset,
    validation_dataset,
    epochs=INITIAL_EPOCHS,
)

plot_history(history_stage1)

# -----------------------------
# Stage 2
# -----------------------------

fine_tune_model = build_model(
    NUM_CLASSES,
    fine_tune=True,
)

fine_tune_model.load_weights(
    MODEL_PATH,
)

fine_tune_trainer = Trainer(
    fine_tune_model,
)

fine_tune_trainer.compile(
    learning_rate=FINE_TUNE_LEARNING_RATE,
)

history_stage2 = fine_tune_trainer.train(
    train_dataset,
    validation_dataset,
    epochs=FINE_TUNE_EPOCHS,
)

plot_history(history_stage2)

print("\nFine-Tuning Finished Successfully!")
