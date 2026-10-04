import pytest


def test_get_history_default(client):
    """
    Test GET /history returns HTTP 200 and a list of history records.
    """
    response = client.get("/history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if data:
        item = data[0]
        assert "timestamp" in item
        assert "filename" in item
        assert "prediction" in item
        assert "confidence" in item
        assert "processing_time_ms" in item
        assert "heatmap_filename" in item


def test_get_history_limit(client):
    """
    Test GET /history?limit=3 returns HTTP 200 and at most 3 records.
    """
    response = client.get("/history?limit=3")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 3


def test_get_history_limit_zero_invalid(client):
    """
    Test GET /history?limit=0 returns HTTP 422 Unprocessable Entity.
    """
    response = client.get("/history?limit=0")
    assert response.status_code == 422


def test_get_history_limit_negative_invalid(client):
    """
    Test GET /history?limit=-1 returns HTTP 422 Unprocessable Entity.
    """
    response = client.get("/history?limit=-1")
    assert response.status_code == 422


def test_get_history_prediction_filter(client):
    """
    Test GET /history?prediction=glioma returns HTTP 200 and only glioma records.
    """
    response = client.get("/history?prediction=glioma")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    for item in data:
        assert item["prediction"].lower() == "glioma"


@pytest.mark.parametrize("valid_class", ["glioma", "meningioma", "pituitary", "notumor"])
def test_get_history_valid_prediction_classes(client, valid_class):
    """
    Test GET /history?prediction=<class> returns HTTP 200 for all valid classes.
    """
    response = client.get(f"/history?prediction={valid_class}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    for item in data:
        assert item["prediction"].lower() == valid_class


def test_get_history_prediction_invalid(client):
    """
    Test GET /history?prediction=invalid returns HTTP 400 Bad Request.
    """
    response = client.get("/history?prediction=invalid")
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "Invalid prediction class" in str(data["detail"])


def test_get_history_sort_asc(client):
    """
    Test GET /history?sort=asc returns HTTP 200 in ascending chronological order.
    """
    response = client.get("/history?sort=asc")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) >= 2:
        # Check ascending order
        assert data[0]["timestamp"] <= data[-1]["timestamp"]


def test_get_history_sort_desc(client):
    """
    Test GET /history?sort=desc returns HTTP 200 in descending chronological order.
    """
    response = client.get("/history?sort=desc")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) >= 2:
        # Check descending order
        assert data[0]["timestamp"] >= data[-1]["timestamp"]


def test_get_history_sort_invalid(client):
    """
    Test GET /history?sort=random returns HTTP 422 Unprocessable Entity.
    """
    response = client.get("/history?sort=random")
    assert response.status_code == 422


def test_get_history_combined_query(client):
    """
    Test GET /history?prediction=glioma&limit=3&sort=asc returns HTTP 200
    and correctly applies filtering, limit, and sorting.
    """
    response = client.get("/history?prediction=glioma&limit=3&sort=asc")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 3
    for item in data:
        assert item["prediction"].lower() == "glioma"
    if len(data) >= 2:
        assert data[0]["timestamp"] <= data[-1]["timestamp"]
