import numpy as np
import tensorflow as tf

from src.config import IMAGE_SIZE


class GradCAM:

    def __init__(self, model):

        self.model = model

    def preprocess(self, image_path):

        image = tf.keras.utils.load_img(
            image_path,
            target_size=IMAGE_SIZE,
        )

        image = tf.keras.utils.img_to_array(
            image,
        )

        image = np.expand_dims(
            image,
            axis=0,
        )

        image = tf.keras.applications.resnet.preprocess_input(
            image,
        )

        return image

    def make_gradcam_heatmap(
        self,
        image,
        last_conv_layer_name="conv5_block3_out",
    ):

        base_model = self.model.get_layer(
            "resnet50",
        )

        last_conv_layer = base_model.get_layer(
            last_conv_layer_name,
        )

        classifier = tf.keras.Sequential(
            [
                tf.keras.layers.GlobalAveragePooling2D(),
                self.model.get_layer("dropout"),
                self.model.get_layer("classifier"),
            ]
        )

        with tf.GradientTape() as tape:

            conv_outputs = tf.keras.Model(
                base_model.input,
                last_conv_layer.output,
            )(image)

            tape.watch(
                conv_outputs,
            )

            predictions = classifier(
                conv_outputs,
                training=False,
            )

            pred_index = tf.argmax(
                predictions[0],
            )

            loss = predictions[
                :,
                pred_index,
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