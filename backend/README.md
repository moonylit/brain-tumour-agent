# Brain Tumour AI — FastAPI Backend

Production-ready REST API for automated brain tumour MRI classification and Grad-CAM explainability powered by TensorFlow/Keras and ResNet50.

---

## Running the Backend

```bash
# From the backend directory
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive documentation:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

---

## Running Tests

Automated backend API tests use `pytest` and `fastapi.testclient.TestClient`. Tests are fully deterministic and preserve prediction history.

```bash
# Run all backend tests from the backend directory
pytest -v
```

---

## API Endpoints

- `GET /`: API status message
- `GET /health`: Health and model readiness check
- `POST /predict`: Classify MRI scan (`file` parameter, JPG/PNG, <= 10MB)
- `GET /history`: Prediction history with `limit` (int, > 0), `prediction` (`glioma`, `meningioma`, `pituitary`, `notumor`), and `sort` (`asc`, `desc`, default `desc`)
- `GET /statistics`: Total count, average confidence, processing time, and class distribution
- `GET /evaluation`: Model validation metrics (accuracy, precision, recall, F1 score), 4x4 confusion matrix, class labels, and per-class ROC and Precision-Recall curve coordinates
- `GET /evaluation/plots`: File paths to confusion matrix, ROC curve, and PR curve
- `GET /report`: Stream latest prediction summary as PDF
- `GET /heatmaps/{filename}`: Static Grad-CAM heatmap images
