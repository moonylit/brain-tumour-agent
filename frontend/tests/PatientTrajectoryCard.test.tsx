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
    expect(screen.getByText("Upload First MRI Scan")).toBeInTheDocument();
    expect(
      screen.getByText("Initialize trajectory for new patient")
    ).toBeInTheDocument();
    const uploadBtn = screen.getByRole("button", { name: /Select MRI File/i });
    expect(uploadBtn).toBeInTheDocument();

    // Hidden file input exists
    const fileInput = document.getElementById("historical-mri-upload");
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute("type", "file");
    expect(fileInput).toHaveAttribute("accept", "image/*");
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
    render(<PatientTrajectoryCard activePatient="Custom" customScans={[]} />);
    const fileInput = document.getElementById(
      "historical-mri-upload"
    ) as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    const clickSpy = vi.spyOn(fileInput, "click");

    const uploadBtn = screen.getByRole("button", { name: /Select MRI File/i });
    fireEvent.click(uploadBtn);

    expect(clickSpy).toHaveBeenCalled();
  });

  it("adds new scan to customScans on file upload change", () => {
    vi.useFakeTimers();
    const setScansMock = vi.fn();
    render(
      <PatientTrajectoryCard
        activePatient="Custom"
        customScans={[]}
        setCustomScans={setScansMock}
      />
    );

    const fileInput = document.getElementById(
      "historical-mri-upload"
    ) as HTMLInputElement;
    const testFile = new File(["dummy content"], "brain_scan.png", {
      type: "image/png",
    });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    vi.advanceTimersByTime(650);

    expect(setScansMock).toHaveBeenCalledTimes(1);
    const updater = setScansMock.mock.calls[0][0];
    const updatedState = updater([]);
    expect(updatedState).toHaveLength(1);
    expect(updatedState[0].area).toBeGreaterThanOrEqual(1500);
    expect(updatedState[0].forecastArea).toBeNull();
    expect(updatedState[0].type).toBe("Observed");
    expect(updatedState[0].prediction).toBe("Meningioma (Grade II)");
    expect(updatedState[0].imagePreview).toBeDefined();

    vi.useRealTimers();
  });

  it("prioritizes gradCamUrl over local image when provided", () => {
    vi.useFakeTimers();
    const setScansMock = vi.fn();
    render(
      <PatientTrajectoryCard
        activePatient="Custom"
        gradCamUrl="https://api.neuroagent.org/heatmaps/gradcam_sample.png"
        predictionResult="Glioblastoma (Grade IV)"
        customScans={[]}
        setCustomScans={setScansMock}
      />
    );

    const fileInput = document.getElementById(
      "historical-mri-upload"
    ) as HTMLInputElement;
    const testFile = new File(["dummy content"], "brain_scan.png", {
      type: "image/png",
    });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    vi.advanceTimersByTime(650);

    expect(setScansMock).toHaveBeenCalledTimes(1);
    const updater = setScansMock.mock.calls[0][0];
    const updatedState = updater([]);
    expect(updatedState[0].prediction).toBe("Glioblastoma (Grade IV)");
    expect(updatedState[0].imagePreview).toBe(
      "https://api.neuroagent.org/heatmaps/gradcam_sample.png"
    );

    vi.useRealTimers();
  });

  it("renders dynamic Recharts graph, Patient MRI Log gallery with images and predictions, follow-up button, and triggers stitched trajectory prediction for Custom patient with scans", () => {
    const mockScans = [
      {
        date: "Oct 10",
        area: 2400,
        forecastArea: null,
        type: "Observed",
        imagePreview: "blob:http://localhost/scan1.png",
        prediction: "Meningioma",
      },
    ];
    const setScansMock = vi.fn();

    render(
      <PatientTrajectoryCard
        activePatient="Custom"
        customScans={mockScans}
        setCustomScans={setScansMock}
      />
    );

    // Custom Patient MRI Log gallery
    expect(screen.getByText("Patient MRI Log")).toBeInTheDocument();
    expect(screen.getByText(/SCAN 01 • Oct 10/i)).toBeInTheDocument();
    expect(screen.getByText("Meningioma")).toBeInTheDocument();
    const scanImg = screen.getByAltText("Scan 01");
    expect(scanImg).toBeInTheDocument();
    expect(scanImg).toHaveAttribute("src", "blob:http://localhost/scan1.png");

    // Recharts container buttons
    const followUpBtn = screen.getByRole("button", {
      name: /\+ Add Follow-up Scan/i,
    });
    expect(followUpBtn).toBeInTheDocument();

    const fileInput = document.getElementById(
      "historical-mri-upload"
    ) as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    const clickSpy = vi.spyOn(fileInput, "click");
    fireEvent.click(followUpBtn);
    expect(clickSpy).toHaveBeenCalled();

    const forecastBtn = screen.getByRole("button", {
      name: /Predict Trajectory/i,
    });
    expect(forecastBtn).toBeInTheDocument();

    // Click forecast button to trigger stitched AI trajectory
    fireEvent.click(forecastBtn);
    expect(setScansMock).toHaveBeenCalledTimes(1);

    const updatedScans = setScansMock.mock.calls[0][0];
    expect(updatedScans).toHaveLength(2);
    // Anchored / stitched to last observed point
    expect(updatedScans[0].forecastArea).toBe(2400);
    // Future forecast point
    expect(updatedScans[1].date).toBe("Forecast (+3M)");
    expect(updatedScans[1].area).toBeNull();
    expect(updatedScans[1].type).toBe("AI Forecast");
    expect(updatedScans[1].forecastArea).toBeGreaterThanOrEqual(2400);
  });

  it("renders Historical Scans Log gallery with mock images, specific predictions, and follow-up button for demo patients", () => {
    render(<PatientTrajectoryCard activePatient="Eleanor Vance" />);

    expect(screen.getByText("Historical Scans Log")).toBeInTheDocument();
    expect(screen.getByText(/SCAN 01 • Jan 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/SCAN 02 • May 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/SCAN 03 • Aug 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/SCAN 04 • Oct 2026/i)).toBeInTheDocument();
    expect(screen.getAllByText("Glioblastoma")).toHaveLength(4);
    expect(screen.getByAltText("Scan 1")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /\+ Attach Follow-up Scan/i })
    ).toBeInTheDocument();
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


