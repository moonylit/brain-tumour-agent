"use client";

import React from "react";
import { formatTumorClass, AgentResearch } from "@/lib/api";

interface PdfReportTemplateProps {
  prediction: string;
  confidence: number;
  probabilities?: Record<string, number>;
  processingTime?: number;
  accessionId?: string;
  region?: string;
  heatmapFilename?: string;
  rawHeatmapFilename?: string;
  agentResearch?: AgentResearch;
}

export default function PdfReportTemplate({
  prediction,
  confidence,
  probabilities,
  processingTime,
  accessionId,
  region = "Jaipur",
  agentResearch,
}: PdfReportTemplateProps) {
  const reportTime =
    new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }) + " IST";

  const formattedPrediction = formatTumorClass(prediction);
  const isNoTumor = formattedPrediction.toLowerCase() === "no tumor";
  const displayAccession =
    accessionId || `ACC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-9842`;

  const classDisplayMap: Record<string, string> = {
    glioma: "Glioma (Intra-Axial Infiltrative)",
    meningioma: "Meningioma (Extra-Axial Dural)",
    pituitary: "Pituitary Sellar / Parasellar",
    notumor: "No Tumour / Normal Tissue",
  };

  const probs = probabilities || {
    glioma: 0,
    meningioma: 0,
    pituitary: 0,
    notumor: 0,
  };

  // Find max probability key for primary highlight
  let highestKey = "";
  let highestVal = -1;
  Object.entries(probs).forEach(([key, val]) => {
    if (val > highestVal) {
      highestVal = val;
      highestKey = key.toLowerCase();
    }
  });

  return (
    <div className="pdf-report-container bg-white p-8 max-w-4xl mx-auto text-slate-800">
      {/* 1. CO-BRANDED HEADER REPLACEMENT (CerebrAI x SerpApi) */}
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-200">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900">
          Cerebr<span className="text-blue-600">AI</span>
        </h1>
        <span className="text-2xl text-slate-300 font-light px-2">✕</span>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-extrabold text-[#1a1a2e] tracking-tight">
            SerpApi
          </span>
        </div>
      </div>

      {/* 2. REPORT METADATA STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-8 text-xs">
        <div>
          <span className="text-slate-400 block uppercase font-bold tracking-wider">
            Date / Time:
          </span>
          <span className="text-slate-700 font-medium">{reportTime}</span>
        </div>
        <div>
          <span className="text-slate-400 block uppercase font-bold tracking-wider">
            Accession UID:
          </span>
          <span className="text-slate-700 font-mono font-bold">{displayAccession}</span>
        </div>
        <div>
          <span className="text-slate-400 block uppercase font-bold tracking-wider">
            Target Region:
          </span>
          <span className="text-blue-700 font-bold">{region}</span>
        </div>
        <div>
          <span className="text-slate-400 block uppercase font-bold tracking-wider">
            Inference Latency:
          </span>
          <span className="text-slate-700 font-medium">
            {processingTime ? `${processingTime.toFixed(2)} ms` : "Real-time"}
          </span>
        </div>
      </div>

      {/* 3. PRIMARY CLINICAL FINDING */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white mb-8 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Primary Diagnostic Finding
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">
              {formattedPrediction}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Model Confidence
            </span>
            <p className="text-3xl font-black text-emerald-600 font-mono">
              {(confidence * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* 4. CLINICAL PROBABILITY TABLE */}
      <div className="mt-8">
        <h3 className="text-base font-bold text-slate-900 mb-2">
          Quantitative Softmax Probabilities &amp; Risk Stratification
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          ResNet-50 v2 multi-class distribution calibrated against validation benchmarks.
        </p>

        <div className="overflow-hidden rounded-xl border border-slate-200 mt-6 mb-8 shadow-sm">
          <table className="w-full text-sm text-left text-slate-600 border-collapse">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Tumour Category</th>
                <th className="px-6 py-4">Probability (%)</th>
                <th className="px-6 py-4">Risk Classification</th>
                <th className="px-6 py-4">Diagnostic Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(classDisplayMap).map(([key, label]) => {
                const val = probs[key] ?? 0;
                const isPrimary =
                  key === highestKey ||
                  key === prediction.toLowerCase().replace(/[\s_]/g, "");

                const rowClass = isPrimary
                  ? "bg-blue-50/50 border-b border-blue-100 font-bold text-slate-900"
                  : "bg-white border-b border-slate-100 last:border-0";

                let riskTag = "NOMINAL";
                let riskClass = "text-slate-500";
                let interpretation = "Sub-Threshold / Rule Out";

                if (isPrimary && !isNoTumor) {
                  riskTag = "ELEVATED";
                  riskClass = "text-rose-600 font-bold";
                  interpretation = `Primary Detection Target (${(val * 100).toFixed(2)}%)`;
                } else if (isPrimary && isNoTumor) {
                  riskTag = "NOMINAL";
                  riskClass = "text-emerald-600 font-bold";
                  interpretation = "Normal Diagnostic Benchmark";
                } else if (val > 0.15) {
                  riskTag = "ELEVATED";
                  riskClass = "text-amber-600 font-bold";
                  interpretation = "Differential Consideration";
                }

                return (
                  <tr key={key} className={rowClass}>
                    <td className="px-6 py-4">{label}</td>
                    <td className="px-6 py-4 font-mono font-bold">
                      {(val * 100).toFixed(2)}%
                    </td>
                    <td className={`px-6 py-4 ${riskClass}`}>{riskTag}</td>
                    <td className="px-6 py-4">{interpretation}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. SYNTHESIZED CLINICAL ACTION PLAN */}
      {agentResearch && agentResearch.clinical_summary && (
        <div className="p-6 rounded-2xl border border-emerald-100 bg-emerald-50/40 mt-8 mb-8">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
            Synthesized Clinical Action Plan ({region})
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {agentResearch.clinical_summary}
          </p>
        </div>
      )}

      {/* 6. SYSTEM CLINICAL DISCLAIMER */}
      <div className="mt-12 pt-4 border-t border-gray-300 text-[10px] text-gray-500 text-center print:block">
        <p className="mb-1 font-semibold text-slate-600">Generated by CerebrAI - Neuro-Oncology Triage System</p>
        <strong>CLINICAL DISCLAIMER:</strong> This document was generated by an autonomous
        AI triage system. It does not replace professional medical consultation. A certified
        physician must review all findings.
      </div>
    </div>
  );
}
