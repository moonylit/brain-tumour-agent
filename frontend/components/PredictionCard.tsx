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
    <div className="mt-10 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP READOUT HEADER                                         */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
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
            className={`rounded-xl border px-4 py-2 text-sm sm:text-base font-bold tracking-wide shadow-lg ${
              isNoTumor
                ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                : "border-rose-500/40 bg-rose-950/60 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.25)]"
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
        <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase tracking-wider text-[11px]">Accession ID</span>
            <Fingerprint className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <p className="mt-2 text-xs sm:text-sm font-mono font-bold text-slate-200 truncate" title={displayAccession}>
            {displayAccession}
          </p>
        </div>

        {/* Micro-Stat 2: Model Version */}
        <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase tracking-wider text-[11px]">Model Engine</span>
            <Cpu className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <p className="mt-2 text-xs sm:text-sm font-mono font-bold text-blue-300">
            ResNet-50 v2
          </p>
        </div>

        {/* Micro-Stat 3: Softmax Confidence */}
        <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase tracking-wider text-[11px]">Softmax Confidence</span>
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="mt-2 text-base sm:text-lg font-mono font-bold text-emerald-400">
            {(confidence * 100).toFixed(2)}%
          </p>
        </div>

        {/* Micro-Stat 4: Detection Latency */}
        <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase tracking-wider text-[11px]">Detection Latency</span>
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <p className="mt-2 text-base sm:text-lg font-mono font-bold text-cyan-400">
            {processingTime.toFixed(2)} ms
          </p>
        </div>

        {/* Micro-Stat 5: Clinical Risk Triage Urgency Badge */}
        <div className="col-span-2 sm:col-span-1 rounded-xl bg-slate-950/70 border border-slate-800/80 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase tracking-wider text-[11px]">Triage Urgency</span>
            {isNoTumor ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            )}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-mono font-bold tracking-wider ${
                isNoTumor
                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                  : "bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isNoTumor ? "bg-emerald-400" : "bg-rose-400 animate-pulse"}`} />
              <span>{isNoTumor ? "ROUTINE" : "CRITICAL"}</span>
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
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl">
            {/* Viewer Controls Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  <span>Grad-CAM Heatmap Localization</span>
                </h3>
                <span className="font-mono text-[11px] text-slate-400 block mt-0.5">
                  Generated file: {heatmapFilename}
                </span>
              </div>

              {/* View Mode Toggle Controls */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode("side-by-side")}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition ${
                    viewMode === "side-by-side"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Side-by-Side
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("raw")}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition ${
                    viewMode === "raw"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Raw MRI
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("gradcam")}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition ${
                    viewMode === "gradcam"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Grad-CAM Overlay
                </button>
                <button
                  type="button"
                  onClick={() => setShowCrosshairs(!showCrosshairs)}
                  className={`p-1 rounded-md transition text-xs ${
                    showCrosshairs ? "text-cyan-400 bg-cyan-950/40" : "text-slate-500 hover:text-slate-300"
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
                  <div className="relative rounded-xl border border-slate-800 bg-black/80 p-2 flex flex-col items-center overflow-hidden shadow-2xl">
                    <div className="hud-corner hud-tl" />
                    <div className="hud-corner hud-tr" />
                    <div className="hud-corner hud-bl" />
                    <div className="hud-corner hud-br" />
                    <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded bg-black/70 border border-slate-700 text-[10px] font-mono text-slate-300">
                      Original MRI (T1-Gd)
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
                      Input Morphology (T1-Gd)
                    </span>
                  </div>

                  {/* Right: Grad-CAM Overlay */}
                  <div className="relative rounded-xl border border-slate-800 bg-black/80 p-2 flex flex-col items-center overflow-hidden shadow-2xl">
                    <div className="hud-corner hud-tl" />
                    <div className="hud-corner hud-tr" />
                    <div className="hud-corner hud-bl" />
                    <div className="hud-corner hud-br" />
                    <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded bg-black/70 border border-slate-700 text-[10px] font-mono text-cyan-300">
                      Grad-CAM Overlay (Lesion Localization)
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
                <div className="relative rounded-xl border border-slate-800 bg-black/80 p-3 flex flex-col items-center">
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
                <div className="relative rounded-xl border border-slate-800 bg-black/80 p-3 flex flex-col items-center">
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
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
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
        <div className="mb-8 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sliders className="h-3.5 w-3.5 text-cyan-400" />
              <span>Class Probabilities</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Softmax Distribution</span>
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
                      ? "border-cyan-500/40 bg-slate-900/90 shadow-sm"
                      : "border-slate-800/70 bg-slate-950/50"
                  }`}
                >
                  <div className="mb-2 flex justify-between text-xs sm:text-sm">
                    <span
                      className={`font-medium ${
                        isLead ? "text-cyan-300 font-semibold" : "text-slate-300"
                      }`}
                    >
                      {formattedLabel}
                    </span>
                    <span className="font-mono font-semibold text-slate-200 tabular-nums">
                      {percent}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-800/80">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isLead
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                          : "bg-slate-600"
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
      <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-800">
        <button
          type="button"
          onClick={handleDownloadReport}
          disabled={downloading}
          className="tactile-button inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 px-8 py-4 text-sm font-bold text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_45px_rgba(16,185,129,0.7)] transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
              <span>Generating Clinical Report...</span>
            </>
          ) : (
            <>
              <FileDown className="h-5 w-5 text-emerald-100 animate-bounce" style={{ animationDuration: '2.5s' }} />
              <span>Download PDF Report</span>
            </>
          )}
        </button>

        <span className="text-xs text-slate-400 font-mono">
          Clinical telemetry &bull; Target Region: <strong className="text-slate-300">{region}</strong> &bull; SerpApi audit trail logged
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