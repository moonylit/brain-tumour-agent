import time

import numpy as np
import tensorflow as tf

from tensorflow.keras.models import load_model

from app.config import (
    MODEL_PATH,
    IMAGE_SIZE,
    CLASS_NAMES,
)

from app.gradcam import GradCAM


class Predictor:

    def __init__(self):

        self.model = load_model(
            MODEL_PATH,
        )

        self.gradcam = GradCAM(
            self.model,
        )

    def preprocess(
        self,
        image_bytes,
    ):

        image = tf.image.decode_image(
            image_bytes,
            channels=3,
        )

        image = tf.image.resize(
            image,
            IMAGE_SIZE,
        )

        image = tf.keras.applications.resnet.preprocess_input(
            image,
        )

        image = tf.expand_dims(
            image,
            axis=0,
        )

        return image

    def predict(
        self,
        image_bytes,
    ):

        image = self.preprocess(
            image_bytes,
        )

        start_time = time.perf_counter()

        predictions = self.model.predict(
            image,
            verbose=0,
        )[0]

        processing_time_ms = (
            time.perf_counter() - start_time
        ) * 1000

        heatmap = self.gradcam.generate(
            image_bytes,
        )

        heatmap_filename = self.gradcam.save_heatmap(
            heatmap,
            image_bytes,
        )

        index = np.argmax(
            predictions,
        )

        prediction = CLASS_NAMES[
            index
        ]

        confidence = float(
            predictions[index]
        )

        probabilities = {}

        for class_name, probability in zip(
            CLASS_NAMES,
            predictions,
        ):

            probabilities[class_name] = float(
                probability,
            )

        return (
            prediction,
            confidence,
            probabilities,
            round(
                processing_time_ms,
                2,
            ),
            heatmap_filename,
        )