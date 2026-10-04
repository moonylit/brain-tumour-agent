import numpy as np
import tensorflow as tf


class Predictor:

    def __init__(self, model):

        self.model = model

        self.class_names = [
            "glioma",
            "meningioma",
            "notumor",
            "pituitary",
        ]

    def preprocess(self, image_path):

        image = tf.keras.utils.load_img(
            image_path,
            target_size=(224, 224),
        )

        image = tf.keras.utils.img_to_array(image)

        image = np.expand_dims(
            image,
            axis=0,
        )

        return image

    def predict(self, image_path):

        image = self.preprocess(image_path)

        predictions = self.model.predict(
            image,
            verbose=0,
        )[0]

        predicted_index = int(
            np.argmax(predictions)
        )

        confidence = float(
            predictions[predicted_index]
        )

        return (
            self.class_names[predicted_index],
            confidence,
        )