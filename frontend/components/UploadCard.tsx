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
    <section id="upload" className="mx-auto max-w-[1720px] w-full px-6 sm:px-8 py-10">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border-2 border-blue-200/80 shadow-2xl shadow-blue-900/10 p-8 sm:p-12">
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <Upload className="h-8 w-8 text-blue-600" />
              <span>Upload MRI Scan</span>
            </h2>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-mono font-bold text-blue-800 shadow-xs">
              Track 01: SerpApi Decision Agent
            </span>
          </div>
          <p className="mt-2 text-base sm:text-lg text-slate-600 leading-relaxed max-w-4xl">
            Select a brain MRI image (JPG or PNG, max 10MB) for tumour classification, Grad-CAM explainability localization, and autonomous SerpApi clinical literature and regional hospital discovery.
          </p>
        </div>

        {/* Diagnostic Ingest Dropzone & Region Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* File Upload Box (2 cols on lg) */}
          <div className="lg:col-span-2 relative group bg-gradient-to-b from-blue-50/40 via-white to-indigo-50/20 rounded-3xl shadow-sm border-2 border-dashed border-blue-300 p-10 sm:p-14 text-center transition-all duration-300 hover:border-blue-600 hover:bg-blue-50/60">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-blue-200 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition duration-300">
              <Upload className="h-8 w-8 text-white" />
            </div>

            <label
              htmlFor="mri-file-input"
              className="cursor-pointer block text-base sm:text-lg font-bold text-slate-800 hover:text-blue-700"
            >
              <span className="text-blue-600 underline decoration-blue-300 underline-offset-4 hover:decoration-blue-700">
                Browse neuroimaging file
              </span>{" "}
              or select from local directory
            </label>

            <input
              type="file"
              id="mri-file-input"
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              className="mt-5 block w-full max-w-md mx-auto cursor-pointer text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-5 file:py-2.5 file:text-sm file:font-bold file:text-white hover:file:bg-blue-700 shadow-sm transition"
            />

            <p className="mt-5 text-xs sm:text-sm font-mono font-medium text-slate-500">
              Supported formats: JPG, PNG • Max size: 10 MB
            </p>
          </div>

          {/* Region Configuration Card (1 col on lg) */}
          <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 rounded-3xl shadow-sm border-2 border-blue-200/80 p-7">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                Geographic Referral Routing
              </h3>
            </div>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
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
          <div className="mt-6 flex items-start gap-3 rounded-2xl border-2 border-rose-300 bg-rose-50 p-5 text-rose-800 shadow-md">
            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-rose-600" />
            <div className="flex-1 text-base">
              <strong className="block font-bold text-rose-900">
                Action Required
              </strong>
              <span className="text-rose-800">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              aria-label="Dismiss error"
              className="rounded-xl p-1.5 text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Selected Image Preview & Action Button */}
        {preview && (
          <div className="mt-10 rounded-3xl border-2 border-blue-200/90 bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 sm:p-10 shadow-md">
            <div className="flex items-center justify-between mb-5 border-b border-blue-200/60 pb-4">
              <span className="text-sm font-mono font-bold uppercase tracking-wider text-slate-700">
                Selected Scan
              </span>
              <span className="font-mono text-sm font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3.5 py-1 rounded-full shadow-2xs">
                Ready for Analysis
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative overflow-hidden rounded-2xl border-2 border-slate-300 bg-black/90 p-3 shadow-lg">
                <img
                  src={preview}
                  alt="MRI Preview"
                  className="max-h-[440px] rounded-xl object-contain"
                />
              </div>

              <div className="mt-4 inline-flex items-center gap-3 rounded-xl bg-white px-4 py-2 font-mono text-sm text-slate-700 border-2 border-blue-200 shadow-sm">
                <span className="font-bold text-slate-900">
                  {selectedImage?.name}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">
                  {((selectedImage?.size || 0) / 1024).toFixed(1)} KB
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-blue-700 font-bold">
                  Region: {region}
                </span>
              </div>

              <button
                onClick={handleUpload}
                disabled={loading}
                className="btn-primary mt-8 inline-flex items-center justify-center gap-3 px-10 py-5 text-xl font-bold rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-3 border-white border-r-transparent" />
                    <span>Analyzing Brain MRI &amp; Querying SerpApi...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-6 w-6 text-cyan-200" />
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