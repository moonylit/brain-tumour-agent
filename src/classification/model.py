import tensorflow as tf


def build_model(
    num_classes,
    fine_tune=False,
):

    base_model = tf.keras.applications.ResNet50(
        weights="imagenet",
        include_top=False,
        input_shape=(224, 224, 3),
    )

    if fine_tune:

        base_model.trainable = True

        for layer in base_model.layers[:-30]:
            layer.trainable = False

    else:

        base_model.trainable = False

    inputs = tf.keras.Input(
        shape=(224, 224, 3),
        name="input_image",
    )

    x = base_model(
        inputs,
        training=False,
    )

    x = tf.keras.layers.GlobalAveragePooling2D(
        name="global_pool",
    )(x)

    x = tf.keras.layers.Dropout(
        0.3,
        name="dropout",
    )(x)

    outputs = tf.keras.layers.Dense(
        num_classes,
        activation="softmax",
        name="classifier",
    )(x)

    model = tf.keras.Model(
        inputs,
        outputs,
        name="brain_tumour_classifier",
    )

    return model