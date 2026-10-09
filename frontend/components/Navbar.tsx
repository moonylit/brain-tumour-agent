"use client";

import { useEffect, useState } from "react";
import { checkBackendHealth } from "@/lib/api";

export default function Navbar() {
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkHealth() {
      try {
        const res = await checkBackendHealth();
        if (isMounted) {
          setIsBackendOnline(res?.status === "healthy");
        }
      } catch {
        if (isMounted) {
          setIsBackendOnline(false);
        }
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-8 py-3.5">
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="group flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight text-slate-900 transition hover:text-cyan-700"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300 bg-cyan-50 text-cyan-600 shadow-sm transition group-hover:border-cyan-400 group-hover:bg-cyan-100">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z" />
              </svg>
            </div>
            <span className="font-extrabold tracking-tight text-slate-900">
              BrainTumourAI
            </span>
            <span className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-cyan-300 bg-cyan-50 px-2.5 py-0.5 text-[11px] font-mono font-bold text-cyan-800">
              NeuroAgent Suite
            </span>
          </a>

          {/* Minimal Backend Status Pill */}
          {isBackendOnline !== null && (
            <span
              className={`hidden items-center gap-2 rounded-full px-3 py-1 text-xs font-mono font-bold sm:inline-flex transition ${
                isBackendOnline
                  ? "border border-emerald-300 bg-emerald-50 text-emerald-400 shadow-sm"
                  : "border border-slate-200 bg-slate-100 text-slate-400"
              }`}
              title={
                isBackendOnline
                  ? "Backend connected and healthy"
                  : "Backend is currently unreachable"
              }
            >
              <span className="relative flex h-2 w-2">
                {isBackendOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isBackendOnline ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
              </span>
              {isBackendOnline ? "API Online" : "API Offline"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-slate-600">
          <a
            href="#upload"
            className="rounded-lg px-3 py-1.5 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Upload
          </a>
          <a
            href="#evaluation"
            className="rounded-lg px-3 py-1.5 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Evaluation
          </a>
          <a
            href="#stats"
            className="rounded-lg px-3 py-1.5 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Statistics
          </a>
          <a
            href="#history"
            className="rounded-lg px-3 py-1.5 transition hover:bg-slate-100 hover:text-slate-900"
          >
            History
          </a>
          <a
            href="#features"
            className="rounded-lg px-3 py-1.5 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Features
          </a>
        </div>
      </nav>
    </header>
  );
}