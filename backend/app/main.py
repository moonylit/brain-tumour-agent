from pathlib import Path
import os
import traceback
from dotenv import load_dotenv

# Explicit .env loading at the very top before any tools or routers are initialized
_env_backend = Path(__file__).resolve().parent.parent / ".env"
_env_root = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(_env_backend)
load_dotenv(_env_root)
load_dotenv()

from datetime import datetime, timezone
import uuid

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form,
    Query,
    HTTPException,
)
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.history import save_prediction
from app.history_api import load_prediction_history
from app.report import generate_report
from typing import Optional, Literal
from app.predictor import Predictor
from app.schemas import (
    PredictionResponse,
    StatisticsResponse,
    AgentResearchRequest,
    AgentResearchResponse,
)
from app.evaluation import (
    load_metrics,
    load_plot_paths,
    load_evaluation_data,
)
from app.statistics import get_prediction_statistics
from app.clinical_agent import run_oncology_research_agent

import logging

from app.config import (
    API_VERSION,
    FRONTEND_URL,
    ALLOWED_IMAGE_TYPES,
    MAX_FILE_SIZE,
    HEATMAP_DIRECTORY,
    PLOTS_DIRECTORY,
    LOG_LEVEL,
)

app = FastAPI(
    title="Brain Tumour AI REST API & SerpApi Clinical Decision Support Agent",
    description="""
## Brain Tumour MRI Classification & Autonomous Oncology Research Agent

A production-ready neuro-oncology REST API pairing a ResNet50 Transfer Learning
perception model with an autonomous SerpApi Clinical Decision Support Agent
(Track 01: AI Agents).

### Features

- Brain MRI classification (Glioma, Meningioma, Pituitary, No Tumour)
- Grad-CAM explainability localization
- Autonomous Oncology Research Agent via `serpapi-search-tools`
  - Real-time PubMed / NCCN standard-of-care guidelines retrieval (`web_search`)
  - Active clinical trials investigation (`web_search`)
  - Tertiary neuro-oncology hospitals and surgical centers geolocation (`maps_search`)
- Diagnostic PDF report generation with literature citations and hospital referrals
- Prediction history & statistical telemetry
- Model evaluation metrics and visual curves
""",
    version=API_VERSION,
)

app.mount(
    "/heatmaps",
    StaticFiles(
        directory=HEATMAP_DIRECTORY,
    ),
    name="heatmaps",
)

app.mount(
    "/plots",
    StaticFiles(
        directory=PLOTS_DIRECTORY,
    ),
    name="plots",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = Predictor()

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format="%(asctime)s | %(levelname)s | %(message)s",
)

logger = logging.getLogger(__name__)

logger.info("Brain Tumour AI backend and SerpApi Clinical Agent started successfully.")


@app.get(
    "/",
    summary="API Information",
    tags=["System"],
)
def root():

    return {
        "message": "Brain Tumour AI & SerpApi Clinical Decision Support Agent Backend is Running!",
        "track": "Track 01 — AI Agents (SerpApi Hackathon)",
        "agent_tools": ["serpapi-search-tools:web_search", "serpapi-search-tools:maps_search"],
    }


@app.get(
    "/health",
    summary="Health Check",
    tags=["System"],
)
def health():

    return {
        "status": "healthy",
        "model_loaded": predictor.model is not None,
        "clinical_agent_ready": True,
    }


@app.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Classify Brain MRI & Run Autonomous Clinical Decision Agent",
    description="""
Upload a brain MRI image in JPG or PNG format.

The system will:
1. Run ResNet50 Transfer Learning perception model
2. Compute Grad-CAM explainability localization
3. Run the autonomous SerpApi Clinical Decision Agent for PubMed/NCCN guidelines, clinical trials, and regional oncology centers
""",
    tags=["Prediction"],
)
@app.post(
    "/api/predict",
    response_model=PredictionResponse,
    summary="Classify Brain MRI & Run Autonomous Clinical Decision Agent (API alias)",
    tags=["Prediction"],
    include_in_schema=False,
)
async def predict(
    file: UploadFile = File(...),
    region: Optional[str] = Form(
        default="Jaipur",
        description="Patient target city or region for oncology referral routing (multipart form field)",
    ),
    patient_city: Optional[str] = Form(
        default=None,
        description="Alternative form field for patient city",
    ),
    query_region: Optional[str] = Query(
        default=None,
        alias="region",
        description="Query parameter fallback for patient target region",
    ),
    query_patient_city: Optional[str] = Query(
        default=None,
        alias="patient_city",
        description="Query parameter fallback for patient city",
    ),
):
    target_region = (
        (region.strip() if region and region.strip() else None)
        or (query_region.strip() if query_region and query_region.strip() else None)
        or (patient_city.strip() if patient_city and patient_city.strip() else None)
        or (query_patient_city.strip() if query_patient_city and query_patient_city.strip() else None)
        or "Jaipur"
    )

    logger.info(
        "Prediction request received: %s | target_region: %s",
        file.filename,
        target_region,
    )

    if file.content_type not in ALLOWED_IMAGE_TYPES:

        logger.warning(
            "Unsupported file type received: %s",
            file.content_type,
        )

        raise HTTPException(
            status_code=400,
            detail={
                "error": "unsupported_file_type",
                "message": "Only JPG and PNG MRI images are supported.",
                "supported_formats": [
                    "image/jpeg",
                    "image/png",
                ],
            },
        )

    image_bytes = await file.read()

    if not file.filename:

        logger.warning(
            "Uploaded file missing filename."
        )

        raise HTTPException(
            status_code=400,
            detail={
                "error": "missing_filename",
                "message": "Uploaded file must have a valid filename.",
            },
        )

    if len(image_bytes) == 0:

        logger.warning(
            "Empty upload received."
        )

        raise HTTPException(
            status_code=400,
            detail={
                "error": "empty_file",
                "message": "Uploaded image is empty.",
            },
        )

    if len(image_bytes) > MAX_FILE_SIZE:

        logger.warning(
            "Upload exceeded maximum size: %s",
            file.filename,
        )

        raise HTTPException(
            status_code=413,
            detail={
                "error": "file_too_large",
                "message": "Maximum upload size is 10 MB.",
                "max_size_mb": 10,
            },
        )

    try:

        (
            prediction,
            confidence,
            probabilities,
            processing_time_ms,
            heatmap_filename,
        ) = predictor.predict(
            image_bytes,
        )

    except Exception as error:

        logger.exception(
            "Prediction failed for file: %s",
            file.filename,
        )

        raise HTTPException(
            status_code=500,
            detail={
                "error": "prediction_failed",
                "message": "Failed to process the uploaded MRI image.",
                "details": str(error),
            },
        )

    logger.info(
        "Prediction successful | File=%s | Class=%s | Confidence=%.2f%% | Time=%d ms | Region=%s",
        file.filename,
        prediction,
        confidence,
        processing_time_ms,
        target_region,
    )

    # Dispatch autonomous clinical oncology agent with dynamic target_region
    print(f"DEBUG: Triggering autonomous clinical agent for class '{prediction}' in region '{target_region}'")
    agent_research = run_oncology_research_agent(
        tumor_class=prediction,
        confidence=confidence,
        patient_city=target_region,
    )

    now_utc = datetime.now(timezone.utc)
    accession_id = f"ACC-{now_utc.strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    raw_heatmap_filename = f"raw_{heatmap_filename}"

    save_prediction(
        filename=file.filename,
        prediction=prediction,
        confidence=confidence,
        processing_time_ms=processing_time_ms,
        heatmap_filename=heatmap_filename,
        agent_research=agent_research,
        probabilities=probabilities,
        accession_id=accession_id,
        region=target_region,
    )

    return PredictionResponse(
        prediction=prediction,
        confidence=confidence,
        probabilities=probabilities,
        processing_time_ms=processing_time_ms,
        heatmap_filename=heatmap_filename,
        raw_heatmap_filename=raw_heatmap_filename,
        region=target_region,
        accession_id=accession_id,
        agent_research=agent_research,
    )


@app.post(
    "/agent-research",
    response_model=AgentResearchResponse,
    tags=["Agent"],
    summary="On-Demand Autonomous Oncology Research Agent",
    description="""
Execute an on-demand clinical search and regional referral localization query for any tumor class and target region
without requiring an image re-upload.
""",
)
@app.post(
    "/api/agent-research",
    response_model=AgentResearchResponse,
    tags=["Agent"],
    summary="On-Demand Autonomous Oncology Research Agent (API alias)",
    include_in_schema=False,
)
def agent_research_endpoint(payload: AgentResearchRequest):
    logger.info(
        "On-demand clinical agent research requested for tumor_class=%s | region=%s",
        payload.tumor_class,
        payload.region,
    )
    print(f"DEBUG: On-demand agent research requested for tumor_class='{payload.tumor_class}' in region='{payload.region}'")
    research = run_oncology_research_agent(
        tumor_class=payload.tumor_class,
        confidence=payload.confidence or 0.95,
        patient_city=payload.region,
    )
    return AgentResearchResponse(**research)



@app.get(
    "/evaluation",
    tags=["Evaluation"],
    summary="Model Evaluation Metrics",
    description="""
Retrieve the evaluation metrics of the trained brain tumour classification model.

Returns:

- Accuracy
- Precision
- Recall
- F1 Score
""",
)
def evaluation():

    return load_evaluation_data()


@app.get(
    "/evaluation/plots",
    tags=["Evaluation"],
    summary="Evaluation Plots",
    description="""
Retrieve the available evaluation plot filenames.

These plots include:

- Confusion Matrix
- ROC Curve
- Precision-Recall Curve
- Training History
""",
)
def evaluation_plots():

    return load_plot_paths()


@app.get(
    "/history",
    tags=["History"],
    summary="Prediction History",
    description="""
Retrieve prediction history.

Optional query parameters:

- **limit** → Maximum number of records (must be greater than 0)
- **prediction** → Filter by prediction class
- **sort** → Sort order (`asc` or `desc`)

Validation:

- Invalid limit returns HTTP 422
- Invalid sort returns HTTP 422
- Invalid prediction returns HTTP 400
""",
)
def history(
    limit: Optional[int] = Query(
        default=None,
        gt=0,
        description="Maximum number of records to return",
    ),
    prediction: Optional[str] = Query(
        default=None,
        description="Prediction class filter",
    ),
    sort: Literal["asc", "desc"] = Query(
        default="desc",
        description="Sort order",
    ),
):

    history = load_prediction_history()

    valid_predictions = {
        "glioma",
        "meningioma",
        "pituitary",
        "notumor",
    }

    if (
        prediction is not None
        and prediction.lower() not in valid_predictions
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid prediction class",
        )

    if prediction is not None:
        history = [
            item
            for item in history
            if item["prediction"].lower() == prediction.lower()
        ]

    if sort == "desc":
        history = list(reversed(history))

    if limit is not None:
        history = history[:limit]

    return history


@app.get(
    "/statistics",
    response_model=StatisticsResponse,
    tags=["Statistics"],
    summary="Prediction Statistics",
    description="""
Retrieve analytics calculated from the prediction history.

Returns:

- Total predictions
- Average confidence
- Average processing time
- Prediction class distribution
""",
)
def get_statistics():

    return get_prediction_statistics()


@app.get(
    "/report",
    tags=["Report"],
    summary="Download PDF Report",
    description="""
Generate and download a professional PDF diagnostic report for the latest prediction,
including autonomous clinical literature evidence and regional oncology facilities.
""",
)
@app.get(
    "/api/report",
    tags=["Report"],
    summary="Download PDF Report (API alias)",
    include_in_schema=False,
)
def report(
    region: Optional[str] = Query(
        default=None,
        description="Optional target region override for the diagnostic dossier report",
    ),
):

    history = load_prediction_history()

    if not history:

        raise HTTPException(
            status_code=404,
            detail={
                "error": "history_not_found",
                "message": "No prediction history found.",
            },
        )

    latest = history[-1]

    metrics = load_metrics()

    pdf = generate_report(
        prediction=latest["prediction"],
        confidence=latest["confidence"],
        processing_time_ms=latest["processing_time_ms"],
        heatmap_filename=latest["heatmap_filename"],
        filename=latest["filename"],
        metrics=metrics,
        agent_research=latest.get("agent_research"),
        probabilities=latest.get("probabilities"),
        accession_id=latest.get("accession_id"),
        region=region or latest.get("region"),
    )

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                "attachment; filename=brain_tumour_report.pdf"
            ),
        },
    )