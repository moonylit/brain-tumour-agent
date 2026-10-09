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
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-xl shadow-blue-900/5 p-8 sm:p-10">
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
              <Upload className="h-7 w-7 text-sky-600" />
              <span>Upload MRI Scan</span>
            </h2>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-mono font-medium text-sky-800">
              Track 01: SerpApi Decision Agent
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed max-w-4xl">
            Select a brain MRI image (JPG or PNG, max 10MB) for tumour classification, Grad-CAM explainability localization, and autonomous SerpApi clinical literature and regional hospital discovery.
          </p>
        </div>

        {/* Diagnostic Ingest Dropzone & Region Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* File Upload Box (2 cols on lg) */}
          <div className="lg:col-span-2 relative group bg-white rounded-xl shadow-sm border-2 border-dashed border-slate-300 p-8 text-center transition-all duration-300 hover:border-sky-500 hover:bg-slate-50/50">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600 shadow-sm group-hover:scale-105 transition duration-300">
              <Upload className="h-7 w-7" />
            </div>

            <label
              htmlFor="mri-file-input"
              className="cursor-pointer block text-sm font-semibold text-slate-800 hover:text-slate-900"
            >
              <span className="text-sky-600 underline decoration-sky-300 underline-offset-4 hover:decoration-sky-600">
                Browse neuroimaging file
              </span>{" "}
              or select from local directory
            </label>

            <input
              type="file"
              id="mri-file-input"
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              className="mt-4 block w-full max-w-sm mx-auto cursor-pointer text-xs text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200 transition"
            />

            <p className="mt-4 text-xs font-mono text-slate-600">
              Supported formats: JPG, PNG • Max size: 10 MB
            </p>
          </div>

          {/* Region Configuration Card (1 col on lg) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-sky-600" />
              <h3 className="text-sm font-semibold text-slate-800">
                Geographic Referral Routing
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
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
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-sm">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <div className="flex-1 text-sm">
              <strong className="block font-semibold text-rose-800">
                Action Required
              </strong>
              <span className="text-rose-700">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              aria-label="Dismiss error"
              className="rounded-lg p-1 text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Selected Image Preview & Action Button */}
        {preview && (
          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-600">
                Selected Scan
              </span>
              <span className="font-mono text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Ready for Analysis
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-black/90 p-2 shadow-sm">
                <img
                  src={preview}
                  alt="MRI Preview"
                  className="max-h-96 rounded-lg object-contain"
                />
              </div>

              <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1 font-mono text-xs text-slate-600 border border-slate-200 shadow-sm">
                <span className="font-medium text-slate-800">
                  {selectedImage?.name}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">
                  {((selectedImage?.size || 0) / 1024).toFixed(1)} KB
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-sky-700 font-semibold">
                  Region: {region}
                </span>
              </div>

              <button
                onClick={handleUpload}
                disabled={loading}
                className="btn-primary mt-6 inline-flex items-center justify-center gap-2.5 px-8 py-4 text-lg font-semibold rounded-xl transition-all hover:scale-105 shadow-md hover:shadow-lg text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
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