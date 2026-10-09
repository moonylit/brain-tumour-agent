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
  Brain,
  Layers,
  Activity,
  BarChart3,
  History,
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
      {/* Ambient background micro-grid with clinical glow */}
      <div
        className="pointer-events-none fixed inset-0 bg-grid-pattern opacity-80 z-0"
        aria-hidden="true"
      />

      {/* Atmospheric radial gradient spotlight */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[1680px] h-[750px] bg-radial-glow z-0"
        aria-hidden="true"
      />

      {/* Cyber-Clinical Side Rail / Command Dock (visible on 2xl screens) */}
      <aside className="fixed left-4 top-1/2 -translate-y-1/2 hidden 2xl:flex flex-col items-center gap-4 z-40 p-2.5 rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-2xl shadow-xl shadow-slate-200/50">
        <a
          href="#upload"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-600 hover:text-white transition shadow-sm"
          title="Diagnostic Ingest Scanner"
        >
          <Brain className="h-5 w-5" />
          <span className="absolute left-14 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-mono text-slate-800 opacity-0 group-hover:opacity-100 transition shadow-lg pointer-events-none font-semibold">
            MRI Ingest &amp; Scanner
          </span>
        </a>

        <a
          href="#upload"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-cyan-400 hover:text-cyan-700 transition"
          title="Grad-CAM Thermal Salience"
        >
          <Layers className="h-5 w-5" />
          <span className="absolute left-14 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-mono text-slate-800 opacity-0 group-hover:opacity-100 transition shadow-lg pointer-events-none font-semibold">
            Grad-CAM Overlay
          </span>
        </a>

        <a
          href="#evaluation"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-cyan-400 hover:text-cyan-700 transition"
          title="Model Benchmarks"
        >
          <BarChart3 className="h-5 w-5" />
          <span className="absolute left-14 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-mono text-slate-800 opacity-0 group-hover:opacity-100 transition shadow-lg pointer-events-none font-semibold">
            ROC &amp; Confusion Matrix
          </span>
        </a>

        <a
          href="#history"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-cyan-400 hover:text-cyan-700 transition"
          title="Clinical Case Registry"
        >
          <History className="h-5 w-5" />
          <span className="absolute left-14 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-mono text-slate-800 opacity-0 group-hover:opacity-100 transition shadow-lg pointer-events-none font-semibold">
            Case Registry Archive
          </span>
        </a>

        <div className="my-1 w-6 h-px bg-slate-200" />

        <div className="flex flex-col items-center text-[9px] font-mono text-cyan-700 font-bold">
          <Activity className="h-4 w-4 animate-pulse text-emerald-600 mb-1" />
          <span>LIVE</span>
        </div>
      </aside>

      {/* Widescreen Content wrapper */}
      <div className="relative z-10 flex flex-col max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Navbar />

        {/* ------------------------------------------------------------- */}
        {/* MISSION CONTROL TOP BAR: CYBER CLINICAL LOCATION & DOSSIER    */}
        {/* ------------------------------------------------------------- */}
        <section className="mt-6 mx-auto w-full">
          <div className="relative rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-2xl p-5 sm:p-6 shadow-xl shadow-slate-200/60 overflow-hidden">
            <div className="hud-corner hud-tl" />
            <div className="hud-corner hud-tr" />
            <div className="hud-corner hud-bl" />
            <div className="hud-corner hud-br" />

            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
              {/* Branding and Suite Reactor Badge */}
              <div className="flex items-center gap-4">
                <div className="relative flex h-13 w-13 items-center justify-center rounded-2xl border border-cyan-300 bg-gradient-to-br from-cyan-50 to-violet-50 text-cyan-600 shadow-md shrink-0">
                  <ShieldCheck className="h-7 w-7 text-cyan-600" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-600" />
                  </span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black tracking-tight text-slate-900 text-lg sm:text-xl">
                      NeuroAgent — Autonomous Clinical Oncology Suite
                    </span>
                    <span className="rounded-full border border-cyan-300 bg-cyan-50 px-3 py-0.5 text-xs font-mono font-bold text-cyan-800 shadow-sm">
                      Track 01: SerpApi AI Agent
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">● ACTIVE NODE:</span>
                    <span className="font-medium">ResNet-50 v2 (25.6M Params) • Grad-CAM Spatial Salience • PubMed &amp; Geo-Referral Engine</span>
                  </p>
                </div>
              </div>

              {/* Dynamic Location Intake & Action Hub */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Region Intake Terminal Input */}
                <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 focus-within:border-cyan-600 focus-within:ring-2 focus-within:ring-cyan-500/20 transition shadow-inner">
                  <MapPin className="h-4 w-4 text-cyan-600 mr-2 shrink-0 animate-bounce" style={{ animationDuration: '2s' }} />
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => {
                      setDetectError(null);
                      setRegion(e.target.value);
                    }}
                    placeholder="Enter patient referral region (e.g. Mumbai, London)..."
                    className="w-56 sm:w-72 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleAutoDetect}
                    disabled={isDetecting}
                    className="tactile-button ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-cyan-800 bg-cyan-100 hover:bg-cyan-200 border border-cyan-300 transition disabled:opacity-50 shrink-0 shadow-sm"
                    title="Auto-detect current location via browser geolocation"
                  >
                    {isDetecting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-700" />
                    ) : (
                      <Crosshair className="h-3.5 w-3.5 text-cyan-700" />
                    )}
                    <span>Detect My Location</span>
                  </button>
                </div>

                {/* Export Clinical Dossier Action Button */}
                <button
                  type="button"
                  onClick={handleExportDossier}
                  disabled={isExporting}
                  className="tactile-button inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-cyan-600/30 hover:shadow-xl hover:shadow-cyan-600/40 transition disabled:opacity-60"
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
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-[11px] text-slate-500 uppercase tracking-wider mr-1 font-semibold">
                Quick Regional Hubs:
              </span>
              {QUICK_METRO_HUBS.map((hub) => (
                <button
                  key={hub}
                  type="button"
                  onClick={() => {
                    setDetectError(null);
                    setRegion(hub);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                    region.toLowerCase() === hub.toLowerCase()
                      ? "bg-cyan-100 text-cyan-900 border border-cyan-400 shadow-sm font-bold"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {hub}
                </button>
              ))}
            </div>

            {/* Live Telemetry Ticker Strip */}
            <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 font-mono text-[11px] text-slate-600 overflow-x-auto">
              <div className="flex items-center gap-2 shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-emerald-700 font-bold">SYSTEM READY:</span>
                <span className="text-slate-500">Jaipur AI Ground Station</span>
              </div>
              <div className="hidden lg:flex items-center gap-6 text-slate-500 shrink-0">
                <span>WHO CNS-5 Standard: <strong className="text-slate-700">Integrated NGS</strong></span>
                <span>Grad-CAM Focal Salience: <strong className="text-cyan-700 font-bold">Jet Colormap</strong></span>
                <span>Active Routing: <strong className="text-violet-700 font-bold">{region || "Jaipur"}</strong></span>
              </div>
            </div>

            {/* Error alerts if any */}
            {detectError && (
              <p className="mt-2 text-[11px] text-amber-700 font-mono font-medium">
                Location detection note: {detectError}
              </p>
            )}
            {exportError && (
              <p className="mt-2 text-[11px] text-rose-700 font-mono font-medium">
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