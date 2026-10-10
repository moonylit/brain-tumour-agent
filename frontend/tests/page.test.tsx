import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../app/page";
import * as api from "../lib/api";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return {
    ...actual,
    checkBackendHealth: vi.fn().mockResolvedValue({ status: "healthy", model_loaded: true }),
    getHistory: vi.fn().mockResolvedValue([]),
    getEvaluation: vi.fn().mockResolvedValue({
      accuracy: 0.9809,
      precision: 0.9816,
      recall: 0.9816,
      f1_score: 0.9815,
      confusion_matrix: [
        [526, 18, 2, 0],
        [7, 534, 0, 7],
        [0, 0, 454, 1],
        [1, 4, 0, 536],
      ],
      class_labels: ["glioma", "meningioma", "notumor", "pituitary"],
    }),
    getEvaluationPlots: vi.fn().mockResolvedValue({
      confusion_matrix: "/plots/confusion_matrix.png",
      roc_curve: "/plots/roc_curve.png",
      precision_recall_curve: "/plots/precision_recall_curve.png",
    }),
    getStatistics: vi.fn().mockResolvedValue({
      total_predictions: 10,
      average_confidence: 0.95,
      average_processing_time_ms: 100,
      class_distribution: { glioma: 4, meningioma: 3, pituitary: 2, notumor: 1 },
      class_percentages: { glioma: 40, meningioma: 30, pituitary: 20, notumor: 10 },
      most_common_prediction: "glioma",
    }),
  };
});

describe("Page Integration (app/page.tsx)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all top-level landing page sections in the standardized order without crashing", async () => {
    render(<Home />);

    // 1. Header (SerpApi / Nav / BrainTumourAI)
    expect(screen.getByText("BrainTumourAI")).toBeInTheDocument();
    expect(screen.getByText("SerpApi")).toBeInTheDocument();
    expect(screen.getByText("API Online")).toBeInTheDocument();

    // 2. Hero Section
    expect(
      screen.getByText("AI Powered MRI Classification"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /Brain Tumour/i }),
    ).toBeInTheDocument();

    // 3. Core Action Grid
    expect(screen.getByText("Upload MRI Scan")).toBeInTheDocument();
    expect(screen.getByText("Geographic Referral Routing")).toBeInTheDocument();

    // 4. Model Performance Metrics Statistics Section
    expect(screen.getByText("Model Performance Metrics")).toBeInTheDocument();
    expect(screen.getByText("Validation Accuracy")).toBeInTheDocument();

    // 5. Discreet Collapsible History Accordion
    expect(
      screen.getByText(/View Patient EHR & Prediction History/i),
    ).toBeInTheDocument();

    // 5. System Architecture Pipeline
    expect(screen.getByText("System Architecture & Pipeline")).toBeInTheDocument();
    expect(screen.getByText("ResNet-50 Deep Learning Model")).toBeInTheDocument();
    expect(screen.getByText("Gradient-Weighted Activation Maps")).toBeInTheDocument();
    expect(screen.getByText("Geospatial Decision Agent")).toBeInTheDocument();

    // 6. Footer
    expect(
      screen.getByText(/NeuroAgent is an experimental AI decision-support system/i),
    ).toBeInTheDocument();
  });
});
