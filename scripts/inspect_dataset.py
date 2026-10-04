from src.preprocessing.image_preprocessor import ImagePreprocessor

preprocessor = ImagePreprocessor(
    input_path="data/raw/classification/Masoud/Training",
    output_path="data/processed/classification/train"
)

preprocessor.preprocess()