from typing import Dict, Optional

from pydantic import BaseModel, Field


class PredictionResponse(BaseModel):

    prediction: str = Field(
        ...,
        description="Predicted brain tumour class.",
        examples=["meningioma"],
    )

    confidence: float = Field(
        ...,
        description="Confidence score of the predicted class.",
        examples=[0.9987],
    )

    probabilities: Dict[str, float] = Field(
        ...,
        description="Probability distribution across all tumour classes.",
        examples=[
            {
                "glioma": 0.001,
                "meningioma": 0.998,
                "pituitary": 0.0008,
                "notumor": 0.0002,
            }
        ],
    )

    processing_time_ms: float = Field(
        ...,
        description="Inference time in milliseconds.",
        examples=[2845.62],
    )

    heatmap_filename: str = Field(
        ...,
        description="Generated Grad-CAM heatmap filename.",
        examples=["4f9e83e9d0d741d8b89f6c5d0d1f0a2b.png"],
    )


class StatisticsResponse(BaseModel):

    total_predictions: int = Field(
        ...,
        description="Total number of predictions stored in history.",
        examples=[15],
    )

    average_confidence: float = Field(
        ...,
        description="Average confidence score across all predictions.",
        examples=[0.82],
    )

    average_processing_time_ms: float = Field(
        ...,
        description="Average processing time in milliseconds.",
        examples=[1828.61],
    )

    class_distribution: Dict[str, int] = Field(
        ...,
        description="Number of predictions for each tumour class.",
        examples=[
            {
                "glioma": 2,
                "meningioma": 7,
                "pituitary": 3,
                "notumor": 5,
            }
        ],
    )

    class_percentages: Dict[str, float] = Field(
        ...,
        description="Percentage distribution of predictions for each tumour class.",
        examples=[
            {
                "glioma": 13.33,
                "meningioma": 46.67,
                "pituitary": 20.0,
                "notumor": 20.0,
            }
        ],
    )

    most_common_prediction: Optional[str] = Field(
        ...,
        description="Most frequently predicted tumour class.",
        examples=["meningioma"],
    )