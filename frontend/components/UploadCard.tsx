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
    <section id="upload" className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto mt-8 px-4 items-start">
        {/* Left Column (Upload Card) */}
        <div className="p-8 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all flex flex-col gap-6">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                <Upload className="h-7 w-7 text-blue-600" />
                <span>Upload MRI Scan</span>
              </h2>
              <span className="rounded-full border border-blue-200 bg-blue-50/90 px-3.5 py-1 text-xs font-mono font-bold text-blue-800 shadow-xs">
                Track 01: SerpApi Decision Agent
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
              Select a brain MRI image (JPG or PNG, max 10MB) for tumour classification, Grad-CAM explainability localization, and autonomous SerpApi clinical literature and regional hospital discovery.
            </p>

            {/* Upload Zone */}
            <div className="border-2 border-dashed border-blue-400 p-12 bg-blue-50/50 rounded-xl text-center transition-all duration-300 hover:border-blue-600 hover:bg-blue-50/80">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-blue-200 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25">
                <Upload className="h-7 w-7 text-white" />
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
                className="mt-4 block w-full max-w-xs mx-auto cursor-pointer text-xs sm:text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-xs sm:file:text-sm file:font-bold file:text-white hover:file:bg-blue-700 shadow-sm transition"
              />

              <p className="mt-4 text-xs font-mono font-medium text-slate-500">
                Supported formats: JPG, PNG • Max size: 10 MB
              </p>
            </div>
          </div>

          {/* Error Notification Banner */}
          {errorMessage && (
            <div className="flex items-start gap-3 rounded-2xl border-2 border-rose-300 bg-rose-50/90 p-4 text-rose-800 shadow-md">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <div className="flex-1 text-sm sm:text-base">
                <strong className="block font-bold text-rose-900">
                  Action Required
                </strong>
                <span className="text-rose-800">{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                aria-label="Dismiss error"
                className="rounded-xl p-1 text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Selected Image Preview & Action Button */}
          {preview && (
            <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-md p-5 shadow-inner">
              <div className="flex items-center justify-between mb-3 border-b border-blue-200/60 pb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                  Selected Scan
                </span>
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                  Ready for Analysis
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative overflow-hidden rounded-xl border border-slate-300 bg-black/90 p-2 shadow-sm">
                  <img
                    src={preview}
                    alt="MRI Preview"
                    className="max-h-[220px] rounded-lg object-contain mx-auto"
                  />
                </div>

                <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1 font-mono text-xs text-slate-700 border border-slate-200 shadow-2xs">
                  <span className="font-bold text-slate-900 truncate max-w-[150px]">
                    {selectedImage?.name}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600">
                    {((selectedImage?.size || 0) / 1024).toFixed(1)} KB
                  </span>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="btn-primary mt-5 w-full inline-flex items-center justify-center gap-3 px-6 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="inline-block h-5 w-5 animate-spin rounded-full border-3 border-white border-r-transparent" />
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
        </div>

        {/* Right Column (SerpApi Geographic Referral Routing) */}
        <div className="p-8 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <h3 className="text-2xl font-extrabold text-slate-900">
                Geographic Referral Routing
              </h3>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Target metropolitan region for autonomous hospital geolocation and tertiary surgical center referral routing:
            </p>

            <RegionSelector
              value={region}
              onChange={handleRegionChange}
              disabled={loading}
            />
          </div>

          {/* Live Interactive Map with Nearby Hospitals */}
          <div className="w-full h-[350px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src="https://maps.google.com/maps?q=neurology+and+cancer+hospitals+near+Jaipur&t=&z=11&ie=UTF8&iwloc=&output=embed"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Prediction Results Display */}
      {result && (
        <div className="max-w-7xl mx-auto mt-10 px-4">
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
        </div>
      )}

      {/* History Component Embed */}
      <div className="max-w-7xl mx-auto mt-10 px-4">
        <HistoryCard refreshTrigger={refreshTrigger} />
      </div>
    </section>
  );
}