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
    <main className="relative min-h-screen w-full bg-slate-50 text-slate-900 selection:bg-cyan-600 selection:text-white">
      {/* Background Atmosphere */}
      <div
        className="pointer-events-none fixed inset-0 bg-grid-pattern opacity-50 z-0"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 bg-radial-glow z-0"
        aria-hidden="true"
      />

      {/* Full-width sticky Navbar */}
      <Navbar />

      {/* Main Content Expansive Viewport Container */}
      <div className="relative z-10 flex flex-col w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-10">
        {/* ------------------------------------------------------------- */}
        {/* EXECUTIVE HEADER PLATE: LOCATION INTAKE & DOSSIER EXPORT      */}
        {/* ------------------------------------------------------------- */}
        <section className="w-full">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-r from-white via-slate-50/70 to-white p-6 sm:p-7 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
            {/* Subtle top cyan/violet accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-600 via-sky-500 to-violet-600" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Branding Block */}
              <div className="flex items-start sm:items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-50 to-sky-100 border border-cyan-200 text-cyan-700 shadow-md shadow-cyan-600/10 shrink-0">
                  <ShieldCheck className="h-6 w-6 text-cyan-600" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-extrabold tracking-tight text-slate-900 text-lg sm:text-xl">
                      NeuroAgent — Autonomous Clinical Oncology Suite
                    </h1>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300 bg-cyan-50 px-2.5 py-0.5 text-[11px] font-mono font-bold text-cyan-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 animate-ping" />
                      Live Clinical Session
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-2xl">
                    AI-assisted MRI classification, Grad-CAM localization, and regional cancer center referral routing.
                  </p>
                </div>
              </div>

              {/* Dynamic Location Intake & Action Hub */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Region Intake Input with Inline Detect */}
                <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3.5 py-2 shadow-sm focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
                  <MapPin className="h-4 w-4 text-cyan-600 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => {
                      setDetectError(null);
                      setRegion(e.target.value);
                    }}
                    placeholder="Enter patient referral region (e.g. Mumbai, London)..."
                    className="w-56 sm:w-72 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAutoDetect}
                    disabled={isDetecting}
                    className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition disabled:opacity-50 shrink-0 shadow-sm"
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
                  className="tactile-button inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-cyan-600/20 hover:shadow-lg hover:shadow-cyan-600/30 transition disabled:opacity-50 shrink-0"
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

            {/* Quick Metro Hub Pills & Inline Notice */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
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
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition shadow-sm ${
                      region.toLowerCase() === hub.toLowerCase()
                        ? "bg-cyan-600 text-white border border-cyan-600 font-bold shadow-cyan-600/20"
                        : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/90"
                    }`}
                  >
                    {hub}
                  </button>
                ))}
              </div>

              {/* Subdued Inline Alert Notices */}
              {detectError && (
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs text-amber-800 font-medium">
                  <span>Location note: {detectError}</span>
                  <button
                    onClick={() => setDetectError(null)}
                    className="text-amber-600 hover:text-amber-900 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {exportError && (
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs text-rose-800 font-medium">
                  <span>Export note: {exportError}</span>
                  <button
                    onClick={() => setExportError(null)}
                    className="text-rose-600 hover:text-rose-900 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
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