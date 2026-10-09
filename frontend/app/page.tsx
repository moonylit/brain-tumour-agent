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
  Zap,
  Globe,
  Database,
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
    <main className="relative min-h-screen bg-[#06080F] text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Ambient background micro-grid with futuristic glow */}
      <div
        className="pointer-events-none fixed inset-0 bg-grid-pattern opacity-70 z-0"
        aria-hidden="true"
      />

      {/* Atmospheric radial gradient spotlight */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[1680px] h-[750px] bg-radial-glow z-0"
        aria-hidden="true"
      />

      {/* Futuristic Cyber-Clinical Side Rail / Command Dock (visible on xl screens) */}
      <aside className="fixed left-4 top-1/2 -translate-y-1/2 hidden 2xl:flex flex-col items-center gap-4 z-40 p-2.5 rounded-2xl border border-cyan-500/30 bg-slate-950/80 backdrop-blur-2xl shadow-[0_0_30px_rgba(6,182,212,0.2)]">
        <a
          href="#upload"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 hover:bg-cyan-500 hover:text-black transition"
          title="Diagnostic Ingest Scanner"
        >
          <Brain className="h-5 w-5" />
          <span className="absolute left-14 whitespace-nowrap rounded-lg border border-cyan-500/40 bg-slate-950 px-2.5 py-1 text-xs font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition shadow-xl pointer-events-none">
            MRI Ingest &amp; Scanner
          </span>
        </a>

        <a
          href="#upload"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-300 transition"
          title="Grad-CAM Thermal Salience"
        >
          <Layers className="h-5 w-5" />
          <span className="absolute left-14 whitespace-nowrap rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs font-mono text-slate-300 opacity-0 group-hover:opacity-100 transition shadow-xl pointer-events-none">
            Grad-CAM Overlay
          </span>
        </a>

        <a
          href="#evaluation"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-300 transition"
          title="Model Benchmarks"
        >
          <BarChart3 className="h-5 w-5" />
          <span className="absolute left-14 whitespace-nowrap rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs font-mono text-slate-300 opacity-0 group-hover:opacity-100 transition shadow-xl pointer-events-none">
            ROC &amp; Confusion Matrix
          </span>
        </a>

        <a
          href="#history"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-300 transition"
          title="Clinical Case Registry"
        >
          <History className="h-5 w-5" />
          <span className="absolute left-14 whitespace-nowrap rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs font-mono text-slate-300 opacity-0 group-hover:opacity-100 transition shadow-xl pointer-events-none">
            Case Registry Archive
          </span>
        </a>

        <div className="my-1 w-6 h-px bg-slate-800" />

        <div className="flex flex-col items-center text-[9px] font-mono text-cyan-400/80">
          <Activity className="h-4 w-4 animate-pulse text-emerald-400 mb-1" />
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
          <div className="relative rounded-3xl border border-cyan-500/30 bg-slate-950/80 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_0_35px_rgba(6,182,212,0.15)] overflow-hidden">
            <div className="hud-corner hud-tl" />
            <div className="hud-corner hud-tr" />
            <div className="hud-corner hud-bl" />
            <div className="hud-corner hud-br" />

            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
              {/* Branding and Suite Reactor Badge */}
              <div className="flex items-center gap-4">
                <div className="relative flex h-13 w-13 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 to-indigo-500/10 text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)] shrink-0">
                  <ShieldCheck className="h-7 w-7 text-cyan-300" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400" />
                  </span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black tracking-tight text-white text-lg sm:text-xl drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                      NeuroAgent — Autonomous Clinical Oncology Suite
                    </span>
                    <span className="rounded-full border border-cyan-400/40 bg-cyan-950/70 px-3 py-0.5 text-xs font-mono font-bold text-cyan-300 shadow-sm">
                      Track 01: SerpApi AI Agent
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold">● ACTIVE NODE:</span>
                    <span>ResNet-50 v2 (25.6M Params) • Grad-CAM Spatial Salience • PubMed &amp; Geo-Referral Engine</span>
                  </p>
                </div>
              </div>

              {/* Dynamic Location Intake & Action Hub */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Region Intake Terminal Input */}
                <div className="flex items-center rounded-2xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/40 transition shadow-inner">
                  <MapPin className="h-4 w-4 text-cyan-400 mr-2 shrink-0 animate-bounce" style={{ animationDuration: '2s' }} />
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => {
                      setDetectError(null);
                      setRegion(e.target.value);
                    }}
                    placeholder="Enter patient referral region (e.g. Mumbai, London)..."
                    className="w-56 sm:w-72 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAutoDetect}
                    disabled={isDetecting}
                    className="tactile-button ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-600/50 transition disabled:opacity-50 shrink-0 shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    title="Auto-detect current location via browser geolocation"
                  >
                    {isDetecting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                    ) : (
                      <Crosshair className="h-3.5 w-3.5 text-cyan-400" />
                    )}
                    <span>Detect My Location</span>
                  </button>
                </div>

                {/* Export Clinical Dossier Action Button */}
                <button
                  type="button"
                  onClick={handleExportDossier}
                  disabled={isExporting}
                  className="tactile-button inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition disabled:opacity-60"
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
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider mr-1">
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
                      ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-bold"
                      : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {hub}
                </button>
              ))}
            </div>

            {/* Live Telemetry Ticker Strip */}
            <div className="mt-3 flex items-center justify-between rounded-xl border border-cyan-500/20 bg-slate-900/40 px-3.5 py-1.5 font-mono text-[11px] text-slate-300 overflow-x-auto">
              <div className="flex items-center gap-2 shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 font-bold">SYSTEM READY:</span>
                <span className="text-slate-400">Jaipur AI Ground Station</span>
              </div>
              <div className="hidden lg:flex items-center gap-6 text-slate-400 shrink-0">
                <span>WHO CNS-5 Standard: <strong className="text-slate-200">Integrated NGS</strong></span>
                <span>Grad-CAM Focal Salience: <strong className="text-cyan-400">Jet Colormap</strong></span>
                <span>Active Routing: <strong className="text-cyan-300">{region || "Jaipur"}</strong></span>
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