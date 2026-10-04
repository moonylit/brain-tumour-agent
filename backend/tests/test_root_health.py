def test_root_endpoint(client):
    """
    Test GET / returns HTTP 200 and standard API welcome information.
    """
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "Brain Tumour AI" in data["message"]


def test_health_endpoint(client):
    """
    Test GET /health returns HTTP 200 with status healthy and model loaded.
    """
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
