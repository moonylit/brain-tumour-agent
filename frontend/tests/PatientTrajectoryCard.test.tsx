import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import PatientTrajectoryCard, {
  getDynamicTrajectoryData,
} from "../components/PatientTrajectoryCard";

describe("PatientTrajectoryCard Component", () => {
  it("renders patient profile heading and demo badges for Eleanor Vance", () => {
    render(<PatientTrajectoryCard activePatient="Eleanor Vance" />);

    expect(
      screen.getByText(/Patient Profile: Eleanor Vance/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Record Validated")).toBeInTheDocument();
    expect(screen.getByText("MRN-DEMO")).toBeInTheDocument();
    expect(screen.getByText("Historical Demo Data")).toBeInTheDocument();
  });

  it("renders patient profile heading for Marcus Webb with demo badges", () => {
    render(<PatientTrajectoryCard activePatient="Marcus Webb" />);

    expect(
      screen.getByText(/Patient Profile: Marcus Webb/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Record Validated")).toBeInTheDocument();
    expect(screen.getByText("MRN-DEMO")).toBeInTheDocument();
    expect(screen.getByText("Historical Demo Data")).toBeInTheDocument();
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

  it("renders custom text input and interactive upload dropzone when activePatient is Custom without scans", () => {
    render(<PatientTrajectoryCard activePatient="Custom" customScans={[]} />);

    // Custom patient input
    const input = screen.getByPlaceholderText("Enter New Patient Name...");
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "John Doe" } });
    expect(input).toHaveValue("John Doe");

    // Badges must be hidden / absent
    expect(screen.queryByText("Record Validated")).not.toBeInTheDocument();
    expect(screen.queryByText("MRN-DEMO")).not.toBeInTheDocument();
    expect(screen.queryByText("Historical Demo Data")).not.toBeInTheDocument();
    expect(screen.queryByText("New Record Active")).not.toBeInTheDocument();

    // Dropzone content
    expect(screen.getByText("Upload Baseline MRI Scan")).toBeInTheDocument();
    const uploadBtn = screen.getByRole("button", { name: /Select MRI File/i });
    expect(uploadBtn).toBeInTheDocument();
  });

  it("renders live prediction badges when activePatient is Custom and predictionResult is present", () => {
    render(
      <PatientTrajectoryCard
        activePatient="Custom"
        predictionResult="Meningioma"
      />
    );

    expect(screen.getByText("New Record Active")).toBeInTheDocument();
    expect(screen.getByText("Meningioma")).toBeInTheDocument();
    expect(screen.queryByText("MRN-DEMO")).not.toBeInTheDocument();
  });

  it("triggers file input click when clicking Select MRI File button", () => {
    const hiddenInput = document.createElement("input");
    hiddenInput.type = "file";
    hiddenInput.id = "mri-upload-input";
    const clickSpy = vi.spyOn(hiddenInput, "click");
    document.body.appendChild(hiddenInput);

    render(<PatientTrajectoryCard activePatient="Custom" customScans={[]} />);
    const uploadBtn = screen.getByRole("button", { name: /Select MRI File/i });
    fireEvent.click(uploadBtn);

    expect(clickSpy).toHaveBeenCalled();
    document.body.removeChild(hiddenInput);
  });

  it("renders dynamic Recharts graph, follow-up button, and triggers future forecast prediction for Custom patient with scans", () => {
    const mockScans = [
      { date: "Oct 10", area: 2400, forecastArea: null, type: "Observed" },
    ];
    const setScansMock = vi.fn();

    render(
      <PatientTrajectoryCard
        activePatient="Custom"
        customScans={mockScans}
        setCustomScans={setScansMock}
      />
    );

    // Recharts container buttons
    expect(
      screen.getByRole("button", { name: /\+ Add Follow-up Scan/i })
    ).toBeInTheDocument();
    const forecastBtn = screen.getByRole("button", {
      name: /Predict Future Trajectory/i,
    });
    expect(forecastBtn).toBeInTheDocument();

    // Click forecast button to trigger AI trajectory
    fireEvent.click(forecastBtn);
    expect(setScansMock).toHaveBeenCalled();
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


