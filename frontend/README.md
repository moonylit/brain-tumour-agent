# Brain Tumour AI — Next.js Frontend Dashboard

Modern web dashboard for Brain Tumour MRI classification, interactive explainability heatmaps, history exploration, and model analytics.

---

## Getting Started

### 1. Configure Backend API URL
Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Ensure `NEXT_PUBLIC_API_URL` points to the running FastAPI server:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 2. Run Development Server

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Build for Production

```bash
npm run build
npm run start
```

---

## Features

- **MRI Upload & Neural Inference**: Select JPG/PNG MRI scans up to 10MB with instant preview and file validation.
- **Grad-CAM Visualizer**: Real-time explainability overlay highlighting relevant anatomical features.
- **Dedicated Model Evaluation Section**: Independent dashboard section with segmented control tabs (`[ Confusion Matrix ]`, `[ ROC Curve ]`, `[ Precision-Recall ]`) rendering single visualizations with contextual explanations.
- **Clean Clinical UI & Typography**: Aesthetic dark medical interface using Geist font, SVG iconography, and consistent "No Tumor" formatting.
- **Interactive History Browser**: Filter by tumour class, customize limit, toggle ascending/descending order, and inspect heatmaps.
- **Real-Time Analytics**: View aggregated predictions, average confidence, latency, and class distribution percentages.
- **PDF Report Generation**: Download official diagnostic summary PDFs with one click.
- **Live Health Status**: Real-time minimal backend connection indicator.

---

## Automated Testing

The frontend test suite is built with [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/), and [jsdom](https://github.com/jsdom/jsdom).

### Run Test Suite

```bash
# Run all tests once
npm test

# Run tests in CI mode
npm run test:run

# Run tests in watch mode
npm run test:watch
```

### Test Coverage Architecture

- `tests/api.test.ts`: Centralized Axios API client (`lib/api.ts`), health check, MRI prediction upload, history query params (limit, filter, sort), statistics, evaluation metrics & plots, PDF report download trigger, tumor class formatting helper, and backend error formatters.
- `tests/UploadCard.test.tsx`: MRI scan selection, format & size validation (JPG/PNG, max 10MB, non-empty), prediction loading state, result rendering, verification that evaluation charts are not auto-opened, and event dispatch.
- `tests/PredictionCard.test.tsx`: Prediction class, confidence %, inference latency, Grad-CAM heatmap localization rendering, error fallback, PDF report download, "No Tumor" casing, and class probabilities breakdown.
- `tests/HistoryCard.test.tsx`: Initial history fetch, empty state, class filtering, sort order toggle, limit selector, Grad-CAM modal preview, and retry behavior.
- `tests/Stats.test.tsx`: Aggregated analytics fetch, loading skeleton, primary metrics, class distribution breakdown, and connection retry.
- `tests/EvaluationCard.test.tsx`: Segmented tab switching (`Confusion Matrix`, `ROC Curve`, `Precision-Recall`), single-visualization rendering, contextual explanations, real ResNet50 metrics (Accuracy, Precision, Recall, F1), and "No Tumor" formatting.
- `tests/Navbar.test.tsx`: Header brand title, navigation anchors (including Evaluation), and dynamic backend health status pill.
- `tests/page.test.tsx`: Top-level page integration ensuring all dashboard sections mount cleanly.

