from pathlib import Path
import random
import shutil

RANDOM_SEED = 42
TRAIN_RATIO = 0.8

random.seed(RANDOM_SEED)

MASOUD = Path("data/raw/classification/Masoud")
SARTAJ = Path("data/raw/classification/Sartaj")

OUTPUT = Path("data/processed/classification")

TRAIN = OUTPUT / "train"
VAL = OUTPUT / "val"

CLASS_MAP = {
    "glioma": "glioma",
    "glioma_tumor": "glioma",

    "meningioma": "meningioma",
    "meningioma_tumor": "meningioma",

    "notumor": "notumor",
    "no_tumor": "notumor",

    "pituitary": "pituitary",
    "pituitary_tumor": "pituitary",
}

VALID_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
}

all_images = {
    "glioma": [],
    "meningioma": [],
    "notumor": [],
    "pituitary": [],
}


def collect_images(dataset_path):

    for split in ["Training", "Testing"]:

        split_path = dataset_path / split

        if not split_path.exists():
            continue

        for class_folder in split_path.iterdir():

            if not class_folder.is_dir():
                continue

            class_name = CLASS_MAP.get(class_folder.name)

            if class_name is None:
                continue

            for image in class_folder.iterdir():

                if image.suffix.lower() in VALID_EXTENSIONS:
                    all_images[class_name].append(image)


collect_images(MASOUD)
collect_images(SARTAJ)


if OUTPUT.exists():
    shutil.rmtree(OUTPUT)

TRAIN.mkdir(parents=True)
VAL.mkdir(parents=True)

for class_name in all_images:
    (TRAIN / class_name).mkdir()
    (VAL / class_name).mkdir()

for class_name, images in all_images.items():

    random.shuffle(images)

    split_index = int(len(images) * TRAIN_RATIO)

    train_images = images[:split_index]
    val_images = images[split_index:]

    for image in train_images:
        shutil.copy2(
            image,
            TRAIN / class_name / image.name,
        )

    for image in val_images:
        shutil.copy2(
            image,
            VAL / class_name / image.name,
        )

    print(
        f"{class_name}: "
        f"{len(train_images)} train | "
        f"{len(val_images)} val"
    )

print("\nDataset successfully created.")