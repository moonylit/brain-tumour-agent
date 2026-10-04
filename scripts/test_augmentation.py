from src.preprocessing.augmentation import get_data_augmentation

augmentation = get_data_augmentation()

print(augmentation.summary())