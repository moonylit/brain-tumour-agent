"use client";

import { useState } from "react";
import {
  predictMRI,
  PredictionResponse,
  formatApiError,
} from "@/lib/api";

import PredictionCard from "./PredictionCard";
import HistoryCard from "./HistoryCard";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export default function UploadCard() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [patientCity, setPatientCity] = useState("Jaipur");
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

      // Send MRI for real model prediction & SerpApi agent research
      const predictionData =
        patientCity && patientCity.trim() !== "" && patientCity.trim().toLowerCase() !== "jaipur"
          ? await predictMRI(selectedImage, patientCity.trim())
          : await predictMRI(selectedImage);

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
    <section id="upload" className="mx-auto max-w-5xl px-6 sm:px-8 py-12">
      <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/[0.08]">
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Upload MRI Scan
            </h2>
            <span className="rounded-full border border-sky-400/30 bg-sky-950/50 px-3 py-1 text-xs font-mono font-medium text-sky-300">
              Track 01: SerpApi Decision Agent
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400 leading-relaxed">
            Select a brain MRI image (JPG or PNG, max 10MB) for tumour classification, Grad-CAM explainability, and autonomous SerpApi clinical literature and hospital localization.
          </p>
        </div>

        {/* Diagnostic Ingest Dropzone */}
        <div className="relative group rounded-2xl border-2 border-dashed border-slate-700/80 bg-slate-950/50 p-8 text-center transition-all duration-300 hover:border-sky-500/80 hover:bg-slate-950/80">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/[0.08] text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.15)] group-hover:scale-105 transition duration-300">
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>

          <label
            htmlFor="mri-file-input"
            className="cursor-pointer block text-sm font-semibold text-slate-200 hover:text-white"
          >
            <span className="text-sky-400 underline decoration-sky-400/40 underline-offset-4 hover:decoration-sky-400">
              Browse neuroimaging file
            </span>{" "}
            or select from local directory
          </label>

          <input
            type="file"
            id="mri-file-input"
            accept="image/jpeg,image/png"
            onChange={handleImageChange}
            className="mt-4 block w-full max-w-sm mx-auto cursor-pointer text-xs text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-slate-200 hover:file:bg-slate-700 transition"
          />

          <p className="mt-4 text-xs font-mono text-slate-400">
            Supported formats: JPG, PNG • Max size: 10 MB
          </p>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-950/60 p-4 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.15)] backdrop-blur-md">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1 text-sm">
              <strong className="block font-semibold text-red-300">
                Action Required
              </strong>
              <span className="text-red-300/90">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              aria-label="Dismiss error"
              className="rounded-lg p-1 text-slate-400 hover:bg-red-900/40 hover:text-white transition"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Selected Image Preview & Action Button */}
        {preview && (
          <div className="mt-8 rounded-2xl border border-white/[0.08] bg-slate-950/60 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3">
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400">
                Selected Scan
              </span>
              <span className="font-mono text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                Ready
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative overflow-hidden rounded-xl border border-slate-700/80 bg-black/60 p-2 shadow-2xl">
                <img
                  src={preview}
                  alt="MRI Preview"
                  className="max-h-96 rounded-lg object-contain"
                />
              </div>

              <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-900/80 px-3 py-1 font-mono text-xs text-slate-300 border border-white/[0.06]">
                <span className="font-medium text-slate-200">
                  {selectedImage?.name}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">
                  {((selectedImage?.size || 0) / 1024).toFixed(1)} KB
                </span>
              </div>

              {/* Regional Location Configuration */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <label
                  htmlFor="patient-city-input"
                  className="text-xs font-mono text-slate-400"
                >
                  📍 Patient Region:
                </label>
                <input
                  id="patient-city-input"
                  type="text"
                  value={patientCity}
                  onChange={(e) => setPatientCity(e.target.value)}
                  placeholder="e.g. Jaipur"
                  className="rounded-lg border border-white/[0.1] bg-slate-900/90 px-2.5 py-1 text-xs font-mono text-slate-200 focus:border-sky-500 focus:outline-none w-36 text-center"
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={loading}
                className="btn-primary mt-6 inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                    <span>Analyzing Brain MRI...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4 text-sky-200"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
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
            agentResearch={result.agent_research}
          />
        )}

        {/* History Component Embed */}
        <HistoryCard refreshTrigger={refreshTrigger} />
      </div>
    </section>
  );
}