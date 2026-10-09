"use client";

import React, { useState, useEffect } from "react";
import {
  Patient,
  ScanRecord,
  INITIAL_PATIENTS,
  INITIAL_SCANS,
  estimateTumorAreaFromPrediction,
} from "@/lib/mockData";
import PatientDirectory from "./PatientDirectory";
import ProgressionChart from "./ProgressionChart";
import GeospatialTriage from "./GeospatialTriage";
import ScanVisualizer from "./ScanVisualizer";
import {
  Activity,
  Calendar,
  FileDown,
  FolderArchive,
  Loader2,
} from "lucide-react";

export interface NeuroCommandCenterProps {
  latestPredictionResult?: {
    prediction: string;
    confidence: number;
    heatmapFilename: string;
    rawHeatmapFilename?: string;
    region?: string;
  } | null;
  onOpenArchive?: () => void;
  onExportPdf?: () => void;
  isExporting?: boolean;
}

export default function NeuroCommandCenter({
  latestPredictionResult,
  onOpenArchive,
  onExportPdf,
  isExporting = false,
}: NeuroCommandCenterProps) {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("PT-8821");
  const [allScans, setAllScans] = useState<ScanRecord[]>(INITIAL_SCANS);

  const activePatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];

  const activeScans = allScans.filter(
    (s) => s.patientId === selectedPatientId
  );

  const [selectedScanIndex, setSelectedScanIndex] = useState<number>(
    Math.max(0, activeScans.length - 1)
  );

  // When active patient changes, reset selected scan to latest
  useEffect(() => {
    const scansForPatient = allScans.filter(
      (s) => s.patientId === selectedPatientId
    );
    setSelectedScanIndex(Math.max(0, scansForPatient.length - 1));
  }, [selectedPatientId, allScans]);

  // When user uploads a new scan from the Python backend, append to timeline
  useEffect(() => {
    if (!latestPredictionResult) return;

    const tumorPixels = estimateTumorAreaFromPrediction(
      latestPredictionResult.prediction,
      latestPredictionResult.confidence
    );

    const isCritical =
      latestPredictionResult.prediction.toLowerCase() !== "notumor" &&
      latestPredictionResult.prediction.toLowerCase() !== "no tumor detected" &&
      latestPredictionResult.confidence > 0.85;

    const newScanRecord: ScanRecord = {
      id: `SCN-${Date.now().toString().slice(-4)}`,
      patientId: selectedPatientId,
      date: new Date().toISOString().slice(0, 10),
      originalImageUrl: latestPredictionResult.rawHeatmapFilename
        ? `http://127.0.0.1:8000/scans/${latestPredictionResult.rawHeatmapFilename}`
        : `http://127.0.0.1:8000/heatmaps/${latestPredictionResult.heatmapFilename}`,
      gradCamUrl: `http://127.0.0.1:8000/heatmaps/${latestPredictionResult.heatmapFilename}`,
      tumorAreaPixels: tumorPixels,
      confidence: latestPredictionResult.confidence,
      severity: isCritical ? "Critical" : "Routine",
      diagnosis: latestPredictionResult.prediction,
      notes: `Live Inference processed at ${new Date().toLocaleTimeString()} via ResNet-50 Backend`,
    };

    setAllScans((prev) => [...prev, newScanRecord]);
  }, [latestPredictionResult, selectedPatientId]);

  const currentScan =
    activeScans[selectedScanIndex] || activeScans[activeScans.length - 1];

  const getSeverityLabel = (severity?: string, diagnosis?: string) => {
    if (diagnosis?.toLowerCase().includes("notumor") || diagnosis?.toLowerCase().includes("no tumor")) {
      return "Severity: Nominal";
    }
    if (severity === "Critical") {
      return "Severity: Significant";
    }
    return "Severity: Moderate";
  };

  return (
    <section id="command-center" className="w-full flex flex-col gap-4">
      {/* ============================================================= */}
      {/* 1. UNIFIED CLINICAL HEADER                                    */}
      {/* ============================================================= */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-xs">
        {/* Left Side: Brand Title & Subtle Neural Icon + Patient Select */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
              <Activity className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm text-slate-900 tracking-tight">
              NeuroAgent
            </span>
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          {/* Patient Directory Dropdown */}
          <PatientDirectory
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
          />
        </div>

        {/* Right Side: Severity Badge + View Scan Archive + Export PDF */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Minimal Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-mono font-medium text-slate-700">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                currentScan?.severity === "Critical"
                  ? "bg-amber-600"
                  : "bg-emerald-600"
              }`}
            />
            <span>
              {getSeverityLabel(currentScan?.severity, currentScan?.diagnosis)}
            </span>
          </span>

          {/* Border-outline button: 📁 View Scan Archive */}
          {onOpenArchive && (
            <button
              type="button"
              onClick={onOpenArchive}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-xs"
              title="Open Scan Archive"
            >
              <span>📁</span>
              <span>View Scan Archive</span>
            </button>
          )}

          {/* Standard Solid Blue / Clinical Button: Export PDF */}
          {onExportPdf && (
            <button
              type="button"
              onClick={onExportPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-50 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition"
            >
              {isExporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileDown className="h-3.5 w-3.5" />
              )}
              <span>Export PDF</span>
            </button>
          )}
        </div>
      </header>

      {/* ============================================================= */}
      {/* 2. DEDICATED 2-PANEL CLINICAL LAYOUT (100vh Viewport Grid)    */}
      {/* ============================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================================= */}
        {/* LEFT PANEL (The Diagnostic MRI & History) - 7 cols on LG  */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Longitudinal Scan Timeline Stepper */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Historical Scan Timeline:</span>
            </div>

            <div className="flex items-center gap-1.5">
              {activeScans.map((scan, idx) => {
                const isActive = idx === selectedScanIndex;
                const d = new Date(scan.date);
                const label = `${d.toLocaleDateString("en-US", {
                  month: "short",
                })} '${d.getDate()}`;
                return (
                  <button
                    key={scan.id}
                    type="button"
                    onClick={() => setSelectedScanIndex(idx)}
                    className={`px-2.5 py-0.5 rounded-md text-xs font-mono transition ${
                      isActive
                        ? "bg-slate-900 text-white font-semibold shadow-xs"
                        : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clinical Scan Visualizer */}
          {currentScan && (
            <ScanVisualizer
              rawImage={currentScan.originalImageUrl}
              gradCamImage={currentScan.gradCamUrl}
              prediction={currentScan.diagnosis}
              heatmapFilename={currentScan.id}
              scanDate={currentScan.date}
              tumorAreaPixels={currentScan.tumorAreaPixels}
              confidence={currentScan.confidence}
            />
          )}

          {/* Timeline Progression Graph */}
          <ProgressionChart
            scans={activeScans}
            patientName={activePatient.name}
            onOpenArchive={onOpenArchive}
          />
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL (Localized Patient Routing & Map) - 5 cols LG */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 h-full">
          <GeospatialTriage
            severity={currentScan ? currentScan.severity : "Critical"}
            confidence={currentScan ? currentScan.confidence : 0.998}
            diagnosis={currentScan ? currentScan.diagnosis : "Glioblastoma"}
            patientCity={activePatient.referralCity}
          />
        </div>
      </div>
    </section>
  );
}
