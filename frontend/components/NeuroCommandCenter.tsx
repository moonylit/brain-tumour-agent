"use client";

import React, { useState, useEffect } from "react";
import {
  Patient,
  ScanRecord,
  INITIAL_PATIENTS,
  INITIAL_SCANS,
  estimateTumorAreaFromPrediction,
} from "@/lib/mockData";
import PatientCommandModule from "./PatientCommandModule";
import ProgressionChart from "./ProgressionChart";
import GeospatialTriage from "./GeospatialTriage";
import ScanVisualizer from "./ScanVisualizer";
import UploadScanModal from "./UploadScanModal";
import AddPatientModal from "./AddPatientModal";
import SystemMetricsBanner from "./SystemMetricsBanner";
import {
  Activity,
  Calendar,
  FileDown,
  FolderArchive,
  Loader2,
  CheckCircle2,
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

  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isUploadScanOpen, setIsUploadScanOpen] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

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

  // When external prediction arrives from props, append to timeline
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
      notes: `Live Inference processed via ResNet-50 Backend`,
    };

    setAllScans((prev) => [...prev, newScanRecord]);
  }, [latestPredictionResult, selectedPatientId]);

  const handleAddPatient = (newPatient: Patient, initialScan: ScanRecord) => {
    setPatients((prev) => [newPatient, ...prev]);
    setAllScans((prev) => [...prev, initialScan]);
    setSelectedPatientId(newPatient.id);
    setShowToast(`Patient profile created for ${newPatient.name}`);
    setTimeout(() => setShowToast(null), 4000);
  };

  const handleScanProcessed = (newScan: ScanRecord) => {
    setAllScans((prev) => [...prev, newScan]);
    // Point to the newly appended scan
    setTimeout(() => {
      const updatedScans = [...allScans, newScan].filter(
        (s) => s.patientId === selectedPatientId
      );
      setSelectedScanIndex(Math.max(0, updatedScans.length - 1));
    }, 50);
    setShowToast(`New scan analyzed & appended to ${activePatient.name}'s trajectory`);
    setTimeout(() => setShowToast(null), 4000);
  };

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
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* ============================================================= */}
      {/* 1. TOP HEADER BAR: BRANDING + PATIENT COMMAND MODULE (80px)   */}
      {/* ============================================================= */}
      <header className="h-20 shrink-0 border-b border-slate-200/90 bg-white px-6 flex items-center justify-between shadow-xs z-30">
        {/* Left Side: Brand Title & Subtle Neural Icon */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shrink-0 shadow-xs">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight block">
                NeuroAgent
              </span>
              <span className="text-[10px] font-mono font-medium text-slate-400 block -mt-0.5">
                Clinical Oncology Suite
              </span>
            </div>
          </div>

          <span className="text-slate-300 hidden lg:inline">|</span>

          {/* Interactive Patient Command Module */}
          <div className="hidden sm:block">
            <PatientCommandModule
              patients={patients}
              selectedPatientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
              onOpenAddPatient={() => setIsAddPatientOpen(true)}
              onOpenUploadScan={() => setIsUploadScanOpen(true)}
            />
          </div>
        </div>

        {/* Right Side: Severity Badge + System Metrics + View Scan Archive + Export PDF */}
        <div className="flex items-center gap-3">
          {/* Mobile Patient Command Trigger fallback */}
          <div className="sm:hidden">
            <button
              type="button"
              onClick={() => setIsUploadScanOpen(true)}
              className="p-2 rounded-xl bg-blue-700 text-white"
            >
              📤
            </button>
          </div>

          {/* Minimal Status Badge */}
          <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-mono font-semibold text-slate-700">
            <span
              className={`h-2 w-2 rounded-full ${
                currentScan?.severity === "Critical"
                  ? "bg-amber-600 animate-pulse"
                  : "bg-emerald-600"
              }`}
            />
            <span>{getSeverityLabel(currentScan?.severity, currentScan?.diagnosis)}</span>
          </span>

          {/* Collapsible System Metrics */}
          <SystemMetricsBanner />

          {/* View Scan Archive Secondary Button */}
          {onOpenArchive && (
            <button
              type="button"
              onClick={onOpenArchive}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition"
              title="Open Historical Scan Archive"
            >
              <FolderArchive className="h-4 w-4 text-slate-500" />
              <span>📁 View Scan Archive</span>
            </button>
          )}

          {/* Standard Solid Blue Clinical Action Button */}
          {onExportPdf && (
            <button
              type="button"
              onClick={onExportPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-700/20 transition"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              <span>Export PDF</span>
            </button>
          )}
        </div>
      </header>

      {/* Confirmation Toast */}
      {showToast && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-3 shadow-2xl animate-in fade-in slide-in-from-top-3 text-xs sm:text-sm font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{showToast}</span>
        </div>
      )}

      {/* ============================================================= */}
      {/* 2. STRICT 100vh CSS GRID: COL 7 (LEFT) & COL 5 (RIGHT)        */}
      {/* ============================================================= */}
      <main className="grid grid-cols-12 h-[calc(100vh-80px)] gap-6 p-6 overflow-hidden">
        {/* ========================================================= */}
        {/* LEFT COLUMN (Col Span 7): MRI SCAN VISUALIZER + GRAPH     */}
        {/* ========================================================= */}
        <section className="col-span-12 xl:col-span-7 h-full flex flex-col gap-4 overflow-hidden">
          {/* Longitudinal Scan Timeline Stepper Strip */}
          <div className="shrink-0 flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-semibold">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Acquisition Timeline:</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
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
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition ${
                      isActive
                        ? "bg-slate-900 text-white font-bold shadow-xs"
                        : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Top Half: Massive Square Clinical Scan Visualizer */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
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
          </div>

          {/* Bottom Half: Interactive Predictive Longitudinal Progression Graph */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <ProgressionChart
              scans={activeScans}
              patientName={activePatient.name}
              onOpenArchive={onOpenArchive}
            />
          </div>
        </section>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (Col Span 5): GEOSPATIAL TRIAGE MAP & ROUTE  */}
        {/* ========================================================= */}
        <section className="col-span-12 xl:col-span-5 h-full overflow-hidden flex flex-col">
          <GeospatialTriage
            severity={currentScan ? currentScan.severity : "Critical"}
            confidence={currentScan ? currentScan.confidence : 0.998}
            diagnosis={currentScan ? currentScan.diagnosis : "Glioblastoma"}
            patientCity={activePatient.referralCity}
          />
        </section>
      </main>

      {/* ============================================================= */}
      {/* 3. INTERACTIVE INTAKE OVERLAYS                                */}
      {/* ============================================================= */}
      <UploadScanModal
        isOpen={isUploadScanOpen}
        onClose={() => setIsUploadScanOpen(false)}
        activePatient={activePatient}
        onScanProcessed={handleScanProcessed}
      />

      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onAddPatient={handleAddPatient}
      />
    </div>
  );
}
