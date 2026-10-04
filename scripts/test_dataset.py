from src.classification.dataset import load_datasets

train_ds, val_ds = load_datasets(
    "data/processed/classification/train"
)

print("Training batches:", len(train_ds))
print("Validation batches:", len(val_ds))

print("\nClasses:")
print(train_ds.class_names)