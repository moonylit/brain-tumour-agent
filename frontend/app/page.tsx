"use client";

import { useState } from "react";
import NeuroCommandCenter from "@/components/NeuroCommandCenter";
import PatientArchiveDrawer from "@/components/PatientArchiveDrawer";
import { downloadReport, formatApiError, PredictionResponse } from "@/lib/api";

export default function Home() {
  const [region, setRegion] = useState("Jaipur");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [latestPrediction, setLatestPrediction] = useState<PredictionResponse | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

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
    <div className="h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 selection:bg-cyan-600 selection:text-white flex flex-col font-sans">
      {/* Background Subtle Atmosphere */}
      <div
        className="pointer-events-none fixed inset-0 bg-grid-pattern opacity-40 z-0"
        aria-hidden="true"
      />

      {/* 100vh Full-Screen Clinical Command Center */}
      <div className="relative z-10 w-full h-full flex flex-col overflow-hidden">
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
      </div>

      {/* Slide-out Scan Archive Drawer */}
      <PatientArchiveDrawer
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
      />
    </div>
  );
}