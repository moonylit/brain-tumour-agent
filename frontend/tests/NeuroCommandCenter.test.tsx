import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NeuroCommandCenter from "../components/NeuroCommandCenter";

describe("NeuroCommandCenter Component", () => {
  it("renders 3-panel command center with patient directory, timeline, and geospatial triage", () => {
    render(<NeuroCommandCenter />);

    // Top Bar & Patient Directory
    expect(screen.getByText("NeuroAgent")).toBeInTheDocument();
    expect(screen.getAllByText("Eleanor Vance").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Severity: Significant")).toBeInTheDocument();

    // 2D Axial MRI Scan Visualizer & Sub-metrics
    expect(screen.getByText("2D Axial MRI Analysis")).toBeInTheDocument();
    expect(screen.getByText(/px Area \(estimated\)/i)).toBeInTheDocument();

    // Longitudinal Progression & Timeline
    expect(
      screen.getByText(/Estimated Lesion Area Progression/i)
    ).toBeInTheDocument();

    // Regional Referral & Catchment Route
    expect(
      screen.getByText("Regional Referral & Catchment Route")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Referral Rec: High-Priority Routing/i)
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/SMS Medical College & Hospital/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/Request Referral/i)
    ).toBeInTheDocument();
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
      screen.getByText("Severity: Nominal")
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
    expect(screen.getByText(/5 Timed Scans/i)).toBeInTheDocument();
  });

  it("triggers onOpenArchive callback when View Scan Archive button is clicked", () => {
    const onOpenArchiveMock = vi.fn();
    render(<NeuroCommandCenter onOpenArchive={onOpenArchiveMock} />);

    const archiveButtons = screen.getAllByRole("button", {
      name: /View Scan Archive/i,
    });
    expect(archiveButtons.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(archiveButtons[0]);
    expect(onOpenArchiveMock).toHaveBeenCalledTimes(1);
  });
});
