# Dataset

IMAGE_SIZE = (224, 224)

BATCH_SIZE = 32

NUM_CLASSES = 4


# Training

INITIAL_EPOCHS = 10

FINE_TUNE_EPOCHS = 5

INITIAL_LEARNING_RATE = 1e-3

FINE_TUNE_LEARNING_RATE = 1e-5


# Paths

TRAIN_DIR = "data/processed/classification/train"

VALIDATION_DIR = "data/processed/classification/val"

MODEL_PATH = "models/resnet50_best.keras"