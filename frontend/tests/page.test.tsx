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
    downloadReport: vi.fn().mockResolvedValue(undefined),
  };
});

describe("Page Integration (app/page.tsx)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders full-screen clinical command center layout without crashing", async () => {
    render(<Home />);

    // Header branding
    expect(screen.getByText("NeuroAgent")).toBeInTheDocument();
    expect(screen.getByText("Clinical Oncology Suite")).toBeInTheDocument();

    // Patient Command Module
    expect(screen.getByRole("button", { name: /Select Patient/i })).toBeInTheDocument();
    expect(screen.getByText(/Add New Patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload MRI Scan/i)).toBeInTheDocument();

    // System Metrics & Action Buttons
    expect(screen.getByText(/System Metrics/i)).toBeInTheDocument();
    expect(screen.getAllByText(/View Scan Archive/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Export PDF/i)).toBeInTheDocument();

    // 2D Axial MRI Scan Visualizer
    expect(screen.getByText("2D Axial MRI Analysis")).toBeInTheDocument();
    expect(screen.getByText(/px Area \(estimated\)/i)).toBeInTheDocument();

    // Longitudinal Progression & Predictive Graph
    expect(screen.getByText(/Estimated Lesion Area Progression/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulate Future Growth/i)).toBeInTheDocument();

    // Regional Referral & Geospatial Catchment Route
    expect(screen.getByText("Regional Referral & Catchment Route")).toBeInTheDocument();
    expect(screen.getAllByText(/SMS Medical College & Hospital/i).length).toBeGreaterThanOrEqual(1);
  });
});
