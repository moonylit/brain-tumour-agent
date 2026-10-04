import tensorflow as tf


class Trainer:

    def __init__(self, model):
        self.model = model

    def compile(
        self,
        learning_rate=0.001,
    ):

        self.model.compile(
            optimizer=tf.keras.optimizers.Adam(
                learning_rate=learning_rate,
            ),
            loss=tf.keras.losses.SparseCategoricalCrossentropy(),
            metrics=[
                "accuracy",
            ],
        )

    def train(
        self,
        train_dataset,
        validation_dataset,
        epochs=10,
    ):

        callbacks = [

            tf.keras.callbacks.EarlyStopping(
                monitor="val_loss",
                patience=3,
                restore_best_weights=True,
            ),

            tf.keras.callbacks.ModelCheckpoint(
                filepath="models/resnet50_best.keras",
                save_best_only=True,
                monitor="val_loss",
            ),

            tf.keras.callbacks.ReduceLROnPlateau(
                monitor="val_loss",
                factor=0.2,
                patience=2,
            ),

        ]

        history = self.model.fit(
            train_dataset,
            validation_data=validation_dataset,
            epochs=epochs,
            callbacks=callbacks,
        )

        return history