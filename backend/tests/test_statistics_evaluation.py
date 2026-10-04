def test_get_statistics_success(client):
    """
    Test GET /statistics returns HTTP 200 and all documented statistics fields.
    """
    response = client.get("/statistics")
    assert response.status_code == 200
    data = response.json()

    assert "total_predictions" in data
    assert "average_confidence" in data
    assert "average_processing_time_ms" in data
    assert "class_distribution" in data
    assert "class_percentages" in data
    assert "most_common_prediction" in data

    assert isinstance(data["total_predictions"], int)
    assert isinstance(data["average_confidence"], (int, float))
    assert isinstance(data["average_processing_time_ms"], (int, float))
    assert isinstance(data["class_distribution"], dict)
    assert isinstance(data["class_percentages"], dict)
    assert data["most_common_prediction"] is None or isinstance(
        data["most_common_prediction"], str
    )


def test_get_statistics_numerical_bounds(client):
    """
    Verify numerical statistics fall within sensible ranges.
    """
    response = client.get("/statistics")
    assert response.status_code == 200
    data = response.json()

    assert data["total_predictions"] >= 0
    assert 0.0 <= data["average_confidence"] <= 1.0
    assert data["average_processing_time_ms"] >= 0.0

    # Percentages should sum to ~100% if predictions exist
    percentages = data["class_percentages"].values()
    if data["total_predictions"] > 0:
        total_pct = sum(percentages)
        assert 99.0 <= total_pct <= 101.0


def test_get_evaluation_metrics(client):
    """
    Test GET /evaluation returns HTTP 200 with model metrics.
    """
    response = client.get("/evaluation")
    assert response.status_code == 200
    data = response.json()

    assert "accuracy" in data
    assert "precision" in data
    assert "recall" in data
    assert "f1_score" in data

    for metric_name in ["accuracy", "precision", "recall", "f1_score"]:
        value = data[metric_name]
        assert isinstance(value, (int, float))
        assert 0.0 <= value <= 1.0


def test_get_evaluation_structured_data(client):
    """
    Test GET /evaluation returns structured confusion matrix, class labels,
    ROC curve coordinates, and Precision-Recall curve coordinates.
    """
    response = client.get("/evaluation")
    assert response.status_code == 200
    data = response.json()

    # Verify class labels
    assert "class_labels" in data
    assert isinstance(data["class_labels"], list)
    assert data["class_labels"] == ["glioma", "meningioma", "notumor", "pituitary"]

    # Verify confusion matrix (4x4 of non-negative integers)
    assert "confusion_matrix" in data
    cm = data["confusion_matrix"]
    assert isinstance(cm, list)
    assert len(cm) == 4
    for row in cm:
        assert isinstance(row, list)
        assert len(row) == 4
        for val in row:
            assert isinstance(val, int)
            assert val >= 0

    # Verify ROC curve data
    assert "roc_curve" in data
    roc = data["roc_curve"]
    assert isinstance(roc, dict)
    for label in data["class_labels"]:
        assert label in roc
        class_roc = roc[label]
        assert "fpr" in class_roc and isinstance(class_roc["fpr"], list)
        assert "tpr" in class_roc and isinstance(class_roc["tpr"], list)
        assert "auc" in class_roc and isinstance(class_roc["auc"], (int, float))
        assert 0.0 <= class_roc["auc"] <= 1.0

    # Verify Precision-Recall curve data
    assert "precision_recall_curve" in data
    pr = data["precision_recall_curve"]
    assert isinstance(pr, dict)
    for label in data["class_labels"]:
        assert label in pr
        class_pr = pr[label]
        assert "precision" in class_pr and isinstance(class_pr["precision"], list)
        assert "recall" in class_pr and isinstance(class_pr["recall"], list)
        assert "average_precision" in class_pr and isinstance(
            class_pr["average_precision"], (int, float)
        )
        assert 0.0 <= class_pr["average_precision"] <= 1.0


def test_get_evaluation_plots(client):
    """
    Test GET /evaluation/plots returns HTTP 200 with plot file paths,
    and verify the static plot endpoints serve valid responses.
    """
    response = client.get("/evaluation/plots")
    assert response.status_code == 200
    data = response.json()

    assert "confusion_matrix" in data
    assert "roc_curve" in data
    assert "precision_recall_curve" in data

    for key, path in data.items():
        assert isinstance(path, str)
        assert path.startswith("/plots/")
        # Verify the plot image is accessible via static files mount
        plot_response = client.get(path)
        assert plot_response.status_code == 200
        assert "image" in plot_response.headers.get("content-type", "")
