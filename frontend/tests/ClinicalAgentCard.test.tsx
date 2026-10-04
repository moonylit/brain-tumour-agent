import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClinicalAgentCard from "../components/ClinicalAgentCard";
import { AgentResearch } from "../lib/api";

describe("ClinicalAgentCard Component", () => {
  const mockResearchGlioma: AgentResearch = {
    status: "escalation_recommended",
    tumor_class: "Glioma",
    confidence: 0.985,
    patient_city: "Jaipur",
    escalation_required: true,
    clinical_summary:
      "Presumptive Glioma detected with 98.5% confidence. Multidisciplinary surgical and radiation oncology evaluation indicated.",
    articles: [
      {
        title: "NCCN Central Nervous System Cancers (Glioma) Clinical Practice Guidelines",
        snippet: "First-line standard of care involves maximal safe surgical resection followed by concurrent temozolomide chemoradiotherapy.",
        url: "https://pubmed.ncbi.nlm.nih.gov/33227768/",
        source: "NCCN / PubMed",
      },
      {
        title: "Clinical Trial NCT04145115: Immunotherapeutic Dendritic Cell Vaccines in Newly Diagnosed Malignant Glioma",
        snippet: "Phase II trial evaluating autologous tumor lysate-loaded dendritic cells combined with adjuvant temozolomide.",
        url: "https://clinicaltrials.gov/study/NCT04145115",
        source: "ClinicalTrials.gov",
      },
    ],
    facilities: [
      {
        name: "Bhagwan Mahaveer Cancer Hospital & Research Centre (BMCHRC)",
        rating: 4.7,
        address: "Jawaharlal Nehru Marg, Bajaj Nagar, Jaipur, Rajasthan 302015",
        phone: "+91 141 270 0107",
        link: "https://www.bmchrc.org",
      },
      {
        name: "SMS Medical College & Hospital Neuro-Oncology",
        rating: 4.5,
        address: "JLN Marg, Jaipur, Rajasthan 302004",
        phone: "+91 141 251 8222",
        link: "https://medicaleducation.rajasthan.gov.in/smsjaipur",
      },
    ],
    queries_executed: [
      "Glioma standard of care NCCN guidelines PubMed",
      "tertiary neuro oncology cancer hospital surgical center Jaipur",
    ],
    timestamp: "2026-10-04T12:00:00Z",
  };

  const mockResearchNormal: AgentResearch = {
    status: "baseline_normal",
    tumor_class: "No Tumor",
    confidence: 0.99,
    patient_city: "Jaipur",
    escalation_required: false,
    clinical_summary:
      "Reassuring baseline neuro-imaging findings: No intracranial mass lesion or acute space-occupying neoplasm detected.",
    articles: [
      {
        title: "ACR Appropriateness Criteria: Normal Neuroimaging and Headache",
        snippet: "In patients with normal intracranial MRI scans, conservative primary care management is advised.",
        url: "https://pubmed.ncbi.nlm.nih.gov/31685244/",
        source: "JACR",
      },
    ],
    facilities: [],
    queries_executed: [],
    timestamp: "2026-10-04T12:00:00Z",
  };

  it("renders pending message when research is undefined", () => {
    render(<ClinicalAgentCard prediction="glioma" />);
    expect(
      screen.getByText(/Autonomous Clinical Agent research pending or unavailable/i),
    ).toBeInTheDocument();
  });

  it("renders loading skeleton when loading prop is true", () => {
    const { container } = render(
      <ClinicalAgentCard prediction="glioma" loading={true} />,
    );
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders escalation badge, clinical summary, and articles for glioma scan", () => {
    render(
      <ClinicalAgentCard
        prediction="glioma"
        research={mockResearchGlioma}
      />,
    );

    expect(screen.getByText("Escalation Recommended")).toBeInTheDocument();
    expect(screen.getByText("SerpApi AI Agent (Track 01)")).toBeInTheDocument();
    expect(
      screen.getByText(/Presumptive Glioma detected with 98.5% confidence/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/NCCN Central Nervous System Cancers \(Glioma\) Clinical Practice Guidelines/i),
    ).toBeInTheDocument();
  });

  it("switches to Regional Care Centers tab and displays hospital cards", async () => {
    const user = userEvent.setup();
    render(
      <ClinicalAgentCard
        prediction="glioma"
        research={mockResearchGlioma}
      />,
    );

    const facilitiesTab = screen.getByRole("button", {
      name: /Regional Care Centers/i,
    });
    await user.click(facilitiesTab);

    expect(
      screen.getByText("Bhagwan Mahaveer Cancer Hospital & Research Centre (BMCHRC)"),
    ).toBeInTheDocument();
    expect(screen.getByText("★ 4.7")).toBeInTheDocument();
    expect(
      screen.getByText(/Jawaharlal Nehru Marg, Bajaj Nagar, Jaipur/i),
    ).toBeInTheDocument();
  });

  it("renders reassuring baseline guidance when scan is normal", () => {
    render(
      <ClinicalAgentCard
        prediction="notumor"
        research={mockResearchNormal}
      />,
    );

    expect(screen.getByText("Baseline Guidance")).toBeInTheDocument();
    expect(
      screen.getByText(/Reassuring baseline neuro-imaging findings/i),
    ).toBeInTheDocument();
  });

  it("toggles autonomous queries breakdown view", async () => {
    const user = userEvent.setup();
    render(
      <ClinicalAgentCard
        prediction="glioma"
        research={mockResearchGlioma}
      />,
    );

    const toggleBtn = screen.getByText(/2 Autonomous SerpApi Queries Dispatched/i);
    await user.click(toggleBtn);

    expect(
      screen.getByText("Glioma standard of care NCCN guidelines PubMed"),
    ).toBeInTheDocument();
  });
});
