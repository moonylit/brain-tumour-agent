"use client";

import { useEffect, useState } from "react";
import { checkBackendHealth } from "@/lib/api";

interface NavbarProps {
  activePatient?: string;
  onSelectPatient?: (patient: string) => void;
  patients?: string[];
  onAddNewPatient?: (name: string) => void;
}

export default function Navbar({
  activePatient = "Eleanor Vance",
  onSelectPatient,
  patients = ["Eleanor Vance", "Marcus Webb"],
  onAddNewPatient,
}: NavbarProps = {}) {
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const [localPatient, setLocalPatient] = useState(activePatient);
  const [serpApiImgFailed, setSerpApiImgFailed] = useState(false);
  const currentPatient = activePatient ?? localPatient;

  useEffect(() => {
    setLocalPatient(activePatient);
  }, [activePatient]);

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
    <header className="flex items-center justify-between w-full px-8 py-4 bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
      {/* Left Column: SerpApi Branding */}
      <div className="flex items-center">
        <span className="text-sm font-bold text-slate-500 tracking-wider">
          POWERED BY
        </span>
        {!serpApiImgFailed ? (
          <img
            src="https://serpapi.com/images/logo.svg"
            alt="SerpApi"
            className="h-6 ml-2 opacity-80"
            onError={() => setSerpApiImgFailed(true)}
          />
        ) : (
          <span className="ml-2 font-black text-blue-600">SerpApi</span>
        )}
      </div>

      {/* Center Column: Logo and Navigation Group */}
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-extrabold text-slate-900">
          BrainTumourAI
        </h1>
        <nav className="hidden md:flex items-center gap-6 bg-slate-50 px-6 py-2 rounded-full border border-slate-200">
          <a
            href="#upload"
            className="text-sm font-bold text-slate-600 hover:text-blue-600 transition"
          >
            Upload
          </a>
          <a
            href="#history"
            className="text-sm font-bold text-slate-600 hover:text-blue-600 transition"
          >
            History
          </a>
        </nav>
      </div>

      {/* Right Column: Pulsating API Online Badge & Patient Selector */}
      <div className="flex items-center gap-4">
        {/* Patient Selector Dropdown */}
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/90 px-3.5 py-1.5 shadow-2xs">
          <svg
            className="h-3.5 w-3.5 text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <label
            htmlFor="header-patient-select"
            className="text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            Patient:
          </label>
          <select
            id="header-patient-select"
            aria-label="Patient Selector"
            value={currentPatient}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "__add_new__") {
                const newName = window.prompt("Enter new patient full name:");
                if (newName && newName.trim()) {
                  const trimmed = newName.trim();
                  onAddNewPatient?.(trimmed);
                  setLocalPatient(trimmed);
                  onSelectPatient?.(trimmed);
                }
              } else {
                setLocalPatient(val);
                onSelectPatient?.(val);
              }
            }}
            className="bg-transparent text-xs font-extrabold text-slate-800 outline-none cursor-pointer focus:ring-0"
          >
            {patients.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
            <option value="__add_new__">+ Add New Patient</option>
          </select>
        </div>

        {/* Live Pulsating Status Badge */}
        {isBackendOnline !== false ? (
          <div
            title="Backend connected and healthy"
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full shadow-sm text-emerald-400"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest">
              API Online
            </span>
          </div>
        ) : (
          <div
            title="Backend is currently unreachable"
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-full shadow-sm text-slate-400"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400"></span>
            </span>
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-widest">
              API Offline
            </span>
          </div>
        )}
      </div>
    </header>
  );
}