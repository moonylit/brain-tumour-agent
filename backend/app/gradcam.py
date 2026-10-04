import os
os.environ["TF_USE_LEGACY_KERAS"] = "1"

import uuid
import cv2
import numpy as np
import tensorflow as tf

from app.config import IMAGE_SIZE


class GradCAM:

    def __init__(self, model):

        self.model = model

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

    def generate(
        self,
        image_bytes,
        last_conv_layer_name="conv5_block3_out",
    ):

        image = self.preprocess(
            image_bytes,
        )

        base_model = self.model.get_layer(
            "resnet50",
        )

        last_conv_layer = base_model.get_layer(
            last_conv_layer_name,
        )

        grad_model = tf.keras.models.Model(
            inputs=base_model.input,
            outputs=last_conv_layer.output,
        )

        classifier = tf.keras.Sequential(
            [
                tf.keras.layers.GlobalAveragePooling2D(),
                self.model.get_layer("dropout"),
                self.model.get_layer("classifier"),
            ]
        )

        with tf.GradientTape() as tape:

            conv_outputs = grad_model(
                image,
            )

            tape.watch(
                conv_outputs,
            )

            predictions = classifier(
                conv_outputs,
                training=False,
            )

            index = tf.argmax(
                predictions[0],
            )

            loss = predictions[
                :,
                index,
            ]

        grads = tape.gradient(
            loss,
            conv_outputs,
        )

        pooled_grads = tf.reduce_mean(
            grads,
            axis=(0, 1, 2),
        )

        conv_outputs = conv_outputs[0]

        heatmap = tf.reduce_sum(
            conv_outputs * pooled_grads,
            axis=-1,
        )

        heatmap = tf.maximum(
            heatmap,
            0,
        )

        heatmap /= (
            tf.reduce_max(
                heatmap,
            )
            + 1e-8
        )

        return heatmap.numpy()

    def save_heatmap(
        self,
        heatmap,
        image_bytes,
    ):

        original = tf.image.decode_image(
            image_bytes,
            channels=3,
        ).numpy()

        original = cv2.resize(
            original,
            IMAGE_SIZE,
        )

        heatmap = np.uint8(
            255 * heatmap,
        )

        heatmap = cv2.resize(
            heatmap,
            IMAGE_SIZE,
        )

        heatmap = cv2.applyColorMap(
            heatmap,
            cv2.COLORMAP_JET,
        )

        overlay = cv2.addWeighted(
            original,
            0.6,
            heatmap,
            0.4,
            0,
        )

        filename = (
            f"{uuid.uuid4().hex}.png"
        )

        os.makedirs("heatmaps", exist_ok=True)

        output_path = os.path.join(
            "heatmaps",
            filename,
        )

        raw_output_path = os.path.join(
            "heatmaps",
            f"raw_{filename}",
        )

        cv2.imwrite(
            output_path,
            overlay,
        )

        cv2.imwrite(
            raw_output_path,
            original,
        )

        return filename