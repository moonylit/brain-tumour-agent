import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HistoryCard from "../components/HistoryCard";
import * as api from "../lib/api";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return {
    ...actual,
    getHistory: vi.fn(),
  };
});

describe("HistoryCard Component", () => {
  const sampleHistory: api.HistoryItem[] = [
    {
      timestamp: "2026-03-28T10:00:00.000Z",
      filename: "patient_glioma.png",
      prediction: "glioma",
      confidence: 0.954,
      processing_time_ms: 110.5,
      heatmap_filename: "heatmap_glioma.png",
    },
    {
      timestamp: "2026-03-28T10:05:00.000Z",
      filename: "patient_normal.jpg",
      prediction: "notumor",
      confidence: 0.991,
      processing_time_ms: 85.2,
      heatmap_filename: "",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches history on mount and renders records with badges and details", async () => {
    (api.getHistory as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      sampleHistory,
    );

    render(<HistoryCard />);

    expect(screen.getByText("Prediction History")).toBeInTheDocument();

    await waitFor(() => {
      expect(api.getHistory).toHaveBeenCalledWith({
        sort: "desc",
        limit: 10,
      });
    });

    expect(await screen.findByText("patient_glioma.png")).toBeInTheDocument();
    expect(screen.getByText("patient_normal.jpg")).toBeInTheDocument();
    expect(screen.getByText("95.40%")).toBeInTheDocument();
    expect(screen.getByText("99.10%")).toBeInTheDocument();
    expect(screen.getByText("110.50 ms")).toBeInTheDocument();
    expect(screen.getByText("85.20 ms")).toBeInTheDocument();
    expect(screen.getByText("No map")).toBeInTheDocument();
  });

  it("renders empty state when no history records are returned", async () => {
    (api.getHistory as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

    render(<HistoryCard />);

    expect(
      await screen.findByText("No prediction history found"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Upload an MRI scan to generate your first prediction/i),
    ).toBeInTheDocument();
  });

  it("handles filter changes: class, sort order, and limit", async () => {
    (api.getHistory as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      sampleHistory,
    );

    render(<HistoryCard />);

    await waitFor(() => {
      expect(api.getHistory).toHaveBeenCalledWith({ sort: "desc", limit: 10 });
    });

    // Change Class Filter
    const classSelect = screen.getByDisplayValue("All Classes");
    fireEvent.change(classSelect, { target: { value: "glioma" } });

    await waitFor(() => {
      expect(api.getHistory).toHaveBeenCalledWith({
        prediction: "glioma",
        sort: "desc",
        limit: 10,
      });
    });

    // Change Sort Order
    const sortSelect = screen.getByDisplayValue("Newest First (Desc)");
    fireEvent.change(sortSelect, { target: { value: "asc" } });

    await waitFor(() => {
      expect(api.getHistory).toHaveBeenCalledWith({
        prediction: "glioma",
        sort: "asc",
        limit: 10,
      });
    });

    // Change Limit to 5
    const limitSelect = screen.getByDisplayValue("10 records");
    fireEvent.change(limitSelect, { target: { value: "5" } });

    await waitFor(() => {
      expect(api.getHistory).toHaveBeenCalledWith({
        prediction: "glioma",
        sort: "asc",
        limit: 5,
      });
    });
  });

  it("opens and closes full heatmap modal on thumbnail click", async () => {
    (api.getHistory as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      sampleHistory,
    );

    render(<HistoryCard />);

    const thumbnail = await screen.findByAltText(
      "Heatmap for patient_glioma.png",
    );
    fireEvent.click(thumbnail);

    expect(
      await screen.findByText("Grad-CAM Explainability Heatmap"),
    ).toBeInTheDocument();
    expect(screen.getByText("Open in New Tab")).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: /close modal/i });
    fireEvent.click(closeBtn);

    expect(
      screen.queryByText("Grad-CAM Explainability Heatmap"),
    ).not.toBeInTheDocument();
  });

  it("handles fetch error and allows retry via Try Again button", async () => {
    const user = userEvent.setup();
    (api.getHistory as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Failed to connect to history endpoint"),
    );

    render(<HistoryCard />);

    expect(
      await screen.findByText("Error loading prediction history"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Failed to connect to history endpoint"),
    ).toBeInTheDocument();

    (api.getHistory as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      sampleHistory,
    );

    const retryBtn = screen.getByRole("button", { name: /Try Again/i });
    await user.click(retryBtn);

    expect(
      await screen.findByText("patient_glioma.png"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Error loading prediction history"),
    ).not.toBeInTheDocument();
  });
});
