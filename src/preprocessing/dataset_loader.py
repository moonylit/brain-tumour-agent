from pathlib import Path


class DatasetLoader:
    """
    Utility class for loading and inspecting
    brain tumour MRI datasets.
    """

    def __init__(self, dataset_path):
        self.dataset_path = Path(dataset_path)

    def exists(self):
        """Check whether the dataset exists."""
        return self.dataset_path.exists()

    def get_subfolders(self):
        """Return all folders inside the dataset."""
        return sorted(
            [
                folder
                for folder in self.dataset_path.iterdir()
                if folder.is_dir()
            ]
        )

    def count_images(self):
        """
        Count images in every class folder.
        """

        image_counts = {}

        valid_extensions = {
            ".jpg",
            ".jpeg",
            ".png",
            ".bmp",
            ".tif",
            ".tiff"
        }

        for folder in self.get_subfolders():

            count = sum(
                1
                for file in folder.iterdir()
                if file.suffix.lower() in valid_extensions
            )

            image_counts[folder.name] = count

        return image_counts