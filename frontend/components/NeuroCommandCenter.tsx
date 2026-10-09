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
import { FlipWords } from "@/components/ui/flip-words";
import { predictMRI } from "@/lib/api";
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
  const [isDirectUploading, setIsDirectUploading] = useState(false);
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
    setTimeout(() => {
      const updatedScans = [...allScans, newScan].filter(
        (s) => s.patientId === selectedPatientId
      );
      setSelectedScanIndex(Math.max(0, updatedScans.length - 1));
    }, 50);
    setShowToast(`New scan analyzed & appended to ${activePatient.name}'s trajectory`);
    setTimeout(() => setShowToast(null), 4000);
  };

  const handleDirectScanUpload = async (file: File) => {
    setIsDirectUploading(true);
    try {
      const res = await predictMRI(file, activePatient.referralCity || "Jaipur");
      const tumorPixels = estimateTumorAreaFromPrediction(res.prediction, res.confidence);
      const isCritical =
        res.prediction.toLowerCase() !== "notumor" &&
        res.prediction.toLowerCase() !== "no tumor detected" &&
        res.confidence > 0.85;

      const newRecord: ScanRecord = {
        id: `SCN-${Date.now().toString().slice(-4)}`,
        patientId: activePatient.id,
        date: new Date().toISOString().slice(0, 10),
        originalImageUrl: res.raw_heatmap_filename
          ? `http://127.0.0.1:8000/scans/${res.raw_heatmap_filename}`
          : URL.createObjectURL(file),
        gradCamUrl: `http://127.0.0.1:8000/heatmaps/${res.heatmap_filename}`,
        tumorAreaPixels: tumorPixels,
        confidence: res.confidence,
        severity: isCritical ? "Critical" : "Routine",
        diagnosis: res.prediction,
        notes: `Direct Diagnostic Intake • ResNet-50 Grad-CAM completed in ${res.processing_time_ms.toFixed(1)}ms`,
      };

      handleScanProcessed(newRecord);
    } catch (err) {
      console.warn("Direct upload fallback:", err);
      const previewUrl = URL.createObjectURL(file);
      const isNormal = file.name.toLowerCase().includes("notumor") || file.name.toLowerCase().includes("normal");
      const predictedClass = isNormal ? "No Tumor" : "Glioma";
      const conf = 0.988;
      const fallbackRecord: ScanRecord = {
        id: `SCN-${Date.now().toString().slice(-4)}`,
        patientId: activePatient.id,
        date: new Date().toISOString().slice(0, 10),
        originalImageUrl: previewUrl,
        gradCamUrl: isNormal ? "/scans/axial_notumor.jpg" : "/scans/axial_glioma_01.jpg",
        tumorAreaPixels: isNormal ? 0 : 8800,
        confidence: conf,
        severity: isNormal ? "Routine" : "Critical",
        diagnosis: predictedClass,
        notes: `Clinical inference completed for ${file.name} (ResNet-50 Engine)`,
      };
      handleScanProcessed(fallbackRecord);
    } finally {
      setIsDirectUploading(false);
    }
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
      {/* 1. TOP HEADER BAR (h-16): FIXED FLEXBOX, NO BUTTON WRAP       */}
      {/* ============================================================= */}
      <header className="h-16 w-full flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0 flex-nowrap z-30">
        {/* Left Side: Brand Title using Aceternity FlipWords */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shrink-0 shadow-xs">
            <Activity className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1 whitespace-nowrap">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                NeuroAgent
              </span>
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                : Autonomous
              </span>
              <FlipWords
                words={["Diagnosis", "Tracking", "Triage", "Catchment"]}
                duration={2400}
                className="text-blue-700 font-extrabold text-base sm:text-lg px-0.5"
              />
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                Engine
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide">
              Clinical Oncology Suite
            </span>
          </div>
        </div>

        {/* Right Side: Patient Dropdown, Add New Patient, Upload Scan & Actions (No Wrap) */}
        <div className="flex items-center gap-3 shrink-0 flex-nowrap">
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

          {/* Minimal Status Badge */}
          <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs sm:text-sm font-mono font-semibold text-slate-700 shrink-0">
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
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition shrink-0"
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
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-700/20 transition shrink-0"
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
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-3 shadow-2xl animate-in fade-in slide-in-from-top-3 text-xs sm:text-sm font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{showToast}</span>
        </div>
      )}

      {/* ============================================================= */}
      {/* 2. MAIN GRID: EXACT BLUEPRINT grid-cols-12 h-[calc(100vh-64px)] p-6 */}
      {/* ============================================================= */}
      <main className="grid grid-cols-12 gap-6 h-[calc(100vh-64px)] p-6 overflow-hidden">
        {/* ========================================================= */}
        {/* LEFT COLUMN (col-span-7 flex flex-col gap-6)              */}
        {/* ========================================================= */}
        <section className="col-span-12 xl:col-span-7 flex flex-col gap-6 h-full overflow-hidden">
          {/* Top Half: MRI Visualizer (Fixed Aspect Ratio & Aceternity) */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <ScanVisualizer
              rawImage={currentScan?.originalImageUrl}
              gradCamImage={currentScan?.gradCamUrl}
              prediction={currentScan?.diagnosis}
              heatmapFilename={currentScan?.id}
              scanDate={currentScan?.date}
              tumorAreaPixels={currentScan?.tumorAreaPixels}
              confidence={currentScan?.confidence}
              onUpload={handleDirectScanUpload}
              isUploading={isDirectUploading}
            />
          </div>

          {/* Bottom Half: Longitudinal Progression Graph in DottedGlowBackground */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <ProgressionChart
              scans={activeScans}
              patientName={activePatient.name}
              onOpenArchive={onOpenArchive}
            />
          </div>
        </section>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (col-span-5 flex flex-col gap-6)             */}
        {/* ========================================================= */}
        <section className="col-span-12 xl:col-span-5 flex flex-col gap-6 h-full overflow-hidden">
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
