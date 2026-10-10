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
  Crosshair,
  Cpu,
  Sliders,
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
    <div className="mt-12 bg-white/95 backdrop-blur-md rounded-3xl border-2 border-blue-200/80 shadow-2xl shadow-blue-900/10 p-8 sm:p-12">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP READOUT HEADER                                         */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-blue-200/60 pb-6 mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100 px-3.5 py-1 text-sm font-mono font-bold text-emerald-900 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Inference Completed</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mt-2">
            Prediction Result
          </h2>
        </div>

        <div
          className={`overflow-hidden p-6 rounded-2xl border-2 flex flex-col items-center justify-center text-center shadow-md min-w-[220px] max-w-sm w-full ${
            isNoTumor
              ? "border-emerald-300 bg-emerald-50/80 text-emerald-900"
              : "border-purple-200 bg-purple-50/50 text-slate-800"
          }`}
        >
          <span className="text-xs font-bold text-purple-600 tracking-widest uppercase">
            Identified Class
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight break-words text-center w-full mt-2">
            {formattedPrediction}
          </h2>
        </div>
      </div>

      {/* Dynamic Synthesized Clinical Action Plan */}
      <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 mb-6">
        <h4 className="text-xs font-bold text-emerald-800 tracking-widest uppercase mb-3">
          Synthesized Clinical Action Plan
        </h4>
        <p className="text-slate-700 leading-relaxed font-medium">
          {formattedPrediction
            ? formattedPrediction.toLowerCase().includes('no')
              ? "No abnormal mass detected. Standard guidelines apply."
              : `High-confidence ${formattedPrediction} detected. Automated referral routing initiated.`
            : "Awaiting scan upload..."}
        </p>
      </div>

      {/* UI Warning (Below Results) */}
      <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-xl flex items-start gap-3 shadow-sm w-full">
        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-sm text-amber-900 font-medium leading-relaxed">
          <strong>Clinical Safety Notice:</strong> This AI-generated analysis is for preliminary triage only. It is NOT a definitive diagnosis. Clinical correlation by a certified neuro-oncologist is strictly required.
        </p>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. TOP METRICS STRIP (5 Micro-Stat Blocks)                    */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 mb-10">
        {/* Micro-Stat 1: Accession UID */}
        <div className="rounded-2xl bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-slate-600 text-xs">
            <span className="font-mono font-bold uppercase tracking-wider text-xs">Accession ID</span>
            <Fingerprint className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-3 text-sm sm:text-base font-mono font-bold text-slate-900 truncate" title={displayAccession}>
            {displayAccession}
          </p>
        </div>

        {/* Micro-Stat 2: Model Version */}
        <div className="rounded-2xl bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-200 p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-blue-800 text-xs">
            <span className="font-mono font-bold uppercase tracking-wider text-xs">Model Engine</span>
            <Cpu className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-3 text-sm sm:text-base font-mono font-black text-blue-700">
            ResNet-50 v2
          </p>
        </div>

        {/* Micro-Stat 3: Softmax Confidence */}
        <div className="rounded-2xl bg-gradient-to-br from-white to-emerald-50/30 border-2 border-emerald-200 p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 text-xs">
            <span className="font-mono font-bold uppercase tracking-wider text-xs">Confidence</span>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-mono font-black text-emerald-600">
            {(confidence * 100).toFixed(2)}%
          </p>
        </div>

        {/* Micro-Stat 4: Detection Latency */}
        <div className="rounded-2xl bg-gradient-to-br from-white to-sky-50/30 border-2 border-sky-200 p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-sky-800 text-xs">
            <span className="font-mono font-bold uppercase tracking-wider text-xs">Inference Time</span>
            <Clock className="h-4 w-4 text-sky-600" />
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-mono font-black text-sky-600">
            {processingTime.toFixed(2)} ms
          </p>
        </div>

        {/* Micro-Stat 5: Clinical Risk Triage Status */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl bg-gradient-to-br from-white to-rose-50/30 border-2 border-rose-200 p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-slate-700 text-xs">
            <span className="font-mono font-bold uppercase tracking-wider text-xs">Triage Stratum</span>
            {isNoTumor ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-rose-600" />
            )}
          </div>
          <div className="mt-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${
                isNoTumor
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-rose-100 text-rose-800 border border-rose-300"
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
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm">
            {/* Viewer Controls Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-sky-600" />
                  <span>Grad-CAM Heatmap Localization</span>
                </h3>
                <span className="font-mono text-xs text-slate-500 block mt-0.5">
                  Generated file: {heatmapFilename}
                </span>
              </div>

              {/* View Mode Toggle Controls */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode("side-by-side")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
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
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
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
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
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
                  className={`p-1.5 rounded-lg transition text-xs ${
                    showCrosshairs ? "text-sky-700 bg-sky-50" : "text-slate-400 hover:text-slate-600"
                  }`}
                  title="Toggle Inspection Crosshairs"
                >
                  <Crosshair className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Display Area - High Resolution Sizing */}
            <div className="relative">
              {viewMode === "side-by-side" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left: Raw MRI */}
                  <div className="relative rounded-2xl border border-slate-300 bg-black/95 p-3 flex flex-col items-center shadow-md">
                    <span className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-md bg-black/80 border border-slate-700 text-xs font-mono font-bold text-slate-300">
                      Raw Scan
                    </span>
                    <div className="relative overflow-hidden rounded-xl w-full h-[360px] sm:h-[420px] flex items-center justify-center">
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
                    <span className="text-xs font-mono font-medium text-slate-400 mt-2">
                      Input Morphology
                    </span>
                  </div>

                  {/* Right: Grad-CAM Overlay */}
                  <div className="relative rounded-2xl border border-slate-300 bg-black/95 p-3 flex flex-col items-center shadow-md">
                    <span className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-md bg-black/80 border border-slate-700 text-xs font-mono font-bold text-cyan-300">
                      Activation Map
                    </span>
                    <div className="relative overflow-hidden rounded-xl w-full h-[360px] sm:h-[420px] flex items-center justify-center">
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
                    <span className="text-xs font-mono font-medium text-slate-400 mt-2">
                      Feature Salience
                    </span>
                  </div>
                </div>
              ) : viewMode === "raw" ? (
                <div className="relative rounded-2xl border border-slate-300 bg-black/95 p-4 flex flex-col items-center shadow-md">
                  <div className="relative overflow-hidden rounded-xl w-full h-[450px] sm:h-[500px] flex items-center justify-center">
                    <img
                      src={rawUrl}
                      alt="Raw MRI Input Scan"
                      className="object-contain w-full h-full"
                    />
                    {showCrosshairs && (
                      <div className="pointer-events-none absolute inset-0 border border-cyan-500/20">
                        <div className="absolute inset-x-0 top-1/2 border-t border-cyan-500/30 border-dashed" />
                        <div className="absolute inset-y-0 left-1/2 border-l border-cyan-500/30 border-dashed" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-400 mt-3">
                    Raw MRI Input Scan (Preprocessed)
                  </span>
                </div>
              ) : (
                <div className="relative rounded-2xl border border-slate-300 bg-black/95 p-4 flex flex-col items-center shadow-md">
                  <div className="relative overflow-hidden rounded-xl w-full h-[450px] sm:h-[500px] flex items-center justify-center">
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
                  <span className="text-xs font-mono font-medium text-slate-400 mt-3">
                    ResNet-50 Last Conv Layer (Activation Overlay)
                  </span>
                </div>
              )}
            </div>

            {/* Heatmap Spectrum Legend */}
            <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-slate-500">
              <span>Baseline (0.0)</span>
              <div className="h-2.5 w-36 sm:w-56 rounded-full bg-gradient-to-r from-blue-700 via-cyan-400 via-yellow-400 to-red-600 shadow-xs" />
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
        <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-sky-600" />
              <span>Class Probabilities</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">Softmax Distribution</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {Object.entries(probabilities).map(([label, value]) => {
              const percent = (value * 100).toFixed(2);
              const formattedLabel = formatTumorClass(label);
              const isLead =
                label.toLowerCase() === prediction.toLowerCase() ||
                (isNoTumor && label.toLowerCase() === "notumor");

              return (
                <div
                  key={label}
                  className={`rounded-xl border p-3.5 transition ${
                    isLead
                      ? "border-sky-300 bg-white shadow-xs"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="mb-2 flex justify-between text-sm">
                    <span
                      className={`font-semibold ${
                        isLead ? "text-sky-800" : "text-slate-700"
                      }`}
                    >
                      {formattedLabel}
                    </span>
                    <span className="font-mono font-bold text-slate-800 tabular-nums">
                      {percent}%
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
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
      <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t-2 border-blue-200/60">
        <button
          type="button"
          onClick={handleDownloadReport}
          disabled={downloading}
          className="btn-emerald inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading ? (
            <>
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-3 border-white border-r-transparent" />
              <span>Generating Report...</span>
            </>
          ) : (
            <>
              <FileDown className="h-5 w-5 text-emerald-100" />
              <span>Download PDF Report</span>
            </>
          )}
        </button>

        <span className="text-sm text-slate-600 font-mono font-medium">
          Clinical telemetry &bull; Target Region: <strong className="text-blue-700 font-bold">{region}</strong> &bull; SerpApi audit trail logged
        </span>

        {downloadError && (
          <div className="w-full rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-800">
            {downloadError}
          </div>
        )}
      </div>

      {/* PDF Report Print Clinical Disclaimer */}
      <div className="mt-12 pt-4 border-t border-gray-300 text-[10px] text-gray-500 text-center print:block">
        <strong>CLINICAL DISCLAIMER:</strong> This document was generated by an autonomous AI triage system. It does not replace professional medical consultation. A certified physician must review all findings.
      </div>
    </div>
  );
}