"use client";

import React, { useState } from "react";
import { Activity, Cpu, Gauge, ShieldCheck, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

export default function SystemMetricsBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition"
        title="Toggle System Metrics Telemetry"
      >
        <Activity className="h-4 w-4 text-blue-600" />
        <span>⚡ System Metrics</span>
        {isExpanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        )}
      </button>

      {/* Collapsible Banner Overlay / Dropdown */}
      {isExpanded && (
        <div className="absolute right-0 top-full mt-2 z-40 w-80 sm:w-96 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Model Telemetry &amp; System Health</span>
            </span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
              LIVE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Metric 1 */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-2.5">
              <span className="text-[10px] font-mono font-semibold text-slate-400 block uppercase">
                Model Accuracy
              </span>
              <span className="text-sm font-extrabold font-mono text-blue-700 mt-0.5 block">
                98.09% (ResNet-50)
              </span>
            </div>

            {/* Metric 2 */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-2.5">
              <span className="text-[10px] font-mono font-semibold text-slate-400 block uppercase">
                Inference Latency
              </span>
              <span className="text-sm font-extrabold font-mono text-cyan-700 mt-0.5 block">
                125.46 ms
              </span>
            </div>

            {/* Metric 3 */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-2.5">
              <span className="text-[10px] font-mono font-semibold text-slate-400 block uppercase">
                Analyzed Scans
              </span>
              <span className="text-sm font-extrabold font-mono text-slate-900 mt-0.5 block">
                1,420+ Clinical
              </span>
            </div>

            {/* Metric 4 */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-2.5">
              <span className="text-[10px] font-mono font-semibold text-slate-400 block uppercase">
                FastAPI Gateway
              </span>
              <span className="text-sm font-extrabold font-mono text-emerald-700 mt-0.5 block">
                127.0.0.1:8000
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
