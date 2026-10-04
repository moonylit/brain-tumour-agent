import tensorflow as tf

from src.config import (
    IMAGE_SIZE,
    BATCH_SIZE,
)

AUTOTUNE = tf.data.AUTOTUNE


def preprocess(image, label):

    image = tf.keras.applications.resnet.preprocess_input(
        image,
    )

    return image, label


def load_datasets(
    train_dir,
    val_dir,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
):

    train_dataset = tf.keras.utils.image_dataset_from_directory(
        train_dir,
        shuffle=True,
        image_size=image_size,
        batch_size=batch_size,
    )

    validation_dataset = tf.keras.utils.image_dataset_from_directory(
        val_dir,
        shuffle=False,
        image_size=image_size,
        batch_size=batch_size,
    )

    train_dataset = train_dataset.map(
        preprocess,
        num_parallel_calls=AUTOTUNE,
    )

    validation_dataset = validation_dataset.map(
        preprocess,
        num_parallel_calls=AUTOTUNE,
    )

    train_dataset = train_dataset.prefetch(
        AUTOTUNE,
    )

    validation_dataset = validation_dataset.prefetch(
        AUTOTUNE,
    )

    return train_dataset, validation_dataset