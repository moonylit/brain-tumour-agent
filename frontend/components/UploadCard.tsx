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
    <section id="upload" className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Upload className="h-6 w-6 text-cyan-600" />
            <span>Upload MRI Scan</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500 leading-relaxed max-w-3xl">
            Select a brain MRI image (JPG or PNG, max 10MB) for tumour classification, Grad-CAM explainability localization, and autonomous SerpApi clinical literature and regional hospital discovery.
          </p>
        </div>

        {/* Diagnostic Ingest Dropzone & Region Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* File Upload Box (2 cols on lg) */}
          <div className="lg:col-span-2 relative rounded-2xl border-2 border-dashed border-slate-300 hover:border-cyan-500 bg-slate-50/70 hover:bg-cyan-50/20 p-8 text-center transition-all duration-200">
            <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 text-cyan-600 shadow-sm">
              <Upload className="h-7 w-7" />
            </div>

            <label
              htmlFor="mri-file-input"
              className="cursor-pointer block text-sm font-semibold text-slate-800 hover:text-cyan-700"
            >
              <span className="text-cyan-700 underline decoration-cyan-300 underline-offset-4 font-bold">
                Browse neuroimaging file
              </span>{" "}
              or drag &amp; drop scan here
            </label>

            <input
              type="file"
              id="mri-file-input"
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              className="mt-3.5 block w-full max-w-xs mx-auto cursor-pointer text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-600 file:px-3.5 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-cyan-700 transition"
            />

            <p className="mt-3 text-xs text-slate-400 font-medium">
              Supported formats: JPG, PNG • Max size: 10 MB • ResNet-50 v2 224x224 Ingest
            </p>
          </div>

          {/* Region Configuration Card (1 col on lg) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-cyan-600" />
              <h3 className="text-sm font-bold text-slate-800">
                Geographic Referral Routing
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-3.5 leading-relaxed">
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
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-rose-900 shadow-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <div className="flex-1 text-xs">
              <strong className="block font-semibold text-rose-900">
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
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Selected Scan
              </span>
              <span className="font-mono text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                Ready for Analysis
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
                <img
                  src={preview}
                  alt="MRI Preview"
                  className="max-h-80 rounded-lg object-contain"
                />
              </div>

              <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1 font-mono text-xs text-slate-600 border border-slate-200 shadow-sm">
                <span className="font-semibold text-slate-800">
                  {selectedImage?.name}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">
                  {((selectedImage?.size || 0) / 1024).toFixed(1)} KB
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-cyan-700 font-bold">
                  Region: {region}
                </span>
              </div>

              <button
                onClick={handleUpload}
                disabled={loading}
                className="tactile-button mt-5 inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 px-8 py-3 text-sm font-bold text-white shadow-sm transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                    <span>Analyzing Brain MRI &amp; Querying SerpApi...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-cyan-200" />
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