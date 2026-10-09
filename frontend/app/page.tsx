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
import { MapPin, Crosshair, FileDown, Loader2, ShieldCheck } from "lucide-react";

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
    <main className="relative min-h-screen bg-[#070A11] text-slate-100 selection:bg-cyan-600 selection:text-white">
      {/* Ambient background micro-grid */}
      <div
        className="pointer-events-none fixed inset-0 bg-grid-pattern opacity-60 z-0"
        aria-hidden="true"
      />

      {/* Atmospheric radial gradient spotlight */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[1680px] h-[650px] bg-radial-glow z-0"
        aria-hidden="true"
      />

      {/* Widescreen Content wrapper */}
      <div className="relative z-10 flex flex-col max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Navbar />

        {/* ------------------------------------------------------------- */}
        {/* STITCH CLINICAL SUITE TOP BAR & LOCATION INTAKE               */}
        {/* ------------------------------------------------------------- */}
        <section className="mt-6 mx-auto w-full">
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl p-4 sm:p-5 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Project Branding & System Telemetry */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold tracking-tight text-white text-base sm:text-lg">
                      NeuroAgent — Autonomous Clinical Oncology Suite
                    </span>
                    <span className="hidden sm:inline-flex rounded-full border border-cyan-400/30 bg-cyan-950/60 px-2.5 py-0.5 text-[10px] font-mono font-medium text-cyan-300">
                      Track 01
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    SerpApi CDS Agent • ResNet-50 v2 • Grad-CAM Spatial Localization
                  </p>
                </div>
              </div>

              {/* Dynamic Location Intake & Action Hub */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Region Intake Pill */}
                <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-1.5 focus-within:border-cyan-500/80 focus-within:ring-1 focus-within:ring-cyan-500/50 transition">
                  <MapPin className="h-4 w-4 text-cyan-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => {
                      setDetectError(null);
                      setRegion(e.target.value);
                    }}
                    placeholder="Enter patient referral region (e.g. Mumbai, London)..."
                    className="w-56 sm:w-72 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAutoDetect}
                    disabled={isDetecting}
                    className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900/60 border border-cyan-700/50 transition disabled:opacity-50 shrink-0"
                    title="Auto-detect current location via browser geolocation"
                  >
                    {isDetecting ? (
                      <Loader2 className="h-3 w-3 animate-spin text-cyan-400" />
                    ) : (
                      <Crosshair className="h-3 w-3 text-cyan-400" />
                    )}
                    <span>Detect My Location</span>
                  </button>
                </div>

                {/* Export Clinical Dossier Action Button */}
                <button
                  type="button"
                  onClick={handleExportDossier}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-[0_0_20px_rgba(6,182,212,0.25)] transition hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] disabled:opacity-60"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4" />
                  )}
                  <span>Export Clinical Dossier (PDF)</span>
                </button>
              </div>
            </div>

            {/* Error alerts if any */}
            {detectError && (
              <p className="mt-2 text-[11px] text-amber-400 font-mono">
                Location detection note: {detectError}
              </p>
            )}
            {exportError && (
              <p className="mt-2 text-[11px] text-rose-400 font-mono">
                Export note: {exportError}
              </p>
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