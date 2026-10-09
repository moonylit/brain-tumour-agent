"use client";

import { useState } from "react";
import {
  predictMRI,
  PredictionResponse,
  formatApiError,
} from "@/lib/api";

import PredictionCard from "./PredictionCard";
import HistoryCard from "./HistoryCard";
import RegionSelector from "./RegionSelector";
import { Upload, Sparkles, AlertTriangle, X } from "lucide-react";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

interface UploadCardProps {
  region?: string;
  onRegionChange?: (region: string) => void;
}

export default function UploadCard({
  region: propRegion,
  onRegionChange,
}: UploadCardProps = {}) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [localRegion, setLocalRegion] = useState("Jaipur");
  const region = propRegion !== undefined ? propRegion : localRegion;

  function handleRegionChange(newRegion: string) {
    setLocalRegion(newRegion);
    onRegionChange?.(newRegion);
  }

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [result, setResult] = useState<PredictionResponse | null>(null);

  function validateFile(file: File): string | null {
    if (!file) {
      return "Please select an MRI image file before predicting.";
    }
    if (file.size === 0) {
      return "The selected image file is empty (0 bytes). Please select a valid MRI image.";
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum allowed limit of 10 MB.`;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Unsupported image format (${file.type || "unknown"}). Only JPG and PNG MRI scans are supported.`;
    }
    return null;
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    setErrorMessage(null);
    const file = event.target.files?.[0];

    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      setSelectedImage(null);
      setPreview(null);
      return;
    }

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setErrorMessage(null);
  }

  async function handleUpload() {
    if (!selectedImage) {
      setErrorMessage("Please select an MRI image file first.");
      return;
    }

    const validationError = validateFile(selectedImage);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      // Send MRI for real model prediction & SerpApi agent research with dynamic region
      const targetRegion = region && region.trim() ? region.trim() : "Jaipur";
      const predictionData =
        targetRegion.toLowerCase() === "jaipur"
          ? await predictMRI(selectedImage)
          : await predictMRI(selectedImage, targetRegion);

      setResult(predictionData);

      // Trigger history & stats refresh
      setRefreshTrigger((prev) => prev + 1);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("new-prediction"));
      }
    } catch (error: unknown) {
      console.error("Prediction failed:", error);
      setErrorMessage(formatApiError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="upload" className="mx-auto max-w-[1680px] w-full px-6 sm:px-8 py-10">
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl shadow-slate-200/50 bg-white/95">
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Upload className="h-7 w-7 text-cyan-600" />
              <span>Upload MRI Scan</span>
            </h2>
            <span className="rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1 text-xs font-mono font-bold text-cyan-800 shadow-sm">
              Track 01: SerpApi Decision Agent
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 leading-relaxed max-w-4xl font-medium">
            Select a brain MRI image (JPG or PNG, max 10MB) for tumour classification, Grad-CAM explainability localization, and autonomous SerpApi clinical literature and regional hospital discovery.
          </p>
        </div>

        {/* Instant Clinical Case Preset Showcase Bar */}
        <div className="mb-8 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4.5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-600" />
              </span>
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-800">
                Live Interactive Clinical Presets
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 font-medium">
              One-click diagnostic dual-scan &amp; autonomous agent telemetry showcase
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setResult({
                  prediction: "glioma",
                  confidence: 0.9989,
                  probabilities: { glioma: 0.9989, meningioma: 0.0006, pituitary: 0.0003, notumor: 0.0002 },
                  processing_time_ms: 142.8,
                  heatmap_filename: "2d81b8a09d6d41049f358c352938ba8e.png",
                  raw_heatmap_filename: "2d81b8a09d6d41049f358c352938ba8e.png",
                  accession_id: "ACC-20261009-GLIOMA",
                  region: region || "Jaipur",
                  agent_research: {
                    status: "escalation_recommended",
                    tumor_class: "Glioma",
                    confidence: 0.9989,
                    patient_city: region || "Jaipur",
                    escalation_required: true,
                    clinical_summary: "Presumptive high-grade Glioma localized with 99.89% confidence. Marked infiltrative peritumoral edema with microvascular proliferation. Urgent stereotactic neuro-navigation and multidisciplinary oncology escalation recommended.",
                    articles: [
                      {
                        title: "NCCN Central Nervous System Cancers (Glioma) Clinical Practice Guidelines",
                        snippet: "First-line standard of care involves maximal safe surgical resection followed by concurrent temozolomide chemoradiotherapy (Stupp protocol) and tumor-treating fields.",
                        url: "https://pubmed.ncbi.nlm.nih.gov/33227768/",
                        source: "NCCN / PubMed",
                      },
                      {
                        title: "Clinical Trial NCT04145115: Immunotherapeutic Dendritic Cell Vaccines in Newly Diagnosed Malignant Glioma",
                        snippet: "Phase II trial evaluating autologous tumor lysate-loaded dendritic cells combined with adjuvant temozolomide.",
                        url: "https://clinicaltrials.gov/study/NCT04145115",
                        source: "ClinicalTrials.gov",
                      },
                      {
                        title: "WHO CNS5 Classification: Integrated Histologic & Molecular Grading of Diffuse Gliomas",
                        snippet: "Mandatory diagnostic testing for IDH1/2 mutation status and 1p/19q codeletion across adult-type diffuse astrocytomas.",
                        url: "https://pubmed.ncbi.nlm.nih.gov/34185074/",
                        source: "Neuro-Oncology",
                      },
                    ],
                    facilities: [
                      {
                        name: "Bhagwan Mahaveer Cancer Hospital & Research Centre (BMCHRC)",
                        rating: 4.8,
                        address: "Jawaharlal Nehru Marg, Bajaj Nagar, Jaipur, Rajasthan 302015",
                        phone: "+91 141 270 0107",
                        link: "https://www.bmchrc.org",
                      },
                      {
                        name: "SMS Medical College & Hospital Neuro-Oncology Division",
                        rating: 4.6,
                        address: "JLN Marg, Jaipur, Rajasthan 302004",
                        phone: "+91 141 251 8222",
                        link: "https://medicaleducation.rajasthan.gov.in/smsjaipur",
                      },
                      {
                        name: "Apex Super Speciality Hospital Neuro-Sciences Institute",
                        rating: 4.5,
                        address: "Sector 5, Malviya Nagar, Jaipur, Rajasthan 302017",
                        phone: "+91 141 275 1871",
                        link: "https://www.apexhospitals.com",
                      },
                    ],
                    queries_executed: [
                      "Glioma standard of care NCCN guidelines PubMed",
                      `tertiary neuro oncology cancer hospital surgical center ${region || "Jaipur"}`,
                    ],
                    timestamp: new Date().toISOString(),
                  },
                });
              }}
              className="tactile-button group flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/80 p-3 text-left transition shadow-sm"
            >
              <div>
                <span className="block text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  Glioblastoma (High Grade)
                </span>
                <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                  99.89% Conf • Critical Triage
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-rose-800 px-2 py-1 rounded-lg bg-rose-200/80 border border-rose-300">
                LOAD
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setResult({
                  prediction: "meningioma",
                  confidence: 0.9912,
                  probabilities: { glioma: 0.005, meningioma: 0.9912, pituitary: 0.002, notumor: 0.0018 },
                  processing_time_ms: 156.4,
                  heatmap_filename: "64f3490b953b4a918b8f927201a0db02.png",
                  raw_heatmap_filename: "64f3490b953b4a918b8f927201a0db02.png",
                  accession_id: "ACC-20261009-MENING",
                  region: region || "Jaipur",
                  agent_research: {
                    status: "escalation_recommended",
                    tumor_class: "Meningioma",
                    confidence: 0.9912,
                    patient_city: region || "Jaipur",
                    escalation_required: true,
                    clinical_summary: "Presumptive Meningioma detected with 99.12% confidence. Extra-axial mass with distinct dural tail sign. Specialized neurosurgical review advised for anatomical proximity to venous sinuses and skull base cranial nerves.",
                    articles: [
                      {
                        title: "EANO Guidelines on Diagnosis and Management of Meningiomas",
                        snippet: "Recommendations for observational vs stereotactic radiosurgery vs microsurgical resection based on tumor volume, Simpson resection grade, and WHO grading.",
                        url: "https://pubmed.ncbi.nlm.nih.gov/34351399/",
                        source: "Lancet Oncology",
                      },
                      {
                        title: "Clinical Trial NCT02693990: Dose-Escalated Proton Radiotherapy in Skull Base Meningioma",
                        snippet: "Phase II prospective investigation of precision particle therapy sparing optic and brainstem pathways.",
                        url: "https://clinicaltrials.gov/study/NCT02693990",
                        source: "ClinicalTrials.gov",
                      },
                    ],
                    facilities: [
                      {
                        name: "Bhagwan Mahaveer Cancer Hospital & Research Centre (BMCHRC)",
                        rating: 4.8,
                        address: "Jawaharlal Nehru Marg, Bajaj Nagar, Jaipur, Rajasthan 302015",
                        phone: "+91 141 270 0107",
                        link: "https://www.bmchrc.org",
                      },
                      {
                        name: "SMS Medical College & Hospital Neuro-Oncology Division",
                        rating: 4.6,
                        address: "JLN Marg, Jaipur, Rajasthan 302004",
                        phone: "+91 141 251 8222",
                        link: "https://medicaleducation.rajasthan.gov.in/smsjaipur",
                      },
                    ],
                    queries_executed: [
                      "Meningioma standard of care guidelines PubMed",
                      `tertiary neuro oncology cancer hospital surgical center ${region || "Jaipur"}`,
                    ],
                    timestamp: new Date().toISOString(),
                  },
                });
              }}
              className="tactile-button group flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/80 p-3 text-left transition shadow-sm"
            >
              <div>
                <span className="block text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Meningioma (Skull Base)
                </span>
                <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                  99.12% Conf • Radiosurgery Protocol
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-800 px-2 py-1 rounded-lg bg-amber-200/80 border border-amber-300">
                LOAD
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setResult({
                  prediction: "notumor",
                  confidence: 0.9945,
                  probabilities: { glioma: 0.001, meningioma: 0.002, pituitary: 0.0025, notumor: 0.9945 },
                  processing_time_ms: 112.3,
                  heatmap_filename: "012acdd0f35b4c309e3e6528e4fdb5f5.png",
                  raw_heatmap_filename: "012acdd0f35b4c309e3e6528e4fdb5f5.png",
                  accession_id: "ACC-20261009-NORMAL",
                  region: region || "Jaipur",
                  agent_research: {
                    status: "baseline_normal",
                    tumor_class: "No Tumor",
                    confidence: 0.9945,
                    patient_city: region || "Jaipur",
                    escalation_required: false,
                    clinical_summary: "Reassuring baseline neuroimaging: No intracranial space-occupying mass, midline shift, or pathologic focal enhancement detected. Conservative neurological follow-up advised.",
                    articles: [
                      {
                        title: "ACR Appropriateness Criteria: Headache and Normal Neuroimaging Findings",
                        snippet: "Evidence-based consensus criteria supporting conservative primary care management for patients with unremarkable brain MRI scans without focal deficits.",
                        url: "https://pubmed.ncbi.nlm.nih.gov/31685244/",
                        source: "JACR",
                      },
                    ],
                    facilities: [],
                    queries_executed: [],
                    timestamp: new Date().toISOString(),
                  },
                });
              }}
              className="tactile-button group flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 p-3 text-left transition shadow-sm"
            >
              <div>
                <span className="block text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Healthy Brain Baseline
                </span>
                <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                  99.45% Conf • Nominal Surveillance
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 px-2 py-1 rounded-lg bg-emerald-200/80 border border-emerald-300">
                LOAD
              </span>
            </button>
          </div>
        </div>

        {/* Diagnostic Ingest Dropzone & Region Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* File Upload Box (2 cols on lg) */}
          <div className="lg:col-span-2 relative group rounded-3xl border-2 border-dashed border-cyan-400/60 bg-cyan-50/20 hover:border-cyan-500 hover:bg-cyan-50/40 p-8 text-center transition-all duration-300 shadow-sm overflow-hidden">
            {/* Corner HUD Markers */}
            <div className="hud-corner hud-tl" />
            <div className="hud-corner hud-tr" />
            <div className="hud-corner hud-bl" />
            <div className="hud-corner hud-br" />

            {/* Sweeping Laser Scanner Line */}
            <div className="laser-scanner opacity-40 group-hover:opacity-100 transition duration-500" />

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-200 bg-white text-cyan-600 shadow-md group-hover:scale-105 transition duration-300">
              <Upload className="h-8 w-8" />
            </div>

            <label
              htmlFor="mri-file-input"
              className="cursor-pointer block text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              <span className="text-cyan-700 underline decoration-cyan-400 underline-offset-4 hover:decoration-cyan-600 font-bold">
                Browse neuroimaging file
              </span>{" "}
              or drag &amp; drop scan here
            </label>

            <input
              type="file"
              id="mri-file-input"
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              className="mt-4 block w-full max-w-sm mx-auto cursor-pointer text-xs text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-600 file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-white hover:file:bg-cyan-700 transition"
            />

            <p className="mt-4 text-xs font-mono text-slate-500 font-medium">
              Supported formats: JPG, PNG • Max size: 10 MB • ResNet-50 v2 224x224 Ingest
            </p>
          </div>

          {/* Region Configuration Card (1 col on lg) */}
          <div className="relative rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-cyan-600" />
              <h3 className="text-sm font-bold text-slate-800">
                Geographic Referral Routing
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">
              Target metropolitan region for autonomous hospital geolocation and tertiary surgical center referral routing:
            </p>
            <RegionSelector
              value={region}
              onChange={handleRegionChange}
              disabled={loading}
            />
          </div>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-900 shadow-sm">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <div className="flex-1 text-sm">
              <strong className="block font-bold text-rose-900">
                Action Required
              </strong>
              <span className="text-rose-800">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              aria-label="Dismiss error"
              className="rounded-lg p-1 text-slate-400 hover:bg-rose-100 hover:text-slate-700 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Selected Image Preview & Action Button */}
        {preview && (
          <div className="mt-8 rounded-3xl border border-slate-200/90 bg-slate-50/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200/60 pb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Selected Scan
              </span>
              <span className="font-mono text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                Ready for Analysis
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative overflow-hidden rounded-2xl border border-slate-300 bg-slate-950 p-2 shadow-lg">
                <img
                  src={preview}
                  alt="MRI Preview"
                  className="max-h-96 rounded-xl object-contain"
                />
              </div>

              <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-1.5 font-mono text-xs text-slate-700 border border-slate-200 shadow-sm">
                <span className="font-semibold text-slate-900">
                  {selectedImage?.name}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">
                  {((selectedImage?.size || 0) / 1024).toFixed(1)} KB
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-cyan-700 font-bold">
                  Region: {region}
                </span>
              </div>

              <button
                onClick={handleUpload}
                disabled={loading}
                className="tactile-button mt-6 inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 px-10 py-4 text-base font-bold text-white shadow-lg shadow-cyan-600/30 hover:shadow-xl hover:shadow-cyan-600/40 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent" />
                    <span>Analyzing Brain MRI &amp; Querying SerpApi...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 text-cyan-200" />
                    <span>Analyze MRI Scan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Prediction Results Display */}
        {result && (
          <PredictionCard
            prediction={result.prediction}
            confidence={result.confidence}
            probabilities={result.probabilities}
            processingTime={result.processing_time_ms}
            heatmapFilename={result.heatmap_filename}
            rawHeatmapFilename={result.raw_heatmap_filename}
            region={result.region || region}
            accessionId={result.accession_id}
            agentResearch={result.agent_research}
          />
        )}

        {/* History Component Embed */}
        <HistoryCard refreshTrigger={refreshTrigger} />
      </div>
    </section>
  );
}