import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UploadCard from "../components/UploadCard";
import * as api from "../lib/api";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return {
    ...actual,
    predictMRI: vi.fn(),
    getEvaluation: vi.fn(),
    getEvaluationPlots: vi.fn(),
    getHistory: vi.fn().mockResolvedValue([]),
  };
});

describe("UploadCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.getHistory as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);
  });

  it("renders upload heading, instructions, and file input", () => {
    render(<UploadCard />);

    expect(screen.getByText("Upload MRI Scan")).toBeInTheDocument();
    expect(
      screen.getByText(/Select a brain MRI image \(JPG or PNG, max 10MB\)/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Supported formats: JPG, PNG • Max size: 10 MB/i),
    ).toBeInTheDocument();
  });

  it("validates and rejects unsupported file formats", async () => {
    render(<UploadCard />);
    const input = (document.getElementById("mri-upload-input") || document.getElementById("mri-file-input")) as HTMLInputElement;

    const invalidFile = new File(["dummy text"], "notes.txt", {
      type: "text/plain",
    });

    fireEvent.change(input, { target: { files: [invalidFile] } });

    expect(
      await screen.findByText(/Unsupported image format \(text\/plain\)/i),
    ).toBeInTheDocument();
    expect(screen.queryByAltText("MRI Preview")).not.toBeInTheDocument();
  });

  it("validates and rejects empty (0-byte) files", async () => {
    render(<UploadCard />);
    const input = (document.getElementById("mri-upload-input") || document.getElementById("mri-file-input")) as HTMLInputElement;

    const emptyFile = new File([], "empty.jpg", { type: "image/jpeg" });

    fireEvent.change(input, { target: { files: [emptyFile] } });

    expect(
      await screen.findByText(/The selected image file is empty \(0 bytes\)/i),
    ).toBeInTheDocument();
  });

  it("validates and rejects files larger than 10MB", async () => {
    render(<UploadCard />);
    const input = (document.getElementById("mri-upload-input") || document.getElementById("mri-file-input")) as HTMLInputElement;

    const largeFile = new File(["a".repeat(1024)], "huge.png", {
      type: "image/png",
    });
    Object.defineProperty(largeFile, "size", { value: 11 * 1024 * 1024 });

    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(
      await screen.findByText(/exceeds the maximum allowed limit of 10 MB/i),
    ).toBeInTheDocument();
  });

  it("allows dismissing error banner via close button", async () => {
    render(<UploadCard />);
    const input = (document.getElementById("mri-upload-input") || document.getElementById("mri-file-input")) as HTMLInputElement;

    const emptyFile = new File([], "empty.jpg", { type: "image/jpeg" });
    fireEvent.change(input, { target: { files: [emptyFile] } });

    expect(
      await screen.findByText(/The selected image file is empty/i),
    ).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: /dismiss error/i });
    fireEvent.click(closeBtn);

    expect(
      screen.queryByText(/The selected image file is empty/i),
    ).not.toBeInTheDocument();
  });

  it("shows image preview and Analyze button when valid image is selected", async () => {
    render(<UploadCard />);
    const input = (document.getElementById("mri-upload-input") || document.getElementById("mri-file-input")) as HTMLInputElement;

    const validFile = new File(["valid-content"], "brain_mri.jpg", {
      type: "image/jpeg",
    });

    fireEvent.change(input, { target: { files: [validFile] } });

    expect(await screen.findByAltText("MRI Preview")).toBeInTheDocument();
    expect(screen.getByText(/brain_mri\.jpg/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Analyze MRI Scan/i }),
    ).toBeInTheDocument();
  });

  it("successfully triggers predictMRI, renders results, and does NOT auto-open evaluation visualizations", async () => {
    const user = userEvent.setup();

    const mockPrediction: api.PredictionResponse = {
      prediction: "meningioma",
      confidence: 0.945,
      probabilities: {
        glioma: 0.02,
        meningioma: 0.945,
        notumor: 0.025,
        pituitary: 0.01,
      },
      processing_time_ms: 112.5,
      heatmap_filename: "gradcam_meningioma.png",
    };

    (api.predictMRI as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockPrediction,
    );

    const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

    render(<UploadCard />);
    const input = (document.getElementById("mri-upload-input") || document.getElementById("mri-file-input")) as HTMLInputElement;

    const validFile = new File(["sample-scan"], "scan.png", {
      type: "image/png",
    });
    fireEvent.change(input, { target: { files: [validFile] } });

    const predictBtn = await screen.findByRole("button", {
      name: /Analyze MRI Scan/i,
    });
    await user.click(predictBtn);

    await waitFor(() => {
      expect(api.predictMRI).toHaveBeenCalledWith(validFile);
    });

    // Check prediction card rendered
    expect(await screen.findByText("Prediction Result")).toBeInTheDocument();
    expect(screen.getAllByText("Meningioma").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("94.50%").length).toBeGreaterThanOrEqual(1);

    // CRITICAL: EvaluationCard is NOT opened automatically with prediction
    expect(screen.queryByText("Model Evaluation")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Confusion Matrix")).not.toBeInTheDocument();

    // Verify custom event dispatched for other components
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "new-prediction" }),
    );
  });

  it("handles prediction API failure gracefully and displays error banner", async () => {
    const user = userEvent.setup();

    (api.predictMRI as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Inference service unavailable"),
    );

    render(<UploadCard />);
    const input = (document.getElementById("mri-upload-input") || document.getElementById("mri-file-input")) as HTMLInputElement;

    const validFile = new File(["valid"], "scan.jpg", { type: "image/jpeg" });
    fireEvent.change(input, { target: { files: [validFile] } });

    const predictBtn = await screen.findByRole("button", {
      name: /Analyze MRI Scan/i,
    });
    await user.click(predictBtn);

    expect(
      await screen.findByText("Inference service unavailable"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Prediction Result")).not.toBeInTheDocument();
  });
});
