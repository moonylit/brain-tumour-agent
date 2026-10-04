import io


def test_predict_valid_image(client, sample_mri_path, preserve_history):
    """
    Test POST /predict with a valid MRI image.
    Verifies response structure, prediction class, confidence bounds,
    and that the generated Grad-CAM heatmap can be retrieved.
    """
    with open(sample_mri_path, "rb") as image_file:
        files = {
            "file": (
                sample_mri_path.name,
                image_file,
                "image/jpeg",
            )
        }
        response = client.post("/predict", files=files)

    assert response.status_code == 200
    data = response.json()

    assert "prediction" in data
    assert "confidence" in data
    assert "probabilities" in data
    assert "processing_time_ms" in data
    assert "heatmap_filename" in data

    valid_classes = {"glioma", "meningioma", "pituitary", "notumor"}
    assert data["prediction"] in valid_classes
    assert 0.0 <= data["confidence"] <= 1.0
    assert data["processing_time_ms"] > 0
    assert isinstance(data["probabilities"], dict)

    for cls in valid_classes:
        assert cls in data["probabilities"]
        assert 0.0 <= data["probabilities"][cls] <= 1.0

    # Verify the generated Grad-CAM heatmap is accessible via static endpoint
    heatmap_filename = data["heatmap_filename"]
    heatmap_response = client.get(f"/heatmaps/{heatmap_filename}")
    assert heatmap_response.status_code == 200
    assert "image" in heatmap_response.headers.get("content-type", "")


def test_predict_unsupported_file_type(client, preserve_history):
    """
    Test POST /predict with an unsupported file type returns HTTP 400.
    """
    fake_text_file = io.BytesIO(b"Hello world, not an MRI image")
    files = {
        "file": (
            "test.txt",
            fake_text_file,
            "text/plain",
        )
    }
    response = client.post("/predict", files=files)
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data


def test_predict_empty_file(client, preserve_history):
    """
    Test POST /predict with an empty file (0 bytes) returns HTTP 400.
    """
    empty_file = io.BytesIO(b"")
    files = {
        "file": (
            "empty.jpg",
            empty_file,
            "image/jpeg",
        )
    }
    response = client.post("/predict", files=files)
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data


def test_report_download_success(client):
    """
    Test GET /report returns HTTP 200 with an application/pdf attachment.
    """
    response = client.get("/report")
    assert response.status_code == 200
    assert response.headers.get("content-type") == "application/pdf"
    assert "attachment" in response.headers.get("content-disposition", "")
    assert "brain_tumour_report.pdf" in response.headers.get("content-disposition", "")
    # Check standard PDF file signature
    assert response.content.startswith(b"%PDF")
