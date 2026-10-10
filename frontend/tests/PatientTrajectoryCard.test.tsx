import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import PatientTrajectoryCard, {
  getDynamicTrajectoryData,
} from "../components/PatientTrajectoryCard";

describe("PatientTrajectoryCard Component", () => {
  it("renders patient profile heading for Eleanor Vance", () => {
    render(<PatientTrajectoryCard activePatient="Eleanor Vance" />);

    expect(
      screen.getByText(/Patient Profile: Eleanor Vance/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Record Validated")).toBeInTheDocument();
    expect(screen.getByText("Active Longitudinal Tracking")).toBeInTheDocument();
  });

  it("renders patient profile heading for Marcus Webb with specific diagnosis", () => {
    render(<PatientTrajectoryCard activePatient="Marcus Webb" />);

    expect(
      screen.getByText(/Patient Profile: Marcus Webb/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Oligodendroglioma")).toBeInTheDocument();
    expect(screen.getByText("MRN-49103")).toBeInTheDocument();
  });

  it("dynamically generates trajectory dates relative to current calendar without hardcoding", () => {
    const { trajectoryData, anchorDate } =
      getDynamicTrajectoryData("Eleanor Vance");

    expect(trajectoryData).toHaveLength(5);

    // Verify format of dates is dynamic Month 'YY
    const dateRegex = /^[A-Z][a-z]{2}\s'\d{2}$/;
    trajectoryData.forEach((point) => {
      expect(point.date).toMatch(dateRegex);
    });

    // Anchor point must have both area and predicted equal
    const anchorPoint = trajectoryData[2];
    expect(anchorPoint.date).toBe(anchorDate);
    expect(anchorPoint.area).toBe(8900);
    expect(anchorPoint.predicted).toBe(8900);

    // Baseline points have area and null predicted
    expect(trajectoryData[0].area).toBe(1200);
    expect(trajectoryData[0].predicted).toBeNull();
    expect(trajectoryData[1].area).toBe(3400);
    expect(trajectoryData[1].predicted).toBeNull();

    // Future points have null area and predicted
    expect(trajectoryData[3].area).toBeNull();
    expect(trajectoryData[3].predicted).toBe(14200);
    expect(trajectoryData[4].area).toBeNull();
    expect(trajectoryData[4].predicted).toBe(21000);
  });

  it("renders custom text input and placeholder when activePatient is Custom", () => {
    render(<PatientTrajectoryCard activePatient="Custom" />);

    const input = screen.getByPlaceholderText("Enter New Patient Name...");
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "John Doe" } });
    expect(input).toHaveValue("John Doe");

    expect(
      screen.getByText(
        "Upload historical MRI scans to generate longitudinal trajectory for new patient."
      )
    ).toBeInTheDocument();
  });

  it("renders Historical Scans Log gallery with scans and follow-up button for demo patients", () => {
    render(<PatientTrajectoryCard activePatient="Eleanor Vance" />);

    expect(screen.getByText("Historical Scans Log")).toBeInTheDocument();
    expect(screen.getByText("SCAN 01")).toBeInTheDocument();
    expect(screen.getByText("SCAN 02")).toBeInTheDocument();
    expect(screen.getByText("SCAN 03")).toBeInTheDocument();
    expect(screen.getByText("SCAN 04")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\+ Attach Follow-up Scan/i })).toBeInTheDocument();
  });

  it("calls onSelectPatient callback when a different patient is chosen from dropdown", () => {
    const onSelect = vi.fn();
    render(
      <PatientTrajectoryCard
        activePatient="Eleanor Vance"
        onSelectPatient={onSelect}
      />
    );

    const dropdown = screen.getByRole("combobox");
    expect(dropdown).toHaveValue("Eleanor Vance");

    fireEvent.change(dropdown, { target: { value: "Marcus Webb" } });
    expect(onSelect).toHaveBeenCalledWith("Marcus Webb");
  });
});


