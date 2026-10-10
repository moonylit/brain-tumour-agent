import os
os.environ["TF_USE_LEGACY_KERAS"] = "1"

import uuid
import io
from PIL import Image
import cv2
import numpy as np
import tensorflow as tf

from app.config import IMAGE_SIZE, HEATMAP_DIRECTORY


class GradCAM:

    def __init__(self, model):

        self.model = model

    def preprocess(
        self,
        image_bytes,
    ):
        try:
            # Safely decode any image format (WebP, PNG, JPG, BMP, TIFF, etc.)
            pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            image = np.array(pil_img)
        except Exception:
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

        # Inspect model: extract resnet50 sub-model and last conv layer
        if hasattr(self.model, "get_layer"):
            layer_names = [l.name for l in self.model.layers]
            if "resnet50" in layer_names:
                base_model = self.model.get_layer("resnet50")
                last_conv_layer = base_model.get_layer(last_conv_layer_name)
                grad_model_input = base_model.input
            else:
                base_model = self.model
                last_conv_layer = self.model.get_layer(last_conv_layer_name)
                grad_model_input = self.model.input
        else:
            raise ValueError("Model does not support get_layer")

        grad_model = tf.keras.models.Model(
            inputs=grad_model_input,
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

        # Adaptive fallback: if gradients vanish or ReLU zeros out all activations
        max_val = float(tf.reduce_max(heatmap).numpy())
        if max_val <= 1e-5:
            fallback = tf.reduce_mean(
                tf.abs(conv_outputs),
                axis=-1,
            )
            fallback = fallback / (tf.reduce_max(fallback) + 1e-8)
            heatmap = fallback
        else:
            heatmap = heatmap / (max_val + 1e-8)

        return heatmap.numpy() if hasattr(heatmap, "numpy") else np.array(heatmap)

    def save_heatmap(
        self,
        heatmap,
        image_bytes,
    ):
        try:
            # Safely decode any image format (WebP, PNG, JPG, BMP, TIFF, etc.)
            pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            original = np.array(pil_img)
        except Exception:
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

        # Alpha blending: 0.45 heatmap over 0.55 original MRI for sharp contrast
        overlay = cv2.addWeighted(
            original,
            0.55,
            heatmap,
            0.45,
            0,
        )

        filename = (
            f"{uuid.uuid4().hex}.png"
        )

        os.makedirs(HEATMAP_DIRECTORY, exist_ok=True)

        output_path = os.path.join(
            HEATMAP_DIRECTORY,
            filename,
        )

        raw_output_path = os.path.join(
            HEATMAP_DIRECTORY,
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