import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Stats from "../components/Stats";
import * as api from "../lib/api";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return {
    ...actual,
    getStatistics: vi.fn(),
  };
});

describe("Stats Component", () => {
  const mockStatsData: api.StatisticsResponse = {
    total_predictions: 142,
    average_confidence: 0.946,
    average_processing_time_ms: 1250,
    class_distribution: {
      glioma: 50,
      meningioma: 40,
      pituitary: 30,
      notumor: 22,
    },
    class_percentages: {
      glioma: 35.2,
      meningioma: 28.2,
      pituitary: 21.1,
      notumor: 15.5,
    },
    most_common_prediction: "glioma",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders heading and description", async () => {
    (api.getStatistics as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockStatsData,
    );

    render(<Stats />);

    expect(
      screen.getByText("Prediction Statistics & Analytics"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Aggregated analytics computed in real-time from inference history/i,
      ),
    ).toBeInTheDocument();
  });

  it("fetches and renders all 4 metric cards and class distribution", async () => {
    (api.getStatistics as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockStatsData,
    );

    render(<Stats />);

    await waitFor(() => {
      expect(api.getStatistics).toHaveBeenCalledTimes(1);
    });

    // Check primary metric cards
    expect(await screen.findByText("142")).toBeInTheDocument();
    expect(screen.getByText("Total Predictions")).toBeInTheDocument();

    expect(screen.getByText("94.6%")).toBeInTheDocument();
    expect(screen.getByText("Average Confidence")).toBeInTheDocument();

    expect(screen.getByText("1.25s")).toBeInTheDocument();
    expect(screen.getByText("Average Inference")).toBeInTheDocument();

    expect(screen.getAllByText("Glioma").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Most Common Class")).toBeInTheDocument();

    // Check class breakdown section
    expect(
      screen.getByText("Class Distribution & Percentages"),
    ).toBeInTheDocument();
    expect(screen.getByText("50 scans")).toBeInTheDocument();
    expect(screen.getByText("35.2%")).toBeInTheDocument();
    expect(screen.getByText("40 scans")).toBeInTheDocument();
    expect(screen.getByText("28.2%")).toBeInTheDocument();
    expect(screen.getByText("30 scans")).toBeInTheDocument();
    expect(screen.getByText("21.1%")).toBeInTheDocument();
    expect(screen.getByText("22 scans")).toBeInTheDocument();
    expect(screen.getByText("15.5%")).toBeInTheDocument();
  });

  it("handles backend error and retries upon clicking Retry Connection", async () => {
    const user = userEvent.setup();
    (api.getStatistics as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Database connection error"),
    );

    render(<Stats />);

    expect(
      await screen.findByText("Failed to load statistics from backend"),
    ).toBeInTheDocument();
    expect(screen.getByText("Database connection error")).toBeInTheDocument();

    (api.getStatistics as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockStatsData,
    );

    const retryBtn = screen.getByRole("button", { name: /Retry Connection/i });
    await user.click(retryBtn);

    expect(await screen.findByText("142")).toBeInTheDocument();
    expect(
      screen.queryByText("Failed to load statistics from backend"),
    ).not.toBeInTheDocument();
  });
});
