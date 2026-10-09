import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PatientArchiveDrawer from "../components/PatientArchiveDrawer";
import * as api from "../lib/api";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return {
    ...actual,
    getHistory: vi.fn(),
  };
});

describe("PatientArchiveDrawer Component", () => {
  const sampleHistory: api.HistoryItem[] = [
    {
      timestamp: "2026-03-28T10:00:00.000Z",
      filename: "patient_glioma_scan.png",
      prediction: "glioma",
      confidence: 0.962,
      processing_time_ms: 104.5,
      heatmap_filename: "heatmap_glioma_scan.png",
    },
    {
      timestamp: "2026-03-28T10:05:00.000Z",
      filename: "patient_remission_scan.jpg",
      prediction: "notumor",
      confidence: 0.994,
      processing_time_ms: 81.2,
      heatmap_filename: "",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders off-canvas when isOpen is false without backdrop", () => {
    (api.getHistory as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      [],
    );

    render(<PatientArchiveDrawer isOpen={false} onClose={vi.fn()} />);

    const drawer = screen.getByTestId("patient-archive-drawer");
    expect(drawer).toHaveClass("translate-x-full");
    expect(
      screen.queryByTestId("archive-drawer-backdrop")
    ).not.toBeInTheDocument();
  });

  it("renders visible drawer with backdrop when isOpen is true", async () => {
    (api.getHistory as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      sampleHistory,
    );

    render(<PatientArchiveDrawer isOpen={true} onClose={vi.fn()} />);

    const drawer = screen.getByTestId("patient-archive-drawer");
    expect(drawer).toHaveClass("translate-x-0");
    expect(screen.getByTestId("archive-drawer-backdrop")).toBeInTheDocument();
    expect(screen.getByText("Prediction History")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("patient_glioma_scan.png")).toBeInTheDocument();
      expect(
        screen.getByText("patient_remission_scan.jpg")
      ).toBeInTheDocument();
      expect(screen.getByText("96.2%")).toBeInTheDocument();
      expect(screen.getByText("99.4%")).toBeInTheDocument();
    });
  });

  it("calls onClose when close 'X' button is clicked", () => {
    (api.getHistory as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      [],
    );
    const onCloseMock = vi.fn();

    render(<PatientArchiveDrawer isOpen={true} onClose={onCloseMock} />);

    const closeBtn = screen.getByRole("button", {
      name: /Close archive drawer/i,
    });
    fireEvent.click(closeBtn);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop scrim is clicked", () => {
    (api.getHistory as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      [],
    );
    const onCloseMock = vi.fn();

    render(<PatientArchiveDrawer isOpen={true} onClose={onCloseMock} />);

    const backdrop = screen.getByTestId("archive-drawer-backdrop");
    fireEvent.click(backdrop);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    (api.getHistory as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      [],
    );
    const onCloseMock = vi.fn();

    render(<PatientArchiveDrawer isOpen={true} onClose={onCloseMock} />);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("refetches history when filter is changed", async () => {
    (api.getHistory as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      sampleHistory,
    );

    render(<PatientArchiveDrawer isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(api.getHistory).toHaveBeenCalledTimes(1);
    });

    const classSelect = screen.getByLabelText(/Filter by Class/i);
    fireEvent.change(classSelect, { target: { value: "glioma" } });

    await waitFor(() => {
      expect(api.getHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          prediction: "glioma",
        })
      );
    });
  });
});
