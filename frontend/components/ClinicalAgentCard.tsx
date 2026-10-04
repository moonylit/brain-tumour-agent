"use client";

import { useState } from "react";
import { AgentResearch, formatTumorClass } from "@/lib/api";

interface Props {
  research?: AgentResearch;
  prediction: string;
  loading?: boolean;
}

export default function ClinicalAgentCard({
  research,
  prediction,
  loading = false,
}: Props) {
  const [activeTab, setActiveTab] = useState<"literature" | "facilities">("literature");
  const [showQueries, setShowQueries] = useState(false);

  const formattedPrediction = formatTumorClass(prediction);
  const isNoTumor =
    formattedPrediction.toLowerCase() === "no tumor" ||
    (research && !research.escalation_required);

  if (loading) {
    return (
      <div className="rounded-2xl border border-sky-500/30 bg-slate-950/70 p-6 backdrop-blur-md shadow-xl animate-pulse">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
          <div className="space-y-2">
            <div className="h-4 w-44 rounded bg-sky-500/30" />
            <div className="h-3 w-64 rounded bg-slate-700/50" />
          </div>
          <span className="h-6 w-28 rounded-full bg-sky-500/20" />
        </div>
        <div className="space-y-4">
          <div className="h-16 rounded-xl bg-slate-900/60 p-3" />
          <div className="h-28 rounded-xl bg-slate-900/60 p-3" />
          <div className="h-28 rounded-xl bg-slate-900/60 p-3" />
        </div>
      </div>
    );
  }

  if (!research) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-slate-950/50 p-6 text-center text-slate-400">
        <p className="text-sm">Autonomous Clinical Agent research pending or unavailable.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl border border-sky-500/30 bg-slate-950/80 p-6 backdrop-blur-xl shadow-[0_10px_35px_-15px_rgba(56,189,248,0.2)]">
      {/* Panel Header */}
      <div className="border-b border-white/[0.08] pb-4 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-950/60 px-2.5 py-0.5 text-xs font-mono font-medium text-sky-300">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-ping" />
              SerpApi AI Agent (Track 01)
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-0.5 text-[11px] font-mono text-slate-300">
              📍 {research.patient_city || "Jaipur"}
            </span>
          </div>

          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isNoTumor
                ? "border border-emerald-500/30 bg-emerald-950/50 text-emerald-300"
                : "border border-amber-500/30 bg-amber-950/50 text-amber-300"
            }`}
          >
            {isNoTumor ? "Baseline Guidance" : "Escalation Recommended"}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white tracking-tight">
          Autonomous Clinical Agent Research &amp; Care Facilities
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          SerpApi Tools: <code className="text-sky-300">web_search</code> (PubMed/NCCN) &amp;{" "}
          <code className="text-sky-300">maps_search</code> (Tertiary Oncology Centers)
        </p>
      </div>

      {/* Clinical Guidance / Decision Support Summary */}
      <div
        className={`mb-5 rounded-xl border p-4 text-xs leading-relaxed ${
          isNoTumor
            ? "border-emerald-500/20 bg-emerald-950/20 text-emerald-200/90"
            : "border-sky-500/20 bg-sky-950/25 text-slate-200"
        }`}
      >
        <div className="flex items-center gap-2 mb-1.5 font-semibold">
          <svg
            className={`h-4 w-4 ${isNoTumor ? "text-emerald-400" : "text-sky-400"}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
            Synthesized Clinical Action Plan
          </span>
        </div>
        <p>{research.clinical_summary}</p>
      </div>

      {/* Autonomous Queries Collapsible */}
      {research.queries_executed && research.queries_executed.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowQueries(!showQueries)}
            className="flex items-center justify-between w-full text-left font-mono text-[11px] text-slate-400 hover:text-slate-200 transition py-1"
          >
            <span>
              ⚡ {research.queries_executed.length} Autonomous SerpApi Queries Dispatched
            </span>
            <span className="text-xs">{showQueries ? "▲ Hide" : "▼ View"}</span>
          </button>
          {showQueries && (
            <div className="mt-2 space-y-1.5 rounded-lg border border-white/[0.06] bg-slate-900/60 p-2.5 text-[11px] font-mono text-slate-300">
              {research.queries_executed.map((q, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="text-sky-400">›</span>
                  <span className="break-all">{q}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Selectors (Literature vs Facilities) */}
      <div className="flex border-b border-white/[0.08] mb-4 gap-2">
        <button
          onClick={() => setActiveTab("literature")}
          className={`pb-2.5 px-3 text-xs font-semibold transition border-b-2 ${
            activeTab === "literature"
              ? "border-sky-400 text-sky-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          📚 Evidence &amp; Trials ({research.articles?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("facilities")}
          className={`pb-2.5 px-3 text-xs font-semibold transition border-b-2 ${
            activeTab === "facilities"
              ? "border-sky-400 text-sky-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          🏥 Regional Care Centers ({research.facilities?.length || 0})
        </button>
      </div>

      {/* Tab 1: Evidence-Based Literature & Ongoing Clinical Trials */}
      {activeTab === "literature" && (
        <div className="space-y-3 flex-1 overflow-y-auto max-h-96 pr-1">
          {(!research.articles || research.articles.length === 0) ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No literature entries returned for this scan.
            </p>
          ) : (
            research.articles.map((article, idx) => (
              <div
                key={idx}
                className="group rounded-xl border border-white/[0.06] bg-slate-900/60 p-3.5 transition hover:border-sky-500/40 hover:bg-slate-900/90"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-sky-200 leading-snug">
                    {article.title}
                  </h4>
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-slate-400 hover:text-sky-400 transition"
                      title="Open publication"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed mb-2">
                  {article.snippet}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span className="truncate max-w-[200px]">
                    {article.source || "PubMed / Medical Registry"}
                  </span>
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline inline-flex items-center gap-1"
                    >
                      Read full study →
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Regional Tertiary Neuro-Oncology & Specialized Surgical Centers */}
      {activeTab === "facilities" && (
        <div className="space-y-3 flex-1 overflow-y-auto max-h-96 pr-1">
          {(!research.facilities || research.facilities.length === 0) ? (
            <div className="rounded-xl border border-white/[0.04] bg-slate-900/40 p-4 text-center">
              <p className="text-xs text-slate-400">
                {isNoTumor
                  ? "Scan is normal. Specialized tertiary oncology hospital referral is not required."
                  : "No localized hospital facilities found."}
              </p>
            </div>
          ) : (
            research.facilities.map((facility, idx) => (
              <div
                key={idx}
                className="group rounded-xl border border-white/[0.06] bg-slate-900/60 p-3.5 transition hover:border-emerald-500/40 hover:bg-slate-900/90"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-emerald-200">
                    {facility.name}
                  </h4>
                  {facility.rating !== null && facility.rating !== undefined && (
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-amber-300 border border-amber-500/20">
                      ★ {facility.rating}
                    </span>
                  )}
                </div>

                {facility.address && (
                  <p className="text-[11px] text-slate-400 flex items-start gap-1.5 mb-2 leading-relaxed">
                    <span className="text-slate-500 shrink-0">📍</span>
                    <span>{facility.address}</span>
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-white/[0.04]">
                  {facility.phone && (
                    <span className="text-slate-300">📞 {facility.phone}</span>
                  )}
                  {facility.link && (
                    <a
                      href={facility.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline inline-flex items-center gap-1 ml-auto"
                    >
                      Visit Center Portal →
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
