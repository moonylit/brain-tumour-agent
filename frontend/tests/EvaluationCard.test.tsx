import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EvaluationCard from "../components/EvaluationCard";
import * as api from "../lib/api";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return {
    ...actual,
    getEvaluation: vi.fn(),
    getEvaluationPlots: vi.fn(),
  };
});

describe("EvaluationCard Component", () => {
  const mockMetrics: api.EvaluationMetrics = {
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
    roc_curve: {
      glioma: { fpr: [0, 0.05, 1], tpr: [0, 0.98, 1], auc: 0.995 },
      meningioma: { fpr: [0, 0.04, 1], tpr: [0, 0.97, 1], auc: 0.993 },
      notumor: { fpr: [0, 0.01, 1], tpr: [0, 0.99, 1], auc: 0.999 },
      pituitary: { fpr: [0, 0.03, 1], tpr: [0, 0.99, 1], auc: 0.997 },
    },
    precision_recall_curve: {
      glioma: { precision: [1, 0.98, 0], recall: [0, 0.97, 1], average_precision: 0.992 },
      meningioma: { precision: [1, 0.96, 0], recall: [0, 0.96, 1], average_precision: 0.989 },
      notumor: { precision: [1, 0.99, 0], recall: [0, 0.99, 1], average_precision: 0.999 },
      pituitary: { precision: [1, 0.98, 0], recall: [0, 0.98, 1], average_precision: 0.995 },
    },
  };

  const mockPlots: api.EvaluationPlots = {
    confusion_matrix: "/plots/confusion_matrix.png",
    roc_curve: "/plots/roc_curve.png",
    precision_recall_curve: "/plots/precision_recall_curve.png",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders heading, validated badge, and all 4 model performance metrics", () => {
    render(<EvaluationCard initialMetrics={mockMetrics} initialPlots={mockPlots} />);

    expect(screen.getByText("Validated Test Performance")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Model Evaluation" })).toBeInTheDocument();

    expect(screen.getByText("Accuracy")).toBeInTheDocument();
    expect(screen.getByText("98.09%")).toBeInTheDocument();

    expect(screen.getByText("Precision")).toBeInTheDocument();
    expect(screen.getByText("Recall")).toBeInTheDocument();
    expect(screen.getAllByText("98.16%")).toHaveLength(2);

    expect(screen.getByText("F1 Score")).toBeInTheDocument();
    expect(screen.getByText("98.15%")).toBeInTheDocument();
  });

  it("renders the three buttons and does not display any chart explicitly until clicked", () => {
    render(<EvaluationCard initialMetrics={mockMetrics} initialPlots={mockPlots} />);

    const tabCM = screen.getByRole("tab", { name: "Confusion Matrix" });
    const tabROC = screen.getByRole("tab", { name: "ROC Curve" });
    const tabPR = screen.getByRole("tab", { name: "Precision-Recall" });

    expect(tabCM).toBeInTheDocument();
    expect(tabROC).toBeInTheDocument();
    expect(tabPR).toBeInTheDocument();

    // In initial state, none of the tabs are selected
    expect(tabCM).toHaveAttribute("aria-selected", "false");
    expect(tabROC).toHaveAttribute("aria-selected", "false");
    expect(tabPR).toHaveAttribute("aria-selected", "false");

    // No chart images are displayed explicitly
    expect(screen.queryByAltText("Confusion Matrix")).not.toBeInTheDocument();
    expect(screen.queryByAltText("ROC Curve")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Precision Recall Curve")).not.toBeInTheDocument();

    // Helper text is displayed
    expect(
      screen.getByText("Click any button above to display the Confusion Matrix, ROC Curve, or Precision-Recall Curve."),
    ).toBeInTheDocument();
  });

  it("displays Confusion Matrix and formats 'notumor' as 'No Tumor' when button is clicked", async () => {
    const user = userEvent.setup();
    render(<EvaluationCard initialMetrics={mockMetrics} initialPlots={mockPlots} />);

    const tabCM = screen.getByRole("tab", { name: "Confusion Matrix" });
    await user.click(tabCM);

    expect(tabCM).toHaveAttribute("aria-selected", "true");
    expect(screen.getByAltText("Confusion Matrix")).toBeInTheDocument();

    expect(screen.getByText("Class Confusion Matrix Summary")).toBeInTheDocument();

    // The table headers and rows should display "No Tumor" rather than "notumor"
    const noTumorElements = screen.getAllByText("No Tumor");
    expect(noTumorElements.length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText("notumor")).not.toBeInTheDocument();
  });

  it("switches to ONLY ROC Curve view when ROC Curve button is clicked", async () => {
    const user = userEvent.setup();
    render(<EvaluationCard initialMetrics={mockMetrics} initialPlots={mockPlots} />);

    const tabROC = screen.getByRole("tab", { name: "ROC Curve" });
    await user.click(tabROC);

    expect(tabROC).toHaveAttribute("aria-selected", "true");
    const tabCM = screen.getByRole("tab", { name: "Confusion Matrix" });
    expect(tabCM).toHaveAttribute("aria-selected", "false");

    // Shows ROC curve explanation
    expect(
      screen.getByText(
        "Shows the model's class discrimination performance across classification thresholds.",
      ),
    ).toBeInTheDocument();

    // ONLY ROC curve image is displayed
    expect(screen.getByAltText("ROC Curve")).toBeInTheDocument();
    expect(screen.queryByAltText("Confusion Matrix")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Precision Recall Curve")).not.toBeInTheDocument();

    // Displays per-class AUC metrics
    expect(screen.getByText("AUC 0.995")).toBeInTheDocument();
    expect(screen.getByText("AUC 0.999")).toBeInTheDocument();
  });

  it("switches to ONLY Precision-Recall view when Precision-Recall button is clicked", async () => {
    const user = userEvent.setup();
    render(<EvaluationCard initialMetrics={mockMetrics} initialPlots={mockPlots} />);

    const tabPR = screen.getByRole("tab", { name: "Precision-Recall" });
    await user.click(tabPR);

    expect(tabPR).toHaveAttribute("aria-selected", "true");

    // Shows Precision-Recall curve explanation
    expect(
      screen.getByText(
        "Shows the trade-off between precision and recall across classification thresholds.",
      ),
    ).toBeInTheDocument();

    // ONLY Precision-Recall curve image is displayed
    expect(screen.getByAltText("Precision Recall Curve")).toBeInTheDocument();
    expect(screen.queryByAltText("Confusion Matrix")).not.toBeInTheDocument();
    expect(screen.queryByAltText("ROC Curve")).not.toBeInTheDocument();

    // Displays per-class AP metrics
    expect(screen.getByText("AP 0.992")).toBeInTheDocument();
    expect(screen.getByText("AP 0.999")).toBeInTheDocument();
  });

  it("toggles off and hides the visualization when clicking the active button again", async () => {
    const user = userEvent.setup();
    render(<EvaluationCard initialMetrics={mockMetrics} initialPlots={mockPlots} />);

    const tabCM = screen.getByRole("tab", { name: "Confusion Matrix" });
    
    // Open
    await user.click(tabCM);
    expect(screen.getByAltText("Confusion Matrix")).toBeInTheDocument();
    expect(tabCM).toHaveAttribute("aria-selected", "true");

    // Close
    await user.click(tabCM);
    expect(screen.queryByAltText("Confusion Matrix")).not.toBeInTheDocument();
    expect(tabCM).toHaveAttribute("aria-selected", "false");
    expect(
      screen.getByText("Click any button above to display the Confusion Matrix, ROC Curve, or Precision-Recall Curve."),
    ).toBeInTheDocument();
  });

  it("fetches evaluation data and plots automatically when props are omitted", async () => {
    const user = userEvent.setup();
    (api.getEvaluation as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockMetrics,
    );
    (api.getEvaluationPlots as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockPlots,
    );

    render(<EvaluationCard />);

    await waitFor(() => {
      expect(api.getEvaluation).toHaveBeenCalledTimes(1);
      expect(api.getEvaluationPlots).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText("98.09%")).toBeInTheDocument();

    // Now click Confusion Matrix to see plot
    const tabCM = screen.getByRole("tab", { name: "Confusion Matrix" });
    await user.click(tabCM);
    expect(screen.getByAltText("Confusion Matrix")).toBeInTheDocument();
  });

  it("displays error message and retry button when fetch fails", async () => {
    (api.getEvaluation as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Evaluation service unavailable"),
    );
    (api.getEvaluationPlots as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Evaluation service unavailable"),
    );

    render(<EvaluationCard />);

    expect(
      await screen.findByText("Unable to load model evaluation data"),
    ).toBeInTheDocument();
    expect(screen.getByText("Evaluation service unavailable")).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: "Retry Load" });
    expect(retryBtn).toBeInTheDocument();
  });
});
