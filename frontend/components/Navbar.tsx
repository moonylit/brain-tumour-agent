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
      {/* Left Column */}
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 border border-blue-500/30 overflow-hidden group">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.6)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Advanced Neural SVG */}
          <svg className="w-6 h-6 text-blue-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          CerebrAI
        </h1>
      </div>

      {/* Center Column */}
      <nav className="hidden md:flex items-center gap-2 bg-white px-2 py-2 rounded-full border-2 border-slate-200 shadow-sm">
        <a 
          href="#upload" 
          className="px-6 py-3 text-base font-black text-slate-700 uppercase tracking-wide rounded-full hover:bg-blue-600 hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
        >
          Upload
        </a>
        <a 
          href="#statistics" 
          className="px-6 py-3 text-base font-black text-slate-700 uppercase tracking-wide rounded-full hover:bg-blue-600 hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
        >
          Statistics
        </a>
        <a 
          href="#history" 
          className="px-6 py-3 text-base font-black text-slate-700 uppercase tracking-wide rounded-full hover:bg-blue-600 hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
        >
          History
        </a>
        <a 
          href="#features" 
          className="px-6 py-3 text-base font-black text-slate-700 uppercase tracking-wide rounded-full hover:bg-blue-600 hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
        >
          Features
        </a>
      </nav>


      {/* Right Column */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Powered By
        </span>
        <span className="text-xl font-black text-blue-600">SerpApi</span>
        {isBackendOnline !== false ? (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full animate-pulse shadow-sm ml-2">
            API Online
          </span>
        ) : (
          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full shadow-sm ml-2">
            API Offline
          </span>
        )}
      </div>
    </header>
  );
}