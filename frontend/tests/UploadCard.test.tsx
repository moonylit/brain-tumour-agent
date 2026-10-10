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
      screen.getByText(/Upload a patient's axial brain MRI/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Supported formats: JPEG, PNG • Max size: 10 MB/i),
    ).toBeInTheDocument();
  });

  it("validates and rejects unsupported file formats", async () => {
    render(<UploadCard />);
    const input = (document.getElementById("main-mri-upload") || document.getElementById("mri-upload-input") || document.getElementById("mri-file-input")) as HTMLInputElement;

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
    const input = (document.getElementById("main-mri-upload") || document.getElementById("mri-upload-input") || document.getElementById("mri-file-input")) as HTMLInputElement;

    const emptyFile = new File([], "empty.jpg", { type: "image/jpeg" });

    fireEvent.change(input, { target: { files: [emptyFile] } });

    expect(
      await screen.findByText(/The selected image file is empty \(0 bytes\)/i),
    ).toBeInTheDocument();
  });

  it("validates and rejects files larger than 10MB", async () => {
    render(<UploadCard />);
    const input = (document.getElementById("main-mri-upload") || document.getElementById("mri-upload-input") || document.getElementById("mri-file-input")) as HTMLInputElement;

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
    const input = (document.getElementById("main-mri-upload") || document.getElementById("mri-upload-input") || document.getElementById("mri-file-input")) as HTMLInputElement;

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
    const input = (document.getElementById("main-mri-upload") || document.getElementById("mri-upload-input") || document.getElementById("mri-file-input")) as HTMLInputElement;

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
    const input = (document.getElementById("main-mri-upload") || document.getElementById("mri-upload-input") || document.getElementById("mri-file-input")) as HTMLInputElement;

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
    const input = (document.getElementById("main-mri-upload") || document.getElementById("mri-upload-input") || document.getElementById("mri-file-input")) as HTMLInputElement;

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

  it("handles native drag-and-drop events and hover state correctly", async () => {
    render(<UploadCard />);
    const dropzone = screen.getByText(/Drag and drop neuroimaging files here/i).closest("div");
    expect(dropzone).toBeInTheDocument();

    // Drag over activates hover styling
    fireEvent.dragOver(dropzone!);
    expect(dropzone?.className).toContain("border-blue-600");
    expect(dropzone?.className).toContain("bg-blue-100");

    // Drag leave reverts hover styling
    fireEvent.dragLeave(dropzone!);
    expect(dropzone?.className).toContain("border-indigo-300");
    expect(dropzone?.className).toContain("from-blue-50/50");

    // Drop file sets input files and triggers preview
    const validFile = new File(["dropped-scan"], "dropped_mri.jpg", {
      type: "image/jpeg",
    });

    fireEvent.drop(dropzone!, {
      dataTransfer: {
        files: [validFile],
      },
    });

    expect(await screen.findByAltText("MRI Preview")).toBeInTheDocument();
    expect(screen.getByText(/dropped_mri\.jpg/i)).toBeInTheDocument();
  });

  it("renders manual location prompt initially and activates detection on button click", async () => {
    render(<UploadCard />);

    // Initial idle state
    expect(screen.getByText("Location Authentication Required")).toBeInTheDocument();
    const detectBtn = screen.getByRole("button", { name: /Detect Facility Location/i });
    expect(detectBtn).toBeInTheDocument();
    expect(
      screen.getByText("Awaiting location data to compute optimal transfer routes..."),
    ).toBeInTheDocument();

    const mockGetCurrentPosition = vi.fn((success) => {
      success({
        coords: { latitude: 26.9124, longitude: 75.7873 },
      });
    });

    const originalGeolocation = navigator.geolocation;
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
    });

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        address: { city: "Jaipur" },
      }),
    } as unknown as Response);

    fireEvent.click(detectBtn);

    expect(mockGetCurrentPosition).toHaveBeenCalled();

    await waitFor(
      () => {
        expect(screen.getByText(/Primary Regional Neuro-Trauma Center/i)).toBeInTheDocument();
      },
      { timeout: 3500 },
    );

    expect(screen.getByText(/Jaipur • Neurology Specialization/i)).toBeInTheDocument();

    // Cleanup
    Object.defineProperty(navigator, "geolocation", {
      value: originalGeolocation,
      configurable: true,
    });
    global.fetch = originalFetch;
  });
});

