from src.preprocessing.dataset_loader import DatasetLoader

loader = DatasetLoader("data/raw/classification/Masoud/Training")

print("=" * 50)
print("Brain Tumour Dataset Summary")
print("=" * 50)

print("\nDataset exists:", loader.exists())

print("\nImage Count Per Class")

counts = loader.count_images()

total_images = 0

for class_name, image_count in counts.items():
    print(f"{class_name}: {image_count}")
    total_images += image_count

print("\nTotal Images:", total_images)