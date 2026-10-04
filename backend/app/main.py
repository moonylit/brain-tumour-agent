from fastapi import (
    FastAPI,
    UploadFile,
    File,
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
async def predict(
    file: UploadFile = File(...),
    patient_city: Optional[str] = Query(
        default="Jaipur",
        description="Patient city for regional tertiary oncology center and surgical discovery",
    ),
):
    logger.info(
        "Prediction request received: %s | patient_city: %s",
        file.filename,
        patient_city,
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
        "Prediction successful | File=%s | Class=%s | Confidence=%.2f%% | Time=%d ms",
        file.filename,
        prediction,
        confidence,
        processing_time_ms,
    )

    # Dispatch autonomous clinical oncology agent
    city_str = patient_city.strip() if (patient_city and patient_city.strip()) else "Jaipur"
    agent_research = run_oncology_research_agent(
        tumor_class=prediction,
        confidence=confidence,
        patient_city=city_str,
    )

    save_prediction(
        filename=file.filename,
        prediction=prediction,
        confidence=confidence,
        processing_time_ms=processing_time_ms,
        heatmap_filename=heatmap_filename,
        agent_research=agent_research,
    )

    return PredictionResponse(
        prediction=prediction,
        confidence=confidence,
        probabilities=probabilities,
        processing_time_ms=processing_time_ms,
        heatmap_filename=heatmap_filename,
        agent_research=agent_research,
    )


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
def report():

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