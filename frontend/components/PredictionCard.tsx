"use client";

import { useState } from "react";
import {
  downloadReport,
  getHeatmapUrl,
  formatApiError,
  formatTumorClass,
  AgentResearch,
} from "@/lib/api";
import ClinicalAgentCard from "./ClinicalAgentCard";

type Props = {
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
  processingTime: number;
  heatmapFilename: string;
  agentResearch?: AgentResearch;
};

export default function PredictionCard({
  prediction,
  confidence,
  probabilities,
  processingTime,
  heatmapFilename,
  agentResearch,
}: Props) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleDownloadReport() {
    try {
      setDownloading(true);
      setDownloadError(null);
      await downloadReport();
    } catch (error) {
      console.error("PDF download failed:", error);
      setDownloadError(formatApiError(error));
    } finally {
      setDownloading(false);
    }
  }

  const heatmapUrl = getHeatmapUrl(heatmapFilename);
  const formattedPrediction = formatTumorClass(prediction);
  const isNoTumor = formattedPrediction.toLowerCase() === "no tumor";

  return (
    <div className="mt-10 rounded-3xl border border-emerald-500/30 bg-slate-900/85 p-8 sm:p-10 shadow-[0_20px_50px_-20px_rgba(16,185,129,0.25)] backdrop-blur-xl">
      {/* Readout Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-6 mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-mono text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Inference Completed</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
            Prediction Result
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-2xl border px-4 py-2 text-sm sm:text-base font-bold tracking-wide shadow-md ${
              isNoTumor
                ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                : "border-sky-500/40 bg-sky-950/60 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.25)]"
            }`}
          >
            {formattedPrediction}
          </span>
        </div>
      </div>

      {/* Diagnostic Explainability & Autonomous Clinical Agent Row */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Grad-CAM Heatmap Localization Display */}
        {heatmapFilename ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-200">
                Grad-CAM Heatmap Localization
              </h3>
              <span className="font-mono text-xs text-slate-400">
                Generated file: {heatmapFilename}
              </span>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-black/70 p-3 shadow-2xl flex flex-col items-center">
              <img
                src={heatmapUrl}
                alt={`Grad-CAM Heatmap for ${prediction}`}
                className="mx-auto max-h-96 rounded-xl object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          </div>
        ) : null}

        {/* Right Column: Autonomous Clinical Agent Research & Care Facilities Panel */}
        <div className={heatmapFilename ? "" : "lg:col-span-2"}>
          <ClinicalAgentCard
            research={agentResearch}
            prediction={prediction}
          />
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl border border-white/[0.08] bg-slate-950/60 p-5 backdrop-blur-md">
        <div className="rounded-xl bg-slate-900/60 p-4 border border-white/[0.04]">
          <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400">
            Predicted Class
          </span>
          <p
            className={`mt-1.5 text-xl font-bold ${
              isNoTumor ? "text-emerald-400" : "text-sky-400"
            }`}
          >
            {formattedPrediction}
          </p>
        </div>

        <div className="rounded-xl bg-slate-900/60 p-4 border border-white/[0.04]">
          <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400">
            Confidence Score
          </span>
          <p className="mt-1.5 text-xl font-bold font-mono text-sky-400">
            {(confidence * 100).toFixed(2)}%
          </p>
        </div>

        <div className="rounded-xl bg-slate-900/60 p-4 border border-white/[0.04]">
          <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400">
            Inference Latency
          </span>
          <p className="mt-1.5 text-xl font-bold font-mono text-slate-200">
            {processingTime.toFixed(2)} ms
          </p>
        </div>
      </div>

      {/* PDF Report Download Button */}
      <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={handleDownloadReport}
          disabled={downloading}
          className="btn-emerald inline-flex items-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
              <span>Generating Report...</span>
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4 text-emerald-200"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>Download PDF Report</span>
            </>
          )}
        </button>

        <span className="text-xs text-slate-400 font-mono">
          Clinical telemetry &amp; SerpApi audit trail logged
        </span>

        {downloadError && (
          <div className="w-full rounded-xl border border-red-500/30 bg-red-950/60 p-3 text-sm text-red-300">
            {downloadError}
          </div>
        )}
      </div>

      {/* Probability Distribution Meters */}
      {probabilities && Object.keys(probabilities).length > 0 && (
        <div className="mt-8 border-t border-white/[0.08] pt-6">
          <h3 className="mb-4 text-sm font-mono font-semibold uppercase tracking-wider text-slate-400">
            Class Probabilities
          </h3>

          <div className="space-y-3">
            {Object.entries(probabilities).map(([label, value]) => {
              const percent = (value * 100).toFixed(2);
              const formattedLabel = formatTumorClass(label);
              return (
                <div
                  key={label}
                  className="rounded-xl border border-white/[0.06] bg-slate-950/50 p-3.5 transition hover:border-white/[0.12]"
                >
                  <div className="mb-2 flex justify-between text-xs sm:text-sm">
                    <span className="font-medium text-slate-200">
                      {formattedLabel}
                    </span>
                    <span className="font-mono font-semibold text-slate-300 tabular-nums">
                      {percent}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-800/80">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-500"
                      style={{
                        width: `${Math.min(Math.max(value * 100, 0), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}