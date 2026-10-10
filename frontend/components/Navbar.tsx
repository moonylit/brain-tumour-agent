"use client";

import { useEffect, useState } from "react";
import { checkBackendHealth } from "@/lib/api";

interface NavbarProps {
  activePatient?: string;
  onSelectPatient?: (patient: string) => void;
  patients?: string[];
  onAddNewPatient?: (name: string) => void;
}

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
    <header className="flex justify-between items-center w-full px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      {/* Left */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Powered By
        </span>
        <span className="font-black text-lg text-blue-600">SerpApi</span>
      </div>

      {/* Center */}
      <nav className="hidden md:flex items-center gap-8 bg-slate-50 px-6 py-2 rounded-full border border-slate-200">
        <a
          href="#upload"
          className="text-sm font-bold text-slate-600 hover:text-blue-600 transition"
        >
          Upload
        </a>
        <a
          href="#statistics"
          className="text-sm font-bold text-slate-600 hover:text-blue-600 transition"
        >
          Statistics
        </a>
        <a
          href="#history"
          className="text-sm font-bold text-slate-600 hover:text-blue-600 transition"
        >
          History
        </a>
        <a
          href="#features"
          className="text-sm font-bold text-slate-600 hover:text-blue-600 transition"
        >
          Features
        </a>
      </nav>

      {/* Right */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          BrainTumourAI
        </h1>
        {isBackendOnline !== false ? (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full animate-pulse shadow-sm">
            API Online
          </span>
        ) : (
          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full shadow-sm">
            API Offline
          </span>
        )}
      </div>
    </header>
  );
}