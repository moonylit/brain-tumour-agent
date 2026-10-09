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
import ScanVisualizer from "./ScanVisualizer";
import {
  Activity,
  Clock,
  Fingerprint,
  ShieldAlert,
  CheckCircle2,
  FileDown,
  Sliders,
  Cpu,
  Sparkles,
  Layers,
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

  const heatmapUrl = heatmapFilename ? getHeatmapUrl(heatmapFilename) : "";
  const rawUrl = rawHeatmapFilename
    ? getRawScanUrl(rawHeatmapFilename)
    : heatmapUrl;

  const formattedPrediction = formatTumorClass(prediction);
  const isNoTumor = formattedPrediction.toLowerCase() === "no tumor";
  const displayAccession =
    accessionId || `ACC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-9842`;

  const confidencePct = (confidence * 100).toFixed(2);

  return (
    <div className="relative overflow-hidden mt-10 rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-10 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
      {/* Subtle top cyan/violet accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-600 via-sky-500 to-violet-600" />

      {/* ------------------------------------------------------------- */}
      {/* 1. TOP READOUT STATUS STRIP                                   */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 mb-6 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-3 py-1 text-xs font-mono font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Inference Completed</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2">
            Prediction Result
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-2xl border px-4 py-2 text-sm sm:text-base font-extrabold tracking-wide shadow-sm ${
              isNoTumor
                ? "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-emerald-100"
                : "border-rose-300 bg-rose-50 text-rose-800 shadow-rose-100"
            }`}
          >
            {formattedPrediction}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. TOP METRICS STRIP (5 Clinical Micro-Stat Cards)           */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        {/* Micro-Stat 1: Accession UID */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-mono uppercase tracking-wider text-[11px] font-semibold">Accession ID</span>
            <Fingerprint className="h-3.5 w-3.5 text-cyan-600" />
          </div>
          <p className="mt-2 text-xs sm:text-sm font-mono font-bold text-slate-900 truncate" title={displayAccession}>
            {displayAccession}
          </p>
        </div>

        {/* Micro-Stat 2: Model Version */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-mono uppercase tracking-wider text-[11px] font-semibold">Model Engine</span>
            <Cpu className="h-3.5 w-3.5 text-violet-600" />
          </div>
          <p className="mt-2 text-xs sm:text-sm font-mono font-bold text-violet-700">
            ResNet-50 v2
          </p>
        </div>

        {/* Micro-Stat 3: Softmax Confidence */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-mono uppercase tracking-wider text-[11px] font-semibold">Softmax Confidence</span>
            <Activity className="h-3.5 w-3.5 text-cyan-600" />
          </div>
          <p className="mt-2 text-base sm:text-lg font-mono font-black text-cyan-700">
            {confidencePct}%
          </p>
        </div>

        {/* Micro-Stat 4: Detection Latency */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-mono uppercase tracking-wider text-[11px] font-semibold">Detection Latency</span>
            <Clock className="h-3.5 w-3.5 text-violet-600" />
          </div>
          <p className="mt-2 text-base sm:text-lg font-mono font-bold text-violet-700">
            {processingTime.toFixed(2)} ms
          </p>
        </div>

        {/* Micro-Stat 5: Clinical Risk Triage Urgency Badge */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-mono uppercase tracking-wider text-[11px] font-semibold">Triage Urgency</span>
            {isNoTumor ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
            )}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-mono font-bold tracking-wider ${
                isNoTumor
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-rose-100 text-rose-800 border border-rose-300 shadow-sm"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isNoTumor ? "bg-emerald-500" : "bg-rose-500 animate-pulse"}`} />
              <span>{isNoTumor ? "ROUTINE" : "CRITICAL"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. 3-CARD GRID: LEFT DIAGNOSIS PANEL & RIGHT AGENT CONSOLE   */}
      {/* ------------------------------------------------------------- */}
      <div className="mb-8 grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* ========================================================= */}
        {/* LEFT PANEL: DIAGNOSIS (X-Ray ScanVisualizer + Badge)      */}
        {/* ========================================================= */}
        <div className="xl:col-span-6 flex flex-col gap-6">
          {/* Dynamic X-Ray ScanVisualizer */}
          {heatmapFilename ? (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-cyan-600" />
                    <span>Grad-CAM Heatmap Localization</span>
                  </h3>
                  <span className="font-mono text-[11px] text-slate-500 block mt-0.5">
                    Generated file: {heatmapFilename}
                  </span>
                </div>
              </div>
              <ScanVisualizer
                rawImage={rawUrl}
                gradCamImage={heatmapUrl}
                prediction={prediction}
                heatmapFilename={heatmapFilename}
              />
            </div>
          ) : null}

          {/* Bold, Visually Striking Prediction Badge */}
          <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50 to-cyan-50/30 p-5 shadow-lg shadow-slate-200/40">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
                <span>Primary Morphologic Classification</span>
              </span>
              <span className="text-xs font-mono font-semibold text-slate-500">
                ResNet-50 Feature Head
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Identified Pathology
                </span>
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-0.5 block">
                  {formattedPrediction}
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-mono font-bold ${
                      isNoTumor
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-rose-100 text-rose-800 border border-rose-300"
                    }`}
                  >
                    <span>{isNoTumor ? "ROUTINE TRIAGE" : "CRITICAL ESCALATION"}</span>
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    Latency: {processingTime.toFixed(2)} ms
                  </span>
                </div>
              </div>

              {/* Progress Ring Confidence Indicator */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="relative flex items-center justify-center w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-slate-100"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-cyan-600 transition-all duration-1000 ease-out"
                      strokeWidth="8"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * confidence)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-black font-mono text-slate-900">
                      {confidencePct}%
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tighter">
                      CONFIDENCE
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Class Probabilities Breakdown */}
            {probabilities && Object.keys(probabilities).length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-cyan-600" />
                    <span>Class Probabilities</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">Softmax Distribution</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(probabilities).map(([label, value]) => {
                    const percent = (value * 100).toFixed(2);
                    const formattedLabel = formatTumorClass(label);
                    const isLead =
                      label.toLowerCase() === prediction.toLowerCase() ||
                      (isNoTumor && label.toLowerCase() === "notumor");

                    return (
                      <div
                        key={label}
                        className={`rounded-xl border p-2.5 transition ${
                          isLead
                            ? "border-cyan-300 bg-cyan-50/60 shadow-sm"
                            : "border-slate-200/80 bg-white"
                        }`}
                      >
                        <div className="mb-1.5 flex justify-between text-xs font-medium">
                          <span
                            className={
                              isLead ? "text-cyan-800 font-bold" : "text-slate-700"
                            }
                          >
                            {formattedLabel}
                          </span>
                          <span className="font-mono font-bold text-slate-900 tabular-nums">
                            {percent}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              isLead
                                ? "bg-gradient-to-r from-cyan-600 to-violet-600"
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
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL: AGENT CONSOLE (3-Tab SerpApi Clinical Suite) */}
        {/* ========================================================= */}
        <div className="xl:col-span-6">
          <ClinicalAgentCard
            research={agentResearch}
            prediction={prediction}
            region={region}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. PDF REPORT ACTION BAR                                      */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100">
        <button
          type="button"
          onClick={handleDownloadReport}
          disabled={downloading}
          className="tactile-button inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-600/30 hover:shadow-xl hover:shadow-cyan-600/40 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
              <span>Generating Clinical Report...</span>
            </>
          ) : (
            <>
              <FileDown className="h-5 w-5 text-white" />
              <span>Download PDF Report</span>
            </>
          )}
        </button>

        <span className="text-xs text-slate-500 font-mono">
          Diagnostic dossier &bull; Referral Region: <strong className="text-slate-800">{region}</strong>
        </span>

        {downloadError && (
          <div className="w-full rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 font-medium">
            {downloadError}
          </div>
        )}
      </div>
    </div>
  );
}