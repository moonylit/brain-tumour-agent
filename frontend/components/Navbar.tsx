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
    <header className="w-full flex flex-col items-center justify-center py-6 border-b border-slate-200 bg-white shadow-sm sticky top-0 z-50">
      <div className="flex flex-col items-center gap-3 w-full max-w-7xl px-4 sm:px-6">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <a href="#" className="group flex items-center">
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-200 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-all">
                <svg
                  className="h-7 w-7 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z" />
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z" />
                </svg>
              </div>
              <span>BrainTumourAI</span>
            </h1>
          </a>

          {/* Minimal Backend Status Pill */}
          {isBackendOnline !== null && (
            <span
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold transition shadow-xs ${
                isBackendOnline
                  ? "bg-emerald-100 text-emerald-700 text-emerald-400 border border-emerald-300"
                  : "border border-slate-300 bg-slate-100 text-slate-500 text-slate-400"
              }`}
              title={
                isBackendOnline
                  ? "Backend connected and healthy"
                  : "Backend is currently unreachable"
              }
            >
              <span className="relative flex h-2.5 w-2.5">
                {isBackendOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isBackendOnline ? "bg-emerald-500" : "bg-slate-500"
                  }`}
                />
              </span>
              {isBackendOnline ? "API Online" : "API Offline"}
            </span>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm sm:text-base font-semibold text-slate-600 mt-1">
          <a
            href="#upload"
            className="rounded-xl px-4 py-1.5 transition hover:bg-blue-50 hover:text-blue-700"
          >
            Upload
          </a>
          <a
            href="#evaluation"
            className="rounded-xl px-4 py-1.5 transition hover:bg-blue-50 hover:text-blue-700"
          >
            Evaluation
          </a>
          <a
            href="#stats"
            className="rounded-xl px-4 py-1.5 transition hover:bg-blue-50 hover:text-blue-700"
          >
            Statistics
          </a>
          <a
            href="#history"
            className="rounded-xl px-4 py-1.5 transition hover:bg-blue-50 hover:text-blue-700"
          >
            History
          </a>
          <a
            href="#features"
            className="rounded-xl px-4 py-1.5 transition hover:bg-blue-50 hover:text-blue-700"
          >
            Features
          </a>
        </nav>
      </div>
    </header>
  );
}