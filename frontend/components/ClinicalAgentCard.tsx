"use client";

import React, { useState } from "react";
import {
  AgentResearch,
  formatTumorClass,
} from "@/lib/api";
import {
  Sparkles,
  ExternalLink,
  Phone,
  MapPin,
  Building2,
  BookOpen,
  ShieldAlert,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
} from "lucide-react";

interface Props {
  research?: AgentResearch;
  prediction: string;
  loading?: boolean;
  region?: string;
}

export default function ClinicalAgentCard({
  research,
  prediction,
  loading = false,
  region,
}: Props) {
  const [activeTab, setActiveTab] = useState<"literature" | "facilities">("literature");
  const [showQueries, setShowQueries] = useState(false);

  const formattedPrediction = formatTumorClass(prediction);
  const isNoTumor =
    formattedPrediction.toLowerCase() === "no tumor" ||
    (research && !research.escalation_required);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="space-y-2">
            <div className="h-4 w-44 rounded bg-slate-200" />
            <div className="h-3 w-64 rounded bg-slate-100" />
          </div>
          <span className="h-6 w-28 rounded-full bg-slate-100" />
        </div>
        <div className="space-y-4">
          <div className="h-16 rounded-xl bg-slate-50 p-3" />
          <div className="h-28 rounded-xl bg-slate-50 p-3" />
          <div className="h-28 rounded-xl bg-slate-50 p-3" />
        </div>
      </div>
    );
  }

  if (!research) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
        <p className="text-sm">Autonomous Clinical Agent research pending or unavailable.</p>
      </div>
    );
  }

  const effectiveRegion = region || research.region || research.patient_city || "Jaipur";

  return (
    <div className="flex flex-col rounded-3xl border-2 border-blue-200/80 bg-white/95 p-8 sm:p-10 shadow-xl shadow-blue-900/5">
      {/* Panel Header */}
      <div className="border-b border-blue-200/60 pb-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-100/80 px-3.5 py-1 text-xs font-mono font-bold text-blue-800 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
              SerpApi AI Agent (Track 01)
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-mono font-bold text-slate-700">
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              {effectiveRegion}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold ${
              isNoTumor
                ? "border border-emerald-300 bg-emerald-100 text-emerald-800"
                : "border border-amber-300 bg-amber-100 text-amber-900"
            }`}
          >
            {isNoTumor ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Baseline Guidance</span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                <span>Escalation Recommended</span>
              </>
            )}
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Sparkles className="h-6 w-6 text-blue-600" />
          Autonomous Clinical Agent Research &amp; Care Facilities
        </h3>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          SerpApi Tools: <code className="text-blue-700 font-mono font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">web_search</code> (PubMed/NCCN) &amp;{" "}
          <code className="text-blue-700 font-mono font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">maps_search</code> (Tertiary Oncology Centers in {effectiveRegion})
        </p>
      </div>

      {/* Clinical Guidance / Decision Support Summary */}
      <div
        className={`mb-6 rounded-2xl border-2 p-6 text-sm leading-relaxed ${
          isNoTumor
            ? "border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 text-emerald-950"
            : "border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/40 text-slate-900"
        }`}
      >
        <div className="flex items-center gap-2 mb-2 font-bold">
          <Zap className={`h-5 w-5 ${isNoTumor ? "text-emerald-600" : "text-blue-600"}`} />
          <span className="text-sm font-mono font-bold uppercase tracking-wider text-slate-800">
            Synthesized Clinical Action Plan
          </span>
        </div>
        <p className="leading-relaxed font-medium">{research.clinical_summary}</p>
      </div>

      {/* Autonomous Queries Collapsible */}
      {research.queries_executed && research.queries_executed.length > 0 && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowQueries(!showQueries)}
            className="flex items-center justify-between w-full text-left font-mono text-[11px] text-slate-600 hover:text-slate-900 transition py-1"
          >
            <span className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-sky-600" />
              <span>{research.queries_executed.length} Autonomous SerpApi Queries Dispatched</span>
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              {showQueries ? (
                <>
                  <span>Hide</span>
                  <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  <span>View</span>
                  <ChevronDown className="h-3 w-3" />
                </>
              )}
            </span>
          </button>
          {showQueries && (
            <div className="mt-2 space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[11px] font-mono text-slate-700">
              {research.queries_executed.map((q, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="text-sky-600">›</span>
                  <span className="break-all">{q}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Selectors (Literature vs Facilities) */}
      <div className="flex border-b border-slate-200 mb-4 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("literature")}
          className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold transition border-b-2 ${
            activeTab === "literature"
              ? "border-sky-600 text-sky-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Evidence &amp; Clinical Trials ({research.articles?.length || 0})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("facilities")}
          className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold transition border-b-2 ${
            activeTab === "facilities"
              ? "border-sky-600 text-sky-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>Regional Care Centers ({research.facilities?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: Evidence-Based Literature & Ongoing Clinical Trials */}
      {activeTab === "literature" && (
        <div className="space-y-3 flex-1 overflow-y-auto max-h-96 pr-1">
          {!research.articles || research.articles.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              No literature entries returned for this scan.
            </p>
          ) : (
            research.articles.map((article, idx) => (
              <div
                key={idx}
                className="group rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition hover:border-sky-300 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-xs font-semibold text-slate-800 group-hover:text-sky-800 leading-snug">
                    {article.title}
                  </h4>
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 p-1 rounded-md text-slate-400 hover:text-sky-700 hover:bg-slate-100 transition"
                      title="Open publication"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed mb-2.5">
                  {article.snippet}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1.5 border-t border-slate-200">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[200px]">
                    {article.source || "PubMed / Medical Registry"}
                  </span>
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:underline inline-flex items-center gap-1 font-sans text-[11px]"
                    >
                      <span>Read full study</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Regional Tertiary Neuro-Oncology & Specialized Referral Centers */}
      {activeTab === "facilities" && (
        <div className="space-y-3 flex-1 overflow-y-auto max-h-96 pr-1">
          {!research.facilities || research.facilities.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500">
                {isNoTumor
                  ? "Scan is nominal. Specialized tertiary oncology hospital referral is not required."
                  : `No localized hospital facilities found in ${effectiveRegion}.`}
              </p>
            </div>
          ) : (
            research.facilities.map((facility, idx) => (
              <div
                key={idx}
                className="group rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition hover:border-emerald-300 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-xs font-semibold text-slate-800 group-hover:text-emerald-800 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{facility.name}</span>
                  </h4>
                  {facility.rating !== null && facility.rating !== undefined && (
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-amber-800 border border-amber-200">
                      ★ {facility.rating}
                    </span>
                  )}
                </div>

                {facility.address && (
                  <p className="text-[11px] text-slate-600 flex items-start gap-1.5 mb-2 leading-relaxed">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                    <span>{facility.address}</span>
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-200">
                  {facility.phone ? (
                    <a
                      href={`tel:${facility.phone.replace(/[^0-9+]/g, "")}`}
                      className="inline-flex items-center gap-1 text-slate-700 hover:text-sky-700 transition"
                      title="Direct phone dialer"
                    >
                      <Phone className="h-3 w-3 text-sky-600" />
                      <span>{facility.phone}</span>
                    </a>
                  ) : (
                    <span className="text-slate-500">Helpline via portal</span>
                  )}

                  {facility.link && (
                    <a
                      href={facility.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline inline-flex items-center gap-1 ml-auto text-[11px] font-sans"
                    >
                      <span>Visit Center Portal</span>
                      <ExternalLink className="h-3 w-3" />
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
