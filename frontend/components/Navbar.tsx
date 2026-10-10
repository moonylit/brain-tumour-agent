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
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          BrainTumourAI
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