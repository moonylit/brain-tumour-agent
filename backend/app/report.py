import html
from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, Optional

from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    Image,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)


def _safe(text: Any) -> str:
    """Escape special XML characters for ReportLab Paragraph safety."""
    if text is None:
        return ""
    return html.escape(str(text))


def generate_report(
    prediction: str,
    confidence: float,
    processing_time_ms: float,
    heatmap_filename: str,
    filename: str,
    metrics: dict,
    agent_research: Optional[Dict[str, Any]] = None,
):
    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    subheading_style = ParagraphStyle(
        "ReportSubheading",
        parent=styles["Heading3"],
        fontSize=12,
        leading=15,
        textColor="#1e3a8a",
        spaceAfter=6,
    )

    card_text_style = ParagraphStyle(
        "CardText",
        parent=styles["BodyText"],
        fontSize=9,
        leading=13,
        textColor="#334155",
    )

    meta_text_style = ParagraphStyle(
        "MetaText",
        parent=styles["BodyText"],
        fontSize=8,
        leading=11,
        textColor="#64748b",
    )

    elements = []

    # -------------------------------------------------
    # Title
    # -------------------------------------------------
    elements.append(
        Paragraph(
            "<b>Brain Tumour AI Diagnostic & Clinical Agent Report</b>",
            styles["Title"],
        )
    )
    elements.append(Spacer(1, 15))

    # -------------------------------------------------
    # Report Information
    # -------------------------------------------------
    elements.append(
        Paragraph(
            "<b>Report Information</b>",
            styles["Heading2"],
        )
    )
    elements.append(
        Paragraph(
            f"MRI File: {_safe(filename)}",
            styles["BodyText"],
        )
    )
    elements.append(
        Paragraph(
            f"Generated On: {datetime.now().strftime('%d %b %Y %I:%M %p')}",
            styles["BodyText"],
        )
    )
    elements.append(
        Paragraph(
            f"Report ID: {datetime.now().strftime('%Y%m%d%H%M%S')}",
            styles["BodyText"],
        )
    )
    elements.append(
        Paragraph(
            "Perception Engine: ResNet50 Transfer Learning | Decision Agent: SerpApi Clinical Agent",
            styles["BodyText"],
        )
    )
    elements.append(Spacer(1, 14))

    # -------------------------------------------------
    # Prediction Summary
    # -------------------------------------------------
    elements.append(
        Paragraph(
            "<b>Prediction Summary</b>",
            styles["Heading2"],
        )
    )
    elements.append(
        Paragraph(
            f"Prediction: <b>{_safe(prediction).title()}</b>",
            styles["BodyText"],
        )
    )
    elements.append(
        Paragraph(
            f"Confidence: {(confidence * 100):.2f}%",
            styles["BodyText"],
        )
    )
    elements.append(
        Paragraph(
            f"Inference Time: {processing_time_ms:.2f} ms",
            styles["BodyText"],
        )
    )
    elements.append(Spacer(1, 14))

    # -------------------------------------------------
    # Model Performance
    # -------------------------------------------------
    elements.append(
        Paragraph(
            "<b>Model Performance Benchmark</b>",
            styles["Heading2"],
        )
    )
    elements.append(
        Paragraph(
            f"Accuracy: {metrics.get('accuracy', 0.0) * 100:.2f}% | "
            f"Precision: {metrics.get('precision', 0.0) * 100:.2f}% | "
            f"Recall: {metrics.get('recall', 0.0) * 100:.2f}% | "
            f"F1 Score: {metrics.get('f1_score', 0.0) * 100:.2f}%",
            styles["BodyText"],
        )
    )
    elements.append(Spacer(1, 14))

    # -------------------------------------------------
    # Grad-CAM Heatmap
    # -------------------------------------------------
    heatmap_path = (
        Path(__file__).resolve().parents[1]
        / "heatmaps"
        / heatmap_filename
    )

    if heatmap_path.exists():
        elements.append(
            Paragraph(
                "<b>Grad-CAM Heatmap Localization</b>",
                styles["Heading2"],
            )
        )
        elements.append(Spacer(1, 8))
        elements.append(
            Image(
                str(heatmap_path),
                width=220,
                height=220,
            )
        )
        elements.append(Spacer(1, 16))

    # -------------------------------------------------
    # Evidence-Based Literature & Regional Oncology Centers
    # -------------------------------------------------
    elements.append(
        Paragraph(
            "<b>Evidence-Based Literature &amp; Regional Oncology Centers</b>",
            styles["Heading2"],
        )
    )
    elements.append(Spacer(1, 6))

    if agent_research:
        # Clinical Guidance Summary
        summary = agent_research.get("clinical_summary", "")
        if summary:
            elements.append(
                Paragraph(
                    f"<b>Clinical Decision Summary:</b> {_safe(summary)}",
                    card_text_style,
                )
            )
            elements.append(Spacer(1, 10))

        # Articles / Guidelines
        articles = agent_research.get("articles", [])
        if articles:
            elements.append(
                Paragraph(
                    "<b>PubMed / NCCN Standard-of-Care Guidelines &amp; Clinical Trials</b>",
                    subheading_style,
                )
            )
            for idx, article in enumerate(articles, start=1):
                title = _safe(article.get("title", f"Guideline #{idx}"))
                snippet = _safe(article.get("snippet", ""))
                source = _safe(article.get("source", "Medical Literature"))
                url = _safe(article.get("url", ""))

                elements.append(
                    Paragraph(
                        f"<b>{idx}. {title}</b>",
                        card_text_style,
                    )
                )
                if snippet:
                    elements.append(
                        Paragraph(
                            f"&nbsp;&nbsp;&nbsp;&nbsp;{snippet}",
                            card_text_style,
                        )
                    )
                elements.append(
                    Paragraph(
                        f"&nbsp;&nbsp;&nbsp;&nbsp;<i>Source: {source}</i> | {url}",
                        meta_text_style,
                    )
                )
                elements.append(Spacer(1, 6))
            elements.append(Spacer(1, 8))

        # Facilities
        facilities = agent_research.get("facilities", [])
        patient_city = agent_research.get("patient_city", "Jaipur")
        if facilities:
            elements.append(
                Paragraph(
                    f"<b>Regional Tertiary Neuro-Oncology &amp; Surgical Centers ({_safe(patient_city)})</b>",
                    subheading_style,
                )
            )
            for idx, facility in enumerate(facilities, start=1):
                name = _safe(facility.get("name", f"Center #{idx}"))
                rating = facility.get("rating")
                rating_str = f"Rating: {rating}/5.0" if rating else "Verified Oncology Center"
                addr = _safe(facility.get("address", ""))
                phone = _safe(facility.get("phone", ""))
                link = _safe(facility.get("link", ""))

                elements.append(
                    Paragraph(
                        f"<b>{idx}. {name}</b> ({rating_str})",
                        card_text_style,
                    )
                )
                contact_parts = []
                if addr:
                    contact_parts.append(f"Address: {addr}")
                if phone:
                    contact_parts.append(f"Phone: {phone}")
                if link:
                    contact_parts.append(f"Web: {link}")

                if contact_parts:
                    elements.append(
                        Paragraph(
                            f"&nbsp;&nbsp;&nbsp;&nbsp;{' | '.join(contact_parts)}",
                            meta_text_style,
                        )
                    )
                elements.append(Spacer(1, 6))
            elements.append(Spacer(1, 8))

        # Autonomous provenance
        queries = agent_research.get("queries_executed", [])
        if queries:
            q_text = ", ".join([f'"{_safe(q)}"' for q in queries])
            elements.append(
                Paragraph(
                    f"<i>Autonomous Queries Dispatched by Agent: {q_text}</i>",
                    meta_text_style,
                )
            )
            elements.append(Spacer(1, 8))
    else:
        elements.append(
            Paragraph(
                "Autonomous research telemetry was not attached to this diagnostic session.",
                styles["BodyText"],
            )
        )
        elements.append(Spacer(1, 10))

    # -------------------------------------------------
    # Disclaimer
    # -------------------------------------------------
    elements.append(Spacer(1, 10))
    elements.append(
        Paragraph(
            "<b>Disclaimer</b>",
            styles["Heading2"],
        )
    )
    elements.append(
        Paragraph(
            "This report is generated by an AI-assisted brain tumour "
            "classification and clinical research decision support system. "
            "It is intended for educational and clinical research purposes only. "
            "The prediction, literature citations, and regional center references "
            "should not be considered a substitute for professional medical "
            "diagnosis, surgical oncology consultation, or formal clinical judgement.",
            styles["BodyText"],
        )
    )

    document.build(elements)

    buffer.seek(0)

    return buffer