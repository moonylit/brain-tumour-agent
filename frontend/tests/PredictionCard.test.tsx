import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PredictionCard from "../components/PredictionCard";
import * as api from "../lib/api";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return {
    ...actual,
    downloadReport: vi.fn(),
  };
});

describe("PredictionCard Component", () => {
  const defaultProps = {
    prediction: "glioma",
    confidence: 0.9856,
    probabilities: {
      glioma: 0.9856,
      meningioma: 0.0084,
      pituitary: 0.004,
      notumor: 0.002,
    },
    processingTime: 125.456,
    heatmapFilename: "gradcam_sample.png",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders prediction result, formatted confidence, and inference time", () => {
    render(<PredictionCard {...defaultProps} />);

    expect(screen.getByText("Prediction Result")).toBeInTheDocument();
    expect(screen.getAllByText("Glioma").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("98.56%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("125.46 ms")).toBeInTheDocument();
  });

  it("renders Grad-CAM heatmap with correct image src and filename", () => {
    render(<PredictionCard {...defaultProps} />);

    expect(screen.getByText("Grad-CAM Heatmap Localization")).toBeInTheDocument();
    const img = screen.getByAltText("Grad-CAM Heatmap for glioma") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("gradcam_sample.png");
    expect(
      screen.getByText(/Generated file: gradcam_sample\.png/i),
    ).toBeInTheDocument();
  });

  it("handles heatmap image error by hiding the element", () => {
    render(<PredictionCard {...defaultProps} />);

    const img = screen.getByAltText("Grad-CAM Heatmap for glioma");
    fireEvent.error(img);
    expect(img.style.display).toBe("none");
  });

  it("omits heatmap section when heatmapFilename is empty", () => {
    render(<PredictionCard {...defaultProps} heatmapFilename="" />);

    expect(screen.queryByText("Grad-CAM Heatmap Localization")).not.toBeInTheDocument();
  });

  it("renders class probabilities breakdown with percentages and bars", () => {
    render(<PredictionCard {...defaultProps} />);

    expect(screen.getByText("Class Probabilities")).toBeInTheDocument();
    expect(screen.getAllByText("98.56%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("0.84%")).toBeInTheDocument();
    expect(screen.getByText("0.40%")).toBeInTheDocument();
    expect(screen.getByText("0.20%")).toBeInTheDocument();
    expect(screen.getByText("Meningioma")).toBeInTheDocument();
    expect(screen.getByText("Pituitary")).toBeInTheDocument();
    expect(screen.getByText("No Tumor")).toBeInTheDocument();
    expect(screen.queryByText("Notumor")).not.toBeInTheDocument();
    expect(screen.queryByText("NOTUMOR")).not.toBeInTheDocument();
  });

  it("renders 'No Tumor' cleanly without bad casing when predicted class is notumor", () => {
    const noTumorProps = {
      ...defaultProps,
      prediction: "notumor",
      confidence: 0.992,
    };
    render(<PredictionCard {...noTumorProps} />);

    expect(screen.getByText("Prediction Result")).toBeInTheDocument();
    expect(screen.getAllByText("No Tumor").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("NOTUMOR")).not.toBeInTheDocument();
    expect(screen.queryByText("Notumor")).not.toBeInTheDocument();
  });

  it("triggers downloadReport when clicking Download PDF Report button", async () => {
    const user = userEvent.setup();
    (api.downloadReport as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      undefined,
    );

    render(<PredictionCard {...defaultProps} />);

    const downloadBtn = screen.getByRole("button", {
      name: /Download PDF Report/i,
    });
    await user.click(downloadBtn);

    await waitFor(() => {
      expect(api.downloadReport).toHaveBeenCalledTimes(1);
    });
  });

  it("handles PDF report download failure and displays error message", async () => {
    const user = userEvent.setup();
    (api.downloadReport as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("PDF generation failed on server"),
    );

    render(<PredictionCard {...defaultProps} />);

    const downloadBtn = screen.getByRole("button", {
      name: /Download PDF Report/i,
    });
    await user.click(downloadBtn);

    expect(
      await screen.findByText("PDF generation failed on server"),
    ).toBeInTheDocument();
  });
});
