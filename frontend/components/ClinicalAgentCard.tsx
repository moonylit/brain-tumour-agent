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
      <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/70 p-6 backdrop-blur-md shadow-xl animate-pulse">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
          <div className="space-y-2">
            <div className="h-4 w-44 rounded bg-cyan-500/30" />
            <div className="h-3 w-64 rounded bg-slate-700/50" />
          </div>
          <span className="h-6 w-28 rounded-full bg-cyan-500/20" />
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

  const effectiveRegion = region || research.region || research.patient_city || "Jaipur";

  return (
    <div className="flex flex-col rounded-2xl border border-cyan-500/30 bg-slate-950/85 p-6 backdrop-blur-xl shadow-[0_10px_35px_-15px_rgba(6,182,212,0.25)]">
      {/* Panel Header */}
      <div className="border-b border-white/[0.08] pb-4 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-950/60 px-2.5 py-0.5 text-xs font-mono font-medium text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              SerpApi AI Agent (Track 01)
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-0.5 text-[11px] font-mono text-slate-300">
              <MapPin className="h-3 w-3 text-cyan-400" />
              {effectiveRegion}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isNoTumor
                ? "border border-emerald-500/30 bg-emerald-950/50 text-emerald-300"
                : "border border-amber-500/30 bg-amber-950/50 text-amber-300"
            }`}
          >
            {isNoTumor ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Baseline Guidance</span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                <span>Escalation Recommended</span>
              </>
            )}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyan-400" />
          Autonomous Clinical Agent Research &amp; Care Facilities
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          SerpApi Tools: <code className="text-cyan-300 font-mono">web_search</code> (PubMed/NCCN) &amp;{" "}
          <code className="text-cyan-300 font-mono">maps_search</code> (Tertiary Oncology Centers in {effectiveRegion})
        </p>
      </div>

      {/* Clinical Guidance / Decision Support Summary */}
      <div
        className={`mb-5 rounded-xl border p-4 text-xs leading-relaxed ${
          isNoTumor
            ? "border-emerald-500/25 bg-emerald-950/20 text-emerald-200/90"
            : "border-cyan-500/25 bg-cyan-950/25 text-slate-200"
        }`}
      >
        <div className="flex items-center gap-2 mb-1.5 font-semibold">
          <Zap className={`h-4 w-4 ${isNoTumor ? "text-emerald-400" : "text-cyan-400"}`} />
          <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
            Synthesized Clinical Action Plan
          </span>
        </div>
        <p className="leading-relaxed">{research.clinical_summary}</p>
      </div>

      {/* Autonomous Queries Collapsible */}
      {research.queries_executed && research.queries_executed.length > 0 && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowQueries(!showQueries)}
            className="flex items-center justify-between w-full text-left font-mono text-[11px] text-slate-400 hover:text-slate-200 transition py-1"
          >
            <span className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-cyan-400" />
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
            <div className="mt-2 space-y-1.5 rounded-lg border border-white/[0.06] bg-slate-900/60 p-2.5 text-[11px] font-mono text-slate-300">
              {research.queries_executed.map((q, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="text-cyan-400">›</span>
                  <span className="break-all">{q}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Selectors (3 Sleek Tabs from Stitch Clinical Suite) */}
      <div className="flex border-b border-white/[0.08] mb-4 gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("facilities")}
          className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold whitespace-nowrap transition border-b-2 ${
            activeTab === "facilities"
              ? "border-emerald-400 text-emerald-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>Regional Care Centers ({research.facilities?.length || 0})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("literature")}
          className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold whitespace-nowrap transition border-b-2 ${
            activeTab === "literature"
              ? "border-cyan-400 text-cyan-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Peer-Reviewed Literature &amp; Trials ({research.articles?.length || 0})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("protocol")}
          className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold whitespace-nowrap transition border-b-2 ${
            activeTab === "protocol"
              ? "border-purple-400 text-purple-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
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
            <div className="rounded-xl border border-white/[0.04] bg-slate-900/40 p-4 text-center">
              <p className="text-xs text-slate-400">
                {isNoTumor
                  ? "Scan is nominal. Specialized tertiary oncology hospital referral is not required."
                  : `No localized hospital facilities found in ${effectiveRegion}.`}
              </p>
            </div>
          ) : (
            research.facilities.slice(0, 3).map((facility, idx) => (
              <div
                key={idx}
                className="group rounded-xl border border-white/[0.06] bg-slate-900/60 p-3.5 transition hover:border-emerald-500/40 hover:bg-slate-900/90"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-emerald-200 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>{facility.name}</span>
                  </h4>
                  {facility.rating !== null && facility.rating !== undefined && (
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-amber-300 border border-amber-500/20">
                      ★ {facility.rating}
                    </span>
                  )}
                </div>

                {facility.address && (
                  <p className="text-[11px] text-slate-400 flex items-start gap-1.5 mb-2 leading-relaxed">
                    <MapPin className="h-3 w-3 text-slate-500 shrink-0 mt-0.5" />
                    <span>{facility.address}</span>
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400 pt-2 border-t border-white/[0.04]">
                  {facility.phone ? (
                    <a
                      href={`tel:${facility.phone.replace(/[^0-9+]/g, "")}`}
                      className="inline-flex items-center gap-1 text-slate-300 hover:text-cyan-300 transition"
                      title="Direct phone dialer"
                    >
                      <Phone className="h-3 w-3 text-cyan-400" />
                      <span>{facility.phone}</span>
                    </a>
                  ) : (
                    <span className="text-slate-500">Regional care navigator</span>
                  )}

                  {facility.link && (
                    <a
                      href={facility.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline inline-flex items-center gap-1 ml-auto text-[11px] font-sans"
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
            <p className="text-xs text-slate-400 py-4 text-center">
              No literature entries returned for this scan.
            </p>
          ) : (
            research.articles.slice(0, 3).map((article, idx) => (
              <div
                key={idx}
                className="group rounded-xl border border-white/[0.06] bg-slate-900/60 p-3.5 transition hover:border-cyan-500/40 hover:bg-slate-900/90"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-200 leading-snug">
                    {article.title}
                  </h4>
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                      title="Open publication"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed mb-2.5">
                  {article.snippet}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1.5 border-t border-white/[0.04]">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 text-cyan-300 border border-slate-700/50 truncate max-w-[200px]">
                    {article.source || "PubMed / Medical Registry"}
                  </span>
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-sans text-[11px]"
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
          <div className="rounded-xl border border-white/[0.06] bg-slate-900/60 p-3.5 transition hover:border-cyan-500/40">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                <FileText className="h-3.5 w-3.5 text-cyan-400" />
                <span>Multiparametric MRI Imaging Sequence</span>
              </span>
              <span className="rounded bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                ACR / EANO Protocol
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {isNoTumor
                ? "Reassuring baseline neuroimaging. Maintain regular clinical follow-up; repeat high-resolution axial T1/T2 imaging only if focal neurological deficits manifest."
                : "Acquire volumetric 3D T1-weighted pre- & post-gadolinium contrast, axial T2-FLAIR, and DWI/ADC mapping to quantify peritumoral vasogenic edema, necrotic core boundaries, and midline shift."}
            </p>
          </div>

          {/* Card 2: Surgical Pathway */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-900/60 p-3.5 transition hover:border-purple-500/40">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                <Compass className="h-3.5 w-3.5 text-purple-400" />
                <span>Surgical Pathway &amp; Resection Strategy</span>
              </span>
              <span className="rounded bg-purple-950/60 border border-purple-800/50 px-2 py-0.5 text-[10px] font-mono text-purple-300">
                Neurosurgery Directive
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {isNoTumor
                ? "No surgical intervention indicated. Routine neurological outpatient evaluation if secondary headache symptoms persist."
                : "Multidisciplinary neurosurgical review for 5-ALA fluorescence-guided maximal safe gross total resection (GTR) or stereotactic frameless biopsy under intraoperative functional neuromonitoring."}
            </p>
          </div>

          {/* Card 3: Molecular Biomarker Orders */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-900/60 p-3.5 transition hover:border-emerald-500/40">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                <Dna className="h-3.5 w-3.5 text-emerald-400" />
                <span>Molecular Biomarker Panel Orders</span>
              </span>
              <span className="rounded bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                WHO CNS5 Classification
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
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
