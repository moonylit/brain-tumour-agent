import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NeuroCommandCenter from "../components/NeuroCommandCenter";

describe("NeuroCommandCenter Component", () => {
  it("renders 3-panel command center with patient directory, timeline, and geospatial triage", () => {
    render(<NeuroCommandCenter />);

    // Top Bar & Patient Directory
    expect(
      screen.getByText("NeuroAgent 3-Panel Diagnostic Command Center")
    ).toBeInTheDocument();
    expect(screen.getAllByText("Eleanor Vance").length).toBeGreaterThanOrEqual(1);

    // Longitudinal Progression & Timeline
    expect(
      screen.getByText("Longitudinal Volumetric Tracking")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Estimated Lesion Area Progression/i)
    ).toBeInTheDocument();

    // Geospatial Catchment Triage
    expect(
      screen.getByText("Geospatial Catchment Triage")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Route Patient via Heli-Ambulance/i)
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/SMS Medical College & Hospital/i).length
    ).toBeGreaterThanOrEqual(1);
  });

  it("switches patient records and updates clinical status", () => {
    render(<NeuroCommandCenter />);

    // Open Patient Directory dropdown
    const selectTrigger = screen.getByRole("button", { name: /Select Patient/i });
    fireEvent.click(selectTrigger);

    // Switch to Sarah Chen (Remission / Low Risk)
    const sarahBtn = screen.getByRole("button", { name: /Sarah Chen/i });
    fireEvent.click(sarahBtn);

    expect(screen.getAllByText("Sarah Chen").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Zero Recurrence (0 px)")).toBeInTheDocument();
    expect(
      screen.getByText("ROUTINE TRIAGE: STANDARD MONITORING")
    ).toBeInTheDocument();
  });

  it("appends new prediction from python backend dynamically into patient timeline", () => {
    const { rerender } = render(
      <NeuroCommandCenter latestPredictionResult={null} />
    );

    // Simulate new prediction arriving from backend
    rerender(
      <NeuroCommandCenter
        latestPredictionResult={{
          prediction: "Glioma",
          confidence: 0.992,
          heatmapFilename: "heatmap_test_01.png",
          rawHeatmapFilename: "raw_test_01.png",
          region: "Jaipur",
        }}
      />
    );

    // 5 total scans now (4 initial + 1 new)
    expect(screen.getByText("5 Timed Scans")).toBeInTheDocument();
  });
});
