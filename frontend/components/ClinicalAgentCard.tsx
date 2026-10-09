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
  FileText,
  Dna,
  Compass,
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
  const [activeTab, setActiveTab] = useState<"facilities" | "literature" | "protocol">("literature");
  const [showQueries, setShowQueries] = useState(false);

  const formattedPrediction = formatTumorClass(prediction);
  const isNoTumor =
    formattedPrediction.toLowerCase() === "no tumor" ||
    (research && !research.escalation_required);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-lg shadow-slate-200/50 backdrop-blur-xl animate-pulse">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="space-y-2">
            <div className="h-4 w-44 rounded bg-cyan-100" />
            <div className="h-3 w-64 rounded bg-slate-200" />
          </div>
          <span className="h-6 w-28 rounded-full bg-cyan-100" />
        </div>
        <div className="space-y-4">
          <div className="h-16 rounded-xl bg-slate-100 p-3" />
          <div className="h-28 rounded-xl bg-slate-100 p-3" />
          <div className="h-28 rounded-xl bg-slate-100 p-3" />
        </div>
      </div>
    );
  }

  if (!research) {
    return (
      <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 text-center text-slate-500 shadow-lg shadow-slate-200/50">
        <p className="text-sm font-medium">Autonomous Clinical Agent research pending or unavailable.</p>
      </div>
    );
  }

  const effectiveRegion = region || research.region || research.patient_city || "Jaipur";

  return (
    <div className="flex flex-col rounded-3xl border border-slate-200/90 bg-white/95 p-6 backdrop-blur-xl shadow-lg shadow-slate-200/50">
      {/* Panel Header */}
      <div className="border-b border-slate-100 pb-4 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-xs font-mono font-semibold text-cyan-800">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 animate-ping" />
              SerpApi AI Agent (Track 01)
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-mono text-slate-700">
              <MapPin className="h-3 w-3 text-cyan-600" />
              {effectiveRegion}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isNoTumor
                ? "border border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border border-amber-300 bg-amber-50 text-amber-800"
            }`}
          >
            {isNoTumor ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Baseline Guidance</span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                <span>Escalation Recommended</span>
              </>
            )}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyan-600" />
          Autonomous Clinical Agent Research &amp; Care Facilities
        </h3>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          SerpApi Tools: <code className="text-cyan-700 font-mono">web_search</code> (PubMed/NCCN) &amp;{" "}
          <code className="text-cyan-700 font-mono">maps_search</code> (Tertiary Oncology Centers in {effectiveRegion})
        </p>
      </div>

      {/* Clinical Guidance / Decision Support Summary */}
      <div
        className={`mb-5 rounded-2xl border p-4 text-xs leading-relaxed shadow-sm ${
          isNoTumor
            ? "border-emerald-200 bg-emerald-50/70 text-emerald-950"
            : "border-cyan-200 bg-gradient-to-r from-cyan-50/60 to-violet-50/60 text-slate-800"
        }`}
      >
        <div className="flex items-center gap-2 mb-1.5 font-bold">
          <Zap className={`h-4 w-4 ${isNoTumor ? "text-emerald-600" : "text-cyan-600"}`} />
          <span className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
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
              <Zap className="h-3 w-3 text-cyan-600" />
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
            <div className="mt-2 space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] font-mono text-slate-700">
              {research.queries_executed.map((q, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="text-cyan-600 font-bold">›</span>
                  <span className="break-all">{q}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Selectors (3 Sleek Tabs from Stitch Clinical Suite) */}
      <div className="flex border-b border-slate-100 mb-4 gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("facilities")}
          className={`flex items-center gap-1.5 pb-2 px-3 text-xs font-bold whitespace-nowrap transition rounded-lg ${
            activeTab === "facilities"
              ? "bg-cyan-50 text-cyan-800 border-b-2 border-cyan-600 shadow-sm"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>Regional Care Centers ({research.facilities?.length || 0})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("literature")}
          className={`flex items-center gap-1.5 pb-2 px-3 text-xs font-bold whitespace-nowrap transition rounded-lg ${
            activeTab === "literature"
              ? "bg-violet-50 text-violet-800 border-b-2 border-violet-600 shadow-sm"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Peer-Reviewed Literature &amp; Trials ({research.articles?.length || 0})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("protocol")}
          className={`flex items-center gap-1.5 pb-2 px-3 text-xs font-bold whitespace-nowrap transition rounded-lg ${
            activeTab === "protocol"
              ? "bg-cyan-50 text-cyan-800 border-b-2 border-cyan-600 shadow-sm"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Clinical Protocol (3 Orders)</span>
        </button>
      </div>

      {/* Tab 1: Regional Care Centers (Top 3 Localized Facilities from SerpApi) */}
      {activeTab === "facilities" && (
        <div className="space-y-3 flex-1 overflow-y-auto max-h-96 pr-1">
          {!research.facilities || research.facilities.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500">
                {isNoTumor
                  ? "Scan is nominal. Specialized tertiary oncology hospital referral is not required."
                  : `No localized hospital facilities found in ${effectiveRegion}.`}
              </p>
            </div>
          ) : (
            research.facilities.slice(0, 3).map((facility, idx) => (
              <div
                key={idx}
                className="group rounded-2xl border border-slate-200/90 bg-slate-50/80 p-3.5 transition hover:border-cyan-500 hover:bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-cyan-800 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                    <span>{facility.name}</span>
                  </h4>
                  {facility.rating !== null && facility.rating !== undefined && (
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-800 border border-amber-200">
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

                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-200/60">
                  {facility.phone ? (
                    <a
                      href={`tel:${facility.phone.replace(/[^0-9+]/g, "")}`}
                      className="inline-flex items-center gap-1 text-slate-700 hover:text-cyan-600 transition font-semibold"
                      title="Direct phone dialer"
                    >
                      <Phone className="h-3 w-3 text-cyan-600" />
                      <span>{facility.phone}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400">Regional care navigator</span>
                  )}

                  {facility.link && (
                    <a
                      href={facility.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 hover:underline inline-flex items-center gap-1 ml-auto text-[11px] font-sans font-semibold"
                    >
                      <span>Navigate to Center</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Peer-Reviewed Literature & Clinical Trials (Top 3 from SerpApi) */}
      {activeTab === "literature" && (
        <div className="space-y-3 flex-1 overflow-y-auto max-h-96 pr-1">
          {!research.articles || research.articles.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              No literature entries returned for this scan.
            </p>
          ) : (
            research.articles.slice(0, 3).map((article, idx) => (
              <div
                key={idx}
                className="group rounded-2xl border border-slate-200/90 bg-slate-50/80 p-3.5 transition hover:border-violet-500 hover:bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-violet-800 leading-snug">
                    {article.title}
                  </h4>
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 p-1 rounded-md text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition"
                      title="Open publication"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed mb-2.5">
                  {article.snippet}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1.5 border-t border-slate-200/60">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200/60 text-slate-700 border border-slate-200 truncate max-w-[200px] font-medium">
                    {article.source || "PubMed / Medical Registry"}
                  </span>
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 hover:underline inline-flex items-center gap-1 font-sans text-[11px] font-semibold"
                    >
                      <span>Read study</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Clinical Protocol (3 Concise Bullet Cards) */}
      {activeTab === "protocol" && (
        <div className="space-y-3 flex-1 overflow-y-auto max-h-96 pr-1">
          {/* Card 1: Imaging Sequence */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-3.5 transition hover:border-cyan-500 hover:bg-white shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="flex items-center gap-2 text-xs font-bold text-cyan-800">
                <FileText className="h-3.5 w-3.5 text-cyan-600" />
                <span>Multiparametric MRI Imaging Sequence</span>
              </span>
              <span className="rounded bg-cyan-100 border border-cyan-200 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-800">
                ACR / EANO Protocol
              </span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
              {isNoTumor
                ? "Reassuring baseline neuroimaging. Maintain regular clinical follow-up; repeat high-resolution axial T1/T2 imaging only if focal neurological deficits manifest."
                : "Acquire volumetric 3D T1-weighted pre- & post-gadolinium contrast, axial T2-FLAIR, and DWI/ADC mapping to quantify peritumoral vasogenic edema, necrotic core boundaries, and midline shift."}
            </p>
          </div>

          {/* Card 2: Surgical Pathway */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-3.5 transition hover:border-violet-500 hover:bg-white shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="flex items-center gap-2 text-xs font-bold text-violet-800">
                <Compass className="h-3.5 w-3.5 text-violet-600" />
                <span>Surgical Pathway &amp; Resection Strategy</span>
              </span>
              <span className="rounded bg-violet-100 border border-violet-200 px-2 py-0.5 text-[10px] font-mono font-bold text-violet-800">
                Neurosurgery Directive
              </span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
              {isNoTumor
                ? "No surgical intervention indicated. Routine neurological outpatient evaluation if secondary headache symptoms persist."
                : "Multidisciplinary neurosurgical review for 5-ALA fluorescence-guided maximal safe gross total resection (GTR) or stereotactic frameless biopsy under intraoperative functional neuromonitoring."}
            </p>
          </div>

          {/* Card 3: Molecular Biomarker Orders */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-3.5 transition hover:border-emerald-500 hover:bg-white shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <Dna className="h-3.5 w-3.5 text-emerald-600" />
                <span>Molecular Biomarker Panel Orders</span>
              </span>
              <span className="rounded bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-800">
                WHO CNS5 Classification
              </span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
              {isNoTumor
                ? "No oncologic molecular biomarkers indicated for negative imaging findings."
                : "Order reflex molecular NGS testing: IDH1/IDH2 mutational profiling, 1p/19q codeletion via FISH, MGMT promoter methylation assay, and TERT promoter alterations to guide targeted systemic therapy."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
