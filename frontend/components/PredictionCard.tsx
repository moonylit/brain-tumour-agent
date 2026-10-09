"use client";

import React, { useState } from "react";
import {
  downloadReport,
  getHeatmapUrl,
  getRawScanUrl,
  formatApiError,
  formatTumorClass,
  AgentResearch,
} from "@/lib/api";
import ClinicalAgentCard from "./ClinicalAgentCard";
import {
  Activity,
  Clock,
  Fingerprint,
  ShieldAlert,
  CheckCircle2,
  FileDown,
  Layers,
  Eye,
  Sliders,
  Crosshair,
  Cpu,
} from "lucide-react";

type Props = {
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
  processingTime: number;
  heatmapFilename: string;
  rawHeatmapFilename?: string;
  region?: string;
  accessionId?: string;
  agentResearch?: AgentResearch;
};

export default function PredictionCard({
  prediction,
  confidence,
  probabilities,
  processingTime,
  heatmapFilename,
  rawHeatmapFilename,
  region = "Jaipur",
  accessionId,
  agentResearch,
}: Props) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"side-by-side" | "raw" | "gradcam">("side-by-side");
  const [showCrosshairs, setShowCrosshairs] = useState(true);

  async function handleDownloadReport() {
    try {
      setDownloading(true);
      setDownloadError(null);
      await downloadReport(region);
    } catch (error) {
      console.error("PDF download failed:", error);
      setDownloadError(formatApiError(error));
    } finally {
      setDownloading(false);
    }
  }

  const heatmapUrl = getHeatmapUrl(heatmapFilename);
  const rawUrl = rawHeatmapFilename
    ? getRawScanUrl(rawHeatmapFilename)
    : heatmapUrl;

  const formattedPrediction = formatTumorClass(prediction);
  const isNoTumor = formattedPrediction.toLowerCase() === "no tumor";
  const displayAccession =
    accessionId || `ACC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-9842`;

  return (
    <div className="mt-10 bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-xl shadow-blue-900/5 p-8 sm:p-10">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP READOUT HEADER                                         */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 mb-6 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-mono text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Inference Completed</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 mt-2">
            Prediction Result
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-xl border px-4 py-2 text-sm sm:text-base font-bold tracking-wide shadow-sm ${
              isNoTumor
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {formattedPrediction}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. TOP METRICS STRIP (5 Micro-Stat Blocks)                    */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        {/* Micro-Stat 1: Accession UID */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-mono uppercase tracking-wider text-[11px]">Accession ID</span>
            <Fingerprint className="h-3.5 w-3.5 text-sky-600" />
          </div>
          <p className="mt-2 text-xs sm:text-sm font-mono font-bold text-slate-800 truncate" title={displayAccession}>
            {displayAccession}
          </p>
        </div>

        {/* Micro-Stat 2: Model Version */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-mono uppercase tracking-wider text-[11px]">Model Engine</span>
            <Cpu className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <p className="mt-2 text-xs sm:text-sm font-mono font-bold text-blue-700">
            ResNet-50 v2
          </p>
        </div>

        {/* Micro-Stat 3: Softmax Confidence */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-mono uppercase tracking-wider text-[11px]">Softmax Confidence</span>
            <Activity className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <p className="mt-2 text-base sm:text-lg font-mono font-bold text-emerald-700">
            {(confidence * 100).toFixed(2)}%
          </p>
        </div>

        {/* Micro-Stat 4: Detection Latency */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-mono uppercase tracking-wider text-[11px]">Detection Latency</span>
            <Clock className="h-3.5 w-3.5 text-sky-600" />
          </div>
          <p className="mt-2 text-base sm:text-lg font-mono font-bold text-sky-700">
            {processingTime.toFixed(2)} ms
          </p>
        </div>

        {/* Micro-Stat 5: Clinical Risk Triage Status */}
        <div className="col-span-2 sm:col-span-1 rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-mono uppercase tracking-wider text-[11px]">Triage Risk Stratum</span>
            {isNoTumor ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
            )}
          </div>
          <div className="mt-2">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                isNoTumor
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {isNoTumor ? "Nominal Surveillance" : "Escalation Recommended"}
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. INTERACTIVE DUAL-VIEWER & CLINICAL AGENT PANEL ROW          */}
      {/* ------------------------------------------------------------- */}
      <div className="mb-8 grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Left Column: Interactive Dual-Viewer (Raw vs Grad-CAM) */}
        {heatmapFilename ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            {/* Viewer Controls Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-sky-600" />
                  <span>Grad-CAM Heatmap Localization</span>
                </h3>
                <span className="font-mono text-[11px] text-slate-500 block mt-0.5">
                  Generated file: {heatmapFilename}
                </span>
              </div>

              {/* View Mode Toggle Controls */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode("side-by-side")}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition ${
                    viewMode === "side-by-side"
                      ? "bg-white text-sky-800 border border-slate-200 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Side-by-Side
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("raw")}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition ${
                    viewMode === "raw"
                      ? "bg-white text-sky-800 border border-slate-200 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Raw MRI
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("gradcam")}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition ${
                    viewMode === "gradcam"
                      ? "bg-white text-sky-800 border border-slate-200 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Grad-CAM Overlay
                </button>
                <button
                  type="button"
                  onClick={() => setShowCrosshairs(!showCrosshairs)}
                  className={`p-1 rounded-md transition text-xs ${
                    showCrosshairs ? "text-sky-700 bg-sky-50" : "text-slate-400 hover:text-slate-600"
                  }`}
                  title="Toggle Inspection Crosshairs"
                >
                  <Crosshair className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Display Area */}
            <div className="relative">
              {viewMode === "side-by-side" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Left: Raw MRI */}
                  <div className="relative rounded-xl border border-slate-200 bg-black/90 p-2 flex flex-col items-center">
                    <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded bg-black/70 border border-slate-700 text-[10px] font-mono text-slate-300">
                      Raw Scan
                    </span>
                    <div className="relative overflow-hidden rounded-lg aspect-square w-full max-w-[260px] flex items-center justify-center">
                      <img
                        src={rawUrl}
                        alt="Raw MRI Input Scan"
                        className="object-contain w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      {showCrosshairs && (
                        <div className="pointer-events-none absolute inset-0 border border-cyan-500/15">
                          <div className="absolute inset-x-0 top-1/2 border-t border-cyan-500/20 border-dashed" />
                          <div className="absolute inset-y-0 left-1/2 border-l border-cyan-500/20 border-dashed" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-2">
                      Input Morphology
                    </span>
                  </div>

                  {/* Right: Grad-CAM Overlay */}
                  <div className="relative rounded-xl border border-slate-200 bg-black/90 p-2 flex flex-col items-center">
                    <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded bg-black/70 border border-slate-700 text-[10px] font-mono text-cyan-300">
                      Activation Map
                    </span>
                    <div className="relative overflow-hidden rounded-lg aspect-square w-full max-w-[260px] flex items-center justify-center">
                      <img
                        src={heatmapUrl}
                        alt={`Grad-CAM Heatmap for ${prediction}`}
                        className="object-contain w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      {showCrosshairs && (
                        <div className="pointer-events-none absolute inset-0 border border-cyan-500/20">
                          <div className="absolute inset-x-0 top-1/2 border-t border-cyan-500/30 border-dashed" />
                          <div className="absolute inset-y-0 left-1/2 border-l border-cyan-500/30 border-dashed" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-2">
                      Feature Salience
                    </span>
                  </div>
                </div>
              ) : viewMode === "raw" ? (
                <div className="relative rounded-xl border border-slate-200 bg-black/90 p-3 flex flex-col items-center">
                  <div className="relative overflow-hidden rounded-lg aspect-square w-full max-w-[340px] flex items-center justify-center">
                    <img
                      src={rawUrl}
                      alt="Raw MRI Input Scan"
                      className="object-contain w-full h-full max-h-80"
                    />
                    {showCrosshairs && (
                      <div className="pointer-events-none absolute inset-0 border border-cyan-500/20">
                        <div className="absolute inset-x-0 top-1/2 border-t border-cyan-500/30 border-dashed" />
                        <div className="absolute inset-y-0 left-1/2 border-l border-cyan-500/30 border-dashed" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 mt-2">
                    Raw MRI Input Scan (Preprocessed)
                  </span>
                </div>
              ) : (
                <div className="relative rounded-xl border border-slate-200 bg-black/90 p-3 flex flex-col items-center">
                  <div className="relative overflow-hidden rounded-lg aspect-square w-full max-w-[340px] flex items-center justify-center">
                    <img
                      src={heatmapUrl}
                      alt={`Grad-CAM Heatmap for ${prediction}`}
                      className="object-contain w-full h-full max-h-80"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    {showCrosshairs && (
                      <div className="pointer-events-none absolute inset-0 border border-cyan-500/20">
                        <div className="absolute inset-x-0 top-1/2 border-t border-cyan-500/30 border-dashed" />
                        <div className="absolute inset-y-0 left-1/2 border-l border-cyan-500/30 border-dashed" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 mt-2">
                    ResNet-50 Last Conv Layer (Activation Overlay)
                  </span>
                </div>
              )}
            </div>

            {/* Heatmap Spectrum Legend */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Baseline (0.0)</span>
              <div className="h-2 w-32 sm:w-44 rounded-full bg-gradient-to-r from-blue-700 via-cyan-400 via-yellow-400 to-red-600" />
              <span>Focal Peak (1.0)</span>
            </div>
          </div>
        ) : null}

        {/* Right Column: Autonomous SerpApi Clinical Agent Panel */}
        <div className={heatmapFilename ? "" : "xl:col-span-2"}>
          <ClinicalAgentCard
            research={agentResearch}
            prediction={prediction}
            region={region}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. CLASS PROBABILITIES BREAKDOWN                              */}
      {/* ------------------------------------------------------------- */}
      {probabilities && Object.keys(probabilities).length > 0 && (
        <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Sliders className="h-3.5 w-3.5 text-sky-600" />
              <span>Class Probabilities</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Softmax Distribution</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(probabilities).map(([label, value]) => {
              const percent = (value * 100).toFixed(2);
              const formattedLabel = formatTumorClass(label);
              const isLead =
                label.toLowerCase() === prediction.toLowerCase() ||
                (isNoTumor && label.toLowerCase() === "notumor");

              return (
                <div
                  key={label}
                  className={`rounded-xl border p-3 transition ${
                    isLead
                      ? "border-sky-300 bg-white shadow-xs"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="mb-2 flex justify-between text-xs sm:text-sm">
                    <span
                      className={`font-medium ${
                        isLead ? "text-sky-800 font-semibold" : "text-slate-700"
                      }`}
                    >
                      {formattedLabel}
                    </span>
                    <span className="font-mono font-semibold text-slate-800 tabular-nums">
                      {percent}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isLead
                          ? "bg-gradient-to-r from-sky-500 to-blue-600"
                          : "bg-slate-300"
                      }`}
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

      {/* ------------------------------------------------------------- */}
      {/* 5. PDF REPORT DOWNLOAD ACTION STRIP                           */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-200">
        <button
          type="button"
          onClick={handleDownloadReport}
          disabled={downloading}
          className="btn-emerald inline-flex items-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
              <span>Generating Report...</span>
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4 text-emerald-200" />
              <span>Download PDF Report</span>
            </>
          )}
        </button>

        <span className="text-xs text-slate-500 font-mono">
          Clinical telemetry &bull; Target Region: <strong className="text-slate-700">{region}</strong> &bull; SerpApi audit trail logged
        </span>

        {downloadError && (
          <div className="w-full rounded-xl border border-red-500/30 bg-red-950/60 p-3 text-sm text-red-300">
            {downloadError}
          </div>
        )}
      </div>
    </div>
  );
}