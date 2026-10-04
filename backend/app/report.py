"""
Report Generation Adapter
Delegates to pathology-grade diagnostic dossier generator.
"""

from io import BytesIO
from typing import Any, Dict, Optional
from app.report_generator import generate_diagnostic_dossier


def generate_report(
    prediction: str,
    confidence: float,
    processing_time_ms: float,
    heatmap_filename: str,
    filename: str,
    metrics: dict,
    agent_research: Optional[Dict[str, Any]] = None,
    probabilities: Optional[Dict[str, float]] = None,
    accession_id: Optional[str] = None,
    region: Optional[str] = None,
) -> BytesIO:
    """
    Generate a pathology-grade diagnostic dossier report.
    Delegates to generate_diagnostic_dossier in report_generator.
    """
    return generate_diagnostic_dossier(
        prediction=prediction,
        confidence=confidence,
        processing_time_ms=processing_time_ms,
        heatmap_filename=heatmap_filename,
        filename=filename,
        metrics=metrics,
        agent_research=agent_research,
        probabilities=probabilities,
        accession_id=accession_id,
        region=region,
    )