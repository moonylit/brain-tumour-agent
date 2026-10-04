from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class ClinicalArticle(BaseModel):

    title: str = Field(
        ...,
        description="Article title or publication headline.",
    )

    snippet: str = Field(
        ...,
        description="Key clinical takeaway or study abstract snippet.",
    )

    url: Optional[str] = Field(
        None,
        description="Direct URL to research publication or trial registry.",
    )

    source: Optional[str] = Field(
        None,
        description="Publishing journal, database, or trial sponsor.",
    )


class ClinicalFacility(BaseModel):

    name: str = Field(
        ...,
        description="Hospital or surgical cancer institute name.",
    )

    rating: Optional[float] = Field(
        None,
        description="Aggregate rating score.",
    )

    address: Optional[str] = Field(
        None,
        description="Street address or regional location.",
    )

    phone: Optional[str] = Field(
        None,
        description="Contact telephone or appointment helpline.",
    )

    link: Optional[str] = Field(
        None,
        description="Web portal or directions URL.",
    )


class AgentResearchResponse(BaseModel):

    status: str = Field(
        ...,
        description="Triage status: baseline_normal or escalation_recommended.",
    )

    tumor_class: str = Field(
        ...,
        description="Identified tumor class name.",
    )

    confidence: float = Field(
        ...,
        description="Confidence score associated with the finding.",
    )

    patient_city: str = Field(
        default="Jaipur",
        description="Patient city used for facility localization.",
    )

    region: Optional[str] = Field(
        default="Jaipur",
        description="Target geographical region for oncology referral routing.",
    )

    escalation_required: bool = Field(
        ...,
        description="Whether specialist oncological escalation is required.",
    )

    clinical_summary: str = Field(
        ...,
        description="Synthesized clinical guidance summary.",
    )

    articles: List[ClinicalArticle] = Field(
        default_factory=list,
        description="Evidence-based literature, NCCN guidelines, and clinical trials.",
    )

    facilities: List[ClinicalFacility] = Field(
        default_factory=list,
        description="Regional specialized oncology and neurosurgery centers.",
    )

    queries_executed: List[str] = Field(
        default_factory=list,
        description="Autonomous search queries dispatched to SerpApi tools.",
    )

    source_mode: Optional[str] = Field(
        None,
        description="Data provenance mode: live_serpapi, hybrid_augmented, or curated_clinical_benchmark.",
    )

    timestamp: str = Field(
        ...,
        description="UTC timestamp of the agent research execution.",
    )


class AgentResearchRequest(BaseModel):

    tumor_class: str = Field(
        ...,
        description="Tumour classification to investigate.",
        examples=["glioma"],
    )

    confidence: float = Field(
        default=0.95,
        description="Prediction confidence score.",
        examples=[0.95],
    )

    region: str = Field(
        default="Jaipur",
        description="Patient target city or region.",
        examples=["London"],
    )


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

    raw_heatmap_filename: Optional[str] = Field(
        default=None,
        description="Raw input MRI scan filename saved under /heatmaps.",
        examples=["raw_4f9e83e9d0d741d8b89f6c5d0d1f0a2b.png"],
    )

    region: Optional[str] = Field(
        default="Jaipur",
        description="Patient target region used for referral routing.",
        examples=["Jaipur"],
    )

    accession_id: Optional[str] = Field(
        default=None,
        description="Clinical accession UID.",
        examples=["ACC-20261004-9842"],
    )

    agent_research: Optional[AgentResearchResponse] = Field(
        default=None,
        description="Autonomous oncology clinical research findings generated by SerpApi Agent.",
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