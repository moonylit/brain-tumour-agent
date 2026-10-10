import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PdfReportTemplate from "../components/PdfReportTemplate";

describe("PdfReportTemplate Component", () => {
  const defaultProps = {
    prediction: "glioma",
    confidence: 0.9856,
    probabilities: {
      glioma: 0.9856,
      meningioma: 0.0084,
      pituitary: 0.004,
      notumor: 0.002,
    },
    processingTime: 125.45,
    region: "Jaipur",
  };

  it("renders the co-branded BrAIny x SerpApi header block", () => {
    render(<PdfReportTemplate {...defaultProps} />);

    expect(screen.getByRole("heading", { level: 1, name: /BrAIny/i })).toBeInTheDocument();
    expect(screen.getByText("SerpApi")).toBeInTheDocument();
    expect(screen.getByText("✕")).toBeInTheDocument();
  });

  it("formats and displays report time in Indian Standard Time (IST)", () => {
    render(<PdfReportTemplate {...defaultProps} />);

    expect(screen.getByText(/IST$/)).toBeInTheDocument();
  });

  it("renders the Quantitative Softmax Probabilities table with styled rows and highlighted primary class", () => {
    const { container } = render(<PdfReportTemplate {...defaultProps} />);

    expect(
      screen.getByText("Quantitative Softmax Probabilities & Risk Stratification")
    ).toBeInTheDocument();

    // Verify table elements with Tailwind classes
    const wrapper = container.querySelector(".overflow-hidden.rounded-xl.border.border-slate-200");
    expect(wrapper).toBeInTheDocument();

    const table = container.querySelector("table.w-full.text-sm.text-left.text-slate-600.border-collapse");
    expect(table).toBeInTheDocument();

    const thead = container.querySelector("thead.text-xs.text-slate-500.uppercase.bg-slate-50");
    expect(thead).toBeInTheDocument();

    // Verify highlighted row for primary prediction (glioma)
    const highlightedRow = container.querySelector("tr.bg-blue-50\\/50.border-b.border-blue-100.font-bold.text-slate-900");
    expect(highlightedRow).toBeInTheDocument();
    expect(highlightedRow?.textContent).toContain("Glioma");
  });

  it("renders clinical disclaimer at the bottom", () => {
    render(<PdfReportTemplate {...defaultProps} />);

    expect(
      screen.getByText(/CLINICAL DISCLAIMER:/i)
    ).toBeInTheDocument();
  });
});
