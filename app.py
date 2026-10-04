from pathlib import Path
import tempfile

import cv2
import numpy as np
import streamlit as st
from tensorflow.keras.models import load_model

from src.classification.predictor import Predictor
from src.classification.gradcam import GradCAM


from src.config import (
    MODEL_PATH,
    IMAGE_SIZE,
)

CLASS_NAMES = [
    "glioma",
    "meningioma",
    "notumor",
    "pituitary",
]


@st.cache_resource
def load_prediction_model():
    return load_model(MODEL_PATH)


model = load_prediction_model()

predictor = Predictor(model)

gradcam = GradCAM(model)


st.set_page_config(
    page_title="Brain Tumour MRI Classifier",
    page_icon="🧠",
    layout="wide",
)

st.title("🧠 Brain Tumour MRI Classifier")

st.write(
    "Upload an MRI image to classify the tumour."
)

uploaded_file = st.file_uploader(
    "Choose an MRI image",
    type=["jpg", "jpeg", "png"],
)

if uploaded_file is not None:

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".jpg",
    ) as temp:

        temp.write(uploaded_file.read())

        temp_path = Path(temp.name)

    prediction, confidence = predictor.predict(
        temp_path
    )

    image = predictor.preprocess(
        temp_path
    )

    probabilities = model.predict(
        image,
        verbose=0,
    )[0]

    # --------------------------
    # Generate Grad-CAM
    # --------------------------

    processed = gradcam.preprocess(
        temp_path
    )

    heatmap = gradcam.make_gradcam_heatmap(
        processed
    )

    original = cv2.imread(
        str(temp_path)
    )

    original = cv2.cvtColor(
        original,
        cv2.COLOR_BGR2RGB,
    )

    original = cv2.resize(
        original,
        IMAGE_SIZE,
    )

    heatmap = cv2.resize(
        heatmap,
        IMAGE_SIZE,
    )

    heatmap = cv2.GaussianBlur(
        heatmap,
        (25, 25),
        0,
    )

    heatmap = np.uint8(
        255 * heatmap
    )

    heatmap = cv2.applyColorMap(
        heatmap,
        cv2.COLORMAP_JET,
    )

    heatmap = cv2.cvtColor(
        heatmap,
        cv2.COLOR_BGR2RGB,
    )

    overlay = cv2.addWeighted(
        original,
        0.75,
        heatmap,
        0.25,
        0,
    )

    # --------------------------
    # Prediction
    # --------------------------

    left, right = st.columns([1.2, 1])

    with left:

        st.image(
            temp_path,
            caption="Uploaded MRI",
            width=450,
        )

    with right:

        st.success(
            "Prediction Complete!"
        )

        c1, c2 = st.columns(2)

        with c1:

            st.metric(
                "Prediction",
                prediction.capitalize(),
            )

        with c2:

            st.metric(
                "Confidence",
                f"{confidence:.2%}",
            )

        st.markdown(
            "### Confidence Level"
        )

        if confidence >= 0.90:

            st.success(
                "🟢 High Confidence"
            )

        elif confidence >= 0.70:

            st.warning(
                "🟡 Medium Confidence"
            )

        else:

            st.error(
                "🔴 Low Confidence"
            )

    st.divider()

    st.subheader(
        "Explainable AI (Grad-CAM)"
    )

    col1, col2, col3 = st.columns(3)

    with col1:

        st.image(
            original,
            caption="Original MRI",
            use_container_width=True,
        )

    with col2:

        st.image(
            heatmap,
            caption="Grad-CAM Heatmap",
            use_container_width=True,
        )

    with col3:

        st.image(
            overlay,
            caption="Overlay",
            use_container_width=True,
        )

    st.divider()

    st.subheader(
        "Class Probabilities"
    )

    for class_name, probability in zip(
        CLASS_NAMES,
        probabilities,
    ):

        st.write(
            f"**{class_name.capitalize()}** — {probability:.2%}"
        )

        st.progress(
            float(probability)
        )

    st.divider()

    st.caption(
        "Model: ResNet50 Transfer Learning + Grad-CAM"
    )

    st.caption(
        "Classes: Glioma | Meningioma | No Tumor | Pituitary"
    )