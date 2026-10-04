from pathlib import Path
import random

import matplotlib.pyplot as plt
from PIL import Image


class ImageVisualizer:

    def __init__(self, dataset_path):
        self.dataset_path = Path(dataset_path)

    def show_random_images(self):

        class_folders = sorted(
            folder
            for folder in self.dataset_path.iterdir()
            if folder.is_dir()
        )

        plt.figure(figsize=(12, 8))

        for index, folder in enumerate(class_folders):

            image_files = []

            for extension in ("*.jpg", "*.jpeg", "*.png"):

                image_files.extend(folder.glob(extension))

            if not image_files:
                continue

            image_path = random.choice(image_files)

            image = Image.open(image_path)

            plt.subplot(2, 2, index + 1)
            plt.imshow(image, cmap="gray")
            plt.title(folder.name)
            plt.axis("off")

        plt.tight_layout()
        plt.show()