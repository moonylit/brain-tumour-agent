import io
from app.clinical_agent import run_oncology_research_agent


def test_clinical_agent_normal_reassurance():
    """Verify that a no_tumor / normal prediction returns reassuring baseline guidance without escalation."""
    result = run_oncology_research_agent(
        tumor_class="notumor",
        confidence=0.98,
        patient_city="Jaipur",
    )
    assert result["status"] == "baseline_normal"
    assert result["escalation_required"] is False
    assert result["tumor_class"] == "No Tumor"
    assert len(result["facilities"]) == 0
    assert "No intracranial mass" in result["clinical_summary"] or "Reassuring" in result["clinical_summary"]
    assert len(result["articles"]) > 0


def test_clinical_agent_glioma_escalation():
    """Verify that a Glioma detection triggers autonomous escalation, guidelines, and regional centers."""
    result = run_oncology_research_agent(
        tumor_class="glioma",
        confidence=0.965,
        patient_city="Jaipur",
    )
    assert result["status"] == "escalation_recommended"
    assert result["escalation_required"] is True
    assert result["tumor_class"] == "Glioma"
    assert len(result["articles"]) >= 2
    assert len(result["facilities"]) >= 2

    # Verify article structure
    first_article = result["articles"][0]
    assert "title" in first_article
    assert "snippet" in first_article
    assert "url" in first_article
    assert "source" in first_article

    # Verify facility structure
    first_facility = result["facilities"][0]
    assert "name" in first_facility
    assert "address" in first_facility
    assert "rating" in first_facility


def test_clinical_agent_meningioma_custom_city():
    """Verify Meningioma query planning and research with a custom patient city."""
    result = run_oncology_research_agent(
        tumor_class="meningioma",
        confidence=0.991,
        patient_city="Delhi",
    )
    assert result["status"] == "escalation_recommended"
    assert result["escalation_required"] is True
    assert result["patient_city"] == "Delhi"
    assert len(result["facilities"]) > 0
    assert len(result["articles"]) > 0


def test_clinical_agent_pituitary():
    """Verify Pituitary adenoma query planning and guidance."""
    result = run_oncology_research_agent(
        tumor_class="pituitary",
        confidence=0.94,
        patient_city="Jaipur",
    )
    assert result["status"] == "escalation_recommended"
    assert result["escalation_required"] is True
    assert result["tumor_class"] == "Pituitary"
    assert any("chiasm" in a["snippet"].lower() or "pituitary" in a["title"].lower() for a in result["articles"])


def test_predict_endpoint_returns_agent_research(client, sample_mri_path, preserve_history):
    """Test that POST /predict includes structured agent_research payload."""
    with open(sample_mri_path, "rb") as image_file:
        files = {
            "file": (
                sample_mri_path.name,
                image_file,
                "image/jpeg",
            )
        }
        response = client.post("/predict?patient_city=Jaipur", files=files)

    assert response.status_code == 200
    data = response.json()

    assert "agent_research" in data
    research = data["agent_research"]
    assert research is not None
    assert "status" in research
    assert "escalation_required" in research
    assert "clinical_summary" in research
    assert "articles" in research
    assert "facilities" in research
    assert "patient_city" in research
    assert research["patient_city"] == "Jaipur"
