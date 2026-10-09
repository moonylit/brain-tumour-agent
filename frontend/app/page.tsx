"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import UploadCard from "@/components/UploadCard";
import EvaluationCard from "@/components/EvaluationCard";
import Features from "@/components/Features";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";
import NeuroCommandCenter from "@/components/NeuroCommandCenter";
import PatientArchiveDrawer from "@/components/PatientArchiveDrawer";
import { downloadReport, formatApiError, PredictionResponse } from "@/lib/api";
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
  const [latestPrediction, setLatestPrediction] = useState<PredictionResponse | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

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
      <div className="relative z-10 flex flex-col w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-4 gap-6">
        {/* ============================================================= */}
        {/* UNIFIED MINIMALIST CLINICAL COMMAND CENTER                    */}
        {/* ============================================================= */}
        <NeuroCommandCenter
          latestPredictionResult={
            latestPrediction
              ? {
                  prediction: latestPrediction.prediction,
                  confidence: latestPrediction.confidence,
                  heatmapFilename: latestPrediction.heatmap_filename,
                  rawHeatmapFilename: latestPrediction.raw_heatmap_filename,
                  region: latestPrediction.region || region,
                }
              : null
          }
          onOpenArchive={() => setIsArchiveOpen(true)}
          onExportPdf={handleExportDossier}
          isExporting={isExporting}
        />

        <Hero />
        <UploadCard
          region={region}
          onRegionChange={setRegion}
          onPredictionSuccess={setLatestPrediction}
        />
        <EvaluationCard />
        <Features />
        <Stats />
        <Footer />
      </div>

      {/* ============================================================= */}
      {/* SLIDE-OUT SCAN ARCHIVE & PREDICTION HISTORY DRAWER             */}
      {/* ============================================================= */}
      <PatientArchiveDrawer
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
      />
    </main>
  );
}