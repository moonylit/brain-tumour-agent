from pathlib import Path

from PIL import Image


class ImagePreprocessor:

    def __init__(
        self,
        input_path,
        output_path,
        image_size=(224, 224)
    ):

        self.input_path = Path(input_path)
        self.output_path = Path(output_path)
        self.image_size = image_size

    def preprocess(self):

        self.output_path.mkdir(
            parents=True,
            exist_ok=True
        )

        valid_extensions = (
            ".jpg",
            ".jpeg",
            ".png"
        )

        total = 0

        for class_folder in sorted(self.input_path.iterdir()):

            if not class_folder.is_dir():
                continue

            output_class = (
                self.output_path /
                class_folder.name
            )

            output_class.mkdir(
                exist_ok=True
            )

            for image_file in class_folder.iterdir():

                if image_file.suffix.lower() not in valid_extensions:
                    continue

                image = Image.open(image_file)

                image = image.convert("RGB")

                image = image.resize(self.image_size)

                image.save(
                    output_class / image_file.name
                )

                total += 1

        print(f"\nProcessed {total} images.")