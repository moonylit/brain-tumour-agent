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
  ShieldCheck,
  Calendar,
  Sparkles,
  Activity,
  Layers,
  Clock,
  ChevronRight,
  PlusCircle,
} from "lucide-react";

interface NeuroCommandCenterProps {
  latestPredictionResult?: {
    prediction: string;
    confidence: number;
    heatmapFilename: string;
    rawHeatmapFilename?: string;
    region?: string;
  } | null;
}

export default function NeuroCommandCenter({
  latestPredictionResult,
}: NeuroCommandCenterProps) {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("PT-8821");
  const [allScans, setAllScans] = useState<ScanRecord[]>(INITIAL_SCANS);

  const activePatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];

  const activeScans = allScans.filter(
    (s) => s.patientId === selectedPatientId
  );

  // Active scan index within patient's timeline (defaults to latest)
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

  // When user uploads a new scan from the Python backend, append to timeline!
  useEffect(() => {
    if (!latestPredictionResult) return;

    const tumorPixels = estimateTumorAreaFromPrediction(
      latestPredictionResult.prediction,
      latestPredictionResult.confidence
    );

    const isCritical =
      latestPredictionResult.prediction.toLowerCase() !== "notumor" &&
      latestPredictionResult.prediction.toLowerCase() !== "no tumor" &&
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
      notes: `Live Inference uploaded at ${new Date().toLocaleTimeString()} via ResNet-50 Backend`,
    };

    setAllScans((prev) => [...prev, newScanRecord]);
  }, [latestPredictionResult, selectedPatientId]);

  const currentScan =
    activeScans[selectedScanIndex] || activeScans[activeScans.length - 1];

  return (
    <section id="command-center" className="w-full">
      {/* ============================================================= */}
      {/* 1. TOP BAR: BRANDING + PATIENT DIRECTORY DROPDOWN             */}
      {/* ============================================================= */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-slate-200/90 bg-gradient-to-r from-white via-slate-50/80 to-white p-5 sm:p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-600 via-violet-600 to-sky-600" />

        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-50 to-violet-50 border border-cyan-200 text-cyan-700 shadow-md shadow-cyan-600/10 shrink-0">
            <ShieldCheck className="h-6 w-6 text-cyan-600" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                Command Console
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Longitudinal Engine v3.2
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 mt-0.5">
              NeuroAgent 3-Panel Diagnostic Command Center
            </h2>
          </div>
        </div>

        {/* Patient Directory Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <PatientDirectory
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
          />
        </div>
      </div>

      {/* ============================================================= */}
      {/* 2 & 3. 3-PANEL GRID: LEFT (DIAGNOSIS + TIMELINE) & RIGHT (TRIAGE) */}
      {/* ============================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* ========================================================= */}
        {/* LEFT PANEL (Diagnosis & Timeline) - 7 cols on XL          */}
        {/* ========================================================= */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          {/* Top Half: ScanVisualizer with X-Ray Flashlight Reveal */}
          <div className="flex flex-col gap-3">
            {/* Timeline Stepper Pills */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-violet-600" />
                <span>Longitudinal Scan Timeline:</span>
              </div>

              <div className="flex items-center gap-1.5">
                {activeScans.map((scan, idx) => {
                  const isActive = idx === selectedScanIndex;
                  return (
                    <button
                      key={scan.id}
                      type="button"
                      onClick={() => setSelectedScanIndex(idx)}
                      className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition shadow-sm ${
                        isActive
                          ? "bg-violet-600 text-white shadow-violet-600/30 scale-105"
                          : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/90"
                      }`}
                    >
                      {scan.date.slice(5)} ({idx + 1}/{activeScans.length})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* X-Ray Mouse Reveal Component */}
            {currentScan ? (
              <ScanVisualizer
                rawImage={currentScan.originalImageUrl}
                gradCamImage={currentScan.gradCamUrl}
                prediction={currentScan.diagnosis}
                heatmapFilename={currentScan.id}
              />
            ) : null}

            {/* Micro Metadata Strip for Current Scan */}
            {currentScan && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    Scan Date: {currentScan.date}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-violet-700 font-extrabold">
                    {currentScan.tumorAreaPixels.toLocaleString()} px Area
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-cyan-700 font-bold">
                    {(currentScan.confidence * 100).toFixed(1)}% Confidence
                  </span>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    currentScan.severity === "Critical"
                      ? "bg-rose-100 text-rose-800 border border-rose-300"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  }`}
                >
                  {currentScan.severity.toUpperCase()} STATUS
                </span>
              </div>
            )}
          </div>

          {/* Bottom Half: Longitudinal Progression Chart */}
          <ProgressionChart
            scans={activeScans}
            patientName={activePatient.name}
          />
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL (Geospatial Catchment Triage) - 5 cols on XL  */}
        {/* ========================================================= */}
        <div className="xl:col-span-5 h-full">
          <GeospatialTriage
            severity={currentScan ? currentScan.severity : "Routine"}
            confidence={currentScan ? currentScan.confidence : 0.95}
            diagnosis={currentScan ? currentScan.diagnosis : "Nominal"}
            patientCity={activePatient.referralCity}
          />
        </div>
      </div>
    </section>
  );
}
