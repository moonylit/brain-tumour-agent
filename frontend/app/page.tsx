"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import UploadCard from "@/components/UploadCard";
import EvaluationCard from "@/components/EvaluationCard";
import Features from "@/components/Features";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";
import { downloadReport, formatApiError } from "@/lib/api";
import {
  MapPin,
  Crosshair,
  FileDown,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";

const QUICK_METRO_HUBS = [
  "Jaipur",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "London",
  "New York",
  "Boston",
];

export default function Home() {
  const [region, setRegion] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      setDetectError("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);
    setDetectError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                "Accept-Language": "en",
              },
            }
          );
          if (!res.ok) {
            throw new Error("Geocoding service unavailable");
          }
          const data = await res.json();
          const address = data.address || {};
          const detectedCity =
            address.city ||
            address.town ||
            address.state_district ||
            address.state ||
            "Jaipur";

          setRegion(detectedCity);
        } catch {
          setDetectError("Unable to resolve city name. Enter city manually.");
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        setIsDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setDetectError("Location access denied by user.");
        } else {
          setDetectError("Location signal timed out.");
        }
      },
      { timeout: 8000 }
    );
  };

  const handleExportDossier = async () => {
    try {
      setIsExporting(true);
      setExportError(null);
      await downloadReport(region && region.trim() ? region.trim() : "Jaipur");
    } catch (err) {
      console.error("PDF Export failed:", err);
      setExportError(formatApiError(err));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-slate-50 text-slate-900 selection:bg-cyan-600 selection:text-white">
      {/* Subtle background micro-grid */}
      <div
        className="pointer-events-none fixed inset-0 bg-grid-pattern opacity-60 z-0"
        aria-hidden="true"
      />

      {/* Atmospheric radial gradient */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-radial-glow z-0"
        aria-hidden="true"
      />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Navbar />

        {/* ------------------------------------------------------------- */}
        {/* EXECUTIVE HEADER PLATE: LOCATION INTAKE & DOSSIER EXPORT      */}
        {/* ------------------------------------------------------------- */}
        <section className="mt-4 mx-auto w-full">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              {/* Branding */}
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 shadow-sm shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>

                <div>
                  <h1 className="font-extrabold tracking-tight text-slate-900 text-lg sm:text-xl">
                    NeuroAgent — Autonomous Clinical Oncology Suite
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    AI-assisted MRI classification, Grad-CAM localization, and regional cancer center referral routing.
                  </p>
                </div>
              </div>

              {/* Dynamic Location Intake & Action Hub */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Region Intake Input */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 focus-within:border-cyan-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-cyan-500/10 transition">
                  <MapPin className="h-4 w-4 text-cyan-600 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => {
                      setDetectError(null);
                      setRegion(e.target.value);
                    }}
                    placeholder="Enter patient referral region (e.g. Mumbai, London)..."
                    className="w-52 sm:w-64 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAutoDetect}
                    disabled={isDetecting}
                    className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-800 bg-cyan-100/70 hover:bg-cyan-100 border border-cyan-200 transition disabled:opacity-50 shrink-0"
                    title="Auto-detect current location"
                  >
                    {isDetecting ? (
                      <Loader2 className="h-3 w-3 animate-spin text-cyan-700" />
                    ) : (
                      <Crosshair className="h-3 w-3 text-cyan-700" />
                    )}
                    <span>Detect My Location</span>
                  </button>
                </div>

                {/* Export Clinical Dossier Action Button */}
                <button
                  type="button"
                  onClick={handleExportDossier}
                  disabled={isExporting}
                  className="tactile-button inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition disabled:opacity-50"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4 text-white" />
                  )}
                  <span>Export Clinical Dossier (PDF)</span>
                </button>
              </div>
            </div>

            {/* Quick Metro Hub Pills */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                Regional Hubs:
              </span>
              {QUICK_METRO_HUBS.map((hub) => (
                <button
                  key={hub}
                  type="button"
                  onClick={() => {
                    setDetectError(null);
                    setRegion(hub);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    region.toLowerCase() === hub.toLowerCase()
                      ? "bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold"
                      : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {hub}
                </button>
              ))}
            </div>

            {/* Error alerts if user explicitly triggered an error */}
            {detectError && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs text-amber-800">
                <span>Location note: {detectError}</span>
                <button
                  onClick={() => setDetectError(null)}
                  className="text-amber-600 hover:text-amber-900"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {exportError && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-rose-50 border border-rose-200 px-3 py-1.5 text-xs text-rose-800">
                <span>Export note: {exportError}</span>
                <button
                  onClick={() => setExportError(null)}
                  className="text-rose-600 hover:text-rose-900"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </section>

        <Hero />
        <UploadCard region={region} onRegionChange={setRegion} />
        <EvaluationCard />
        <Features />
        <Stats />
        <Footer />
      </div>
    </main>
  );
}