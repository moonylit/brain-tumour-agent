"use client";

import React, { useState, useEffect, useRef } from "react";
import { FlipWords } from "@aceternity/flip-words";
import { CanvasRevealEffect } from "@aceternity/canvas-reveal-effect";
import { DottedGlowBackground } from "@aceternity/dotted-glow-background";
import { GlareCard } from "@aceternity/glare-card";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Patient,
  ScanRecord,
  INITIAL_PATIENTS,
  INITIAL_SCANS,
  REGIONAL_CATCHMENT_FACILITIES,
  estimateTumorAreaFromPrediction,
} from "@/lib/mockData";
import {
  predictMRI,
  downloadReport,
  formatApiError,
} from "@/lib/api";
import UploadScanModal from "@/components/UploadScanModal";
import AddPatientModal from "@/components/AddPatientModal";
import PatientArchiveDrawer from "@/components/PatientArchiveDrawer";
import SystemMetricsBanner from "@/components/SystemMetricsBanner";
import {
  Activity,
  User,
  Plus,
  UploadCloud,
  ChevronDown,
  Check,
  FolderArchive,
  FileDown,
  Loader2,
  CheckCircle2,
  MapPin,
  FileText,
  Phone,
  ExternalLink,
  Eye,
  Zap,
} from "lucide-react";

export default function Home() {
  // Patient & Clinical State
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("PT-8821");
  const [allScans, setAllScans] = useState<ScanRecord[]>(INITIAL_SCANS);

  // Modals & Drawers
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isUploadScanOpen, setIsUploadScanOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);

  // Interaction States
  const [isSimulatingFuture, setIsSimulatingFuture] = useState(false);
  const [referralRequested, setReferralRequested] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Patient & Scans
  const activePatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];
  const activeScans = allScans.filter((s) => s.patientId === selectedPatientId);
  const currentScan = activeScans[activeScans.length - 1] || null;

  const primaryHospital = REGIONAL_CATCHMENT_FACILITIES[0];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddPatient = (newPatient: Patient, initialScan: ScanRecord) => {
    setPatients((prev) => [newPatient, ...prev]);
    setAllScans((prev) => [...prev, initialScan]);
    setSelectedPatientId(newPatient.id);
    triggerToast(`Patient profile registered for ${newPatient.name}`);
  };

  const handleScanProcessed = (newScan: ScanRecord) => {
    setAllScans((prev) => [...prev, newScan]);
    triggerToast(`New MRI scan processed for ${activePatient.name}`);
  };

  const handleExportDossier = async () => {
    try {
      setIsExporting(true);
      await downloadReport(activePatient.referralCity || "Jaipur");
      triggerToast("Clinical PDF Report generated & downloaded successfully");
    } catch (err) {
      console.error("PDF export error:", err);
      triggerToast("PDF generation failed: " + formatApiError(err));
    } finally {
      setIsExporting(false);
    }
  };

  // Prepare Recharts Data
  const historicalData = activeScans.map((s, idx) => {
    const d = new Date(s.date);
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const day = d.toLocaleDateString("en-US", { day: "2-digit" });
    const isLast = idx === activeScans.length - 1;

    return {
      date: s.date,
      displayDate: `${month} '${day}`,
      historicalArea: s.tumorAreaPixels,
      forecastArea: isSimulatingFuture && isLast ? s.tumorAreaPixels : null,
      tumorArea: s.tumorAreaPixels,
      confidence: (s.confidence * 100).toFixed(1),
      diagnosis: s.diagnosis,
    };
  });

  const chartData = [...historicalData];
  if (isSimulatingFuture && activeScans.length > 0) {
    const lastScan = activeScans[activeScans.length - 1];
    const lastDate = new Date(lastScan.date);
    const baseArea = lastScan.tumorAreaPixels;

    const f1Date = new Date(lastDate);
    f1Date.setMonth(f1Date.getMonth() + 2);
    const f1Area = Math.round(baseArea * 1.14 + 350);

    const f2Date = new Date(lastDate);
    f2Date.setMonth(f2Date.getMonth() + 5);
    const f2Area = Math.round(baseArea * 1.3 + 750);

    chartData.push({
      date: f1Date.toISOString().slice(0, 10),
      displayDate: `${f1Date.toLocaleDateString("en-US", { month: "short" })} (Est)`,
      historicalArea: null as any,
      forecastArea: f1Area,
      tumorArea: f1Area,
      confidence: "88.5",
      diagnosis: "AI Projected Trajectory",
    });

    chartData.push({
      date: f2Date.toISOString().slice(0, 10),
      displayDate: `${f2Date.toLocaleDateString("en-US", { month: "short" })} (Est)`,
      historicalArea: null as any,
      forecastArea: f2Area,
      tumorArea: f2Area,
      confidence: "84.2",
      diagnosis: "AI Projected Trajectory",
    });
  }

  const getSeverityBadge = () => {
    if (!currentScan || currentScan.diagnosis?.toLowerCase().includes("notumor")) {
      return { label: "Severity: Nominal", color: "bg-emerald-600" };
    }
    if (currentScan.severity === "Critical") {
      return { label: "Severity: Significant", color: "bg-amber-600 animate-pulse" };
    }
    return { label: "Severity: Moderate", color: "bg-blue-600" };
  };

  const severityBadge = getSeverityBadge();

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Background Subtle Atmosphere */}
      <div
        className="pointer-events-none fixed inset-0 bg-grid-pattern opacity-40 z-0"
        aria-hidden="true"
      />

      {/* ============================================================= */}
      {/* 2. HEADER (Top Nav) - Fixed Flexbox, Buttons in a Single Row  */}
      {/* ============================================================= */}
      <header className="h-16 w-full flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0 flex-nowrap z-30">
        {/* Left Side: Aceternity FlipWords Title */}
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

        {/* Right Side: Patient Selector, Add Patient, Upload MRI, Status & Actions */}
        <div className="flex items-center gap-3 shrink-0 flex-nowrap">
          {/* Patient Selector Dropdown */}
          <div className="relative inline-block text-left">
            <button
              id="patient-directory-select"
              type="button"
              aria-label="Select Patient"
              onClick={() => setIsPatientDropdownOpen(!isPatientDropdownOpen)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition shadow-xs"
            >
              <User className="h-3.5 w-3.5 text-blue-700" />
              <span>
                Select Patient:{" "}
                <span className="font-bold text-slate-900">
                  {activePatient.name} ({activePatient.age}y)
                </span>
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                  isPatientDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isPatientDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsPatientDropdownOpen(false)}
                />
                <div className="absolute left-0 z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                  <div className="px-3 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between text-[11px] font-mono text-slate-500 font-semibold">
                    <span>Clinical Patient Directory</span>
                    <span>{patients.length} Profiles</span>
                  </div>
                  <div className="space-y-1">
                    {patients.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPatientId(p.id);
                          setIsPatientDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition ${
                          p.id === selectedPatientId
                            ? "bg-blue-50 text-blue-900 font-bold"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <p className="text-[10px] text-slate-500">{p.primaryDiagnosis}</p>
                        </div>
                        {p.id === selectedPatientId && (
                          <Check className="h-4 w-4 text-blue-700 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* [+ Add New Patient] Button */}
          <button
            type="button"
            onClick={() => setIsAddPatientOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold px-3 py-1.5 text-xs shadow-xs transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New Patient</span>
          </button>

          {/* [Upload MRI Scan] Button */}
          <button
            type="button"
            onClick={() => setIsUploadScanOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold px-3 py-1.5 text-xs shadow-xs transition"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Upload MRI Scan</span>
          </button>

          {/* Status Badge */}
          <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono font-semibold text-slate-700 shrink-0">
            <span className={`h-2 w-2 rounded-full ${severityBadge.color}`} />
            <span>{severityBadge.label}</span>
          </span>

          {/* Collapsible System Metrics */}
          <SystemMetricsBanner />

          {/* View Scan Archive Button */}
          <button
            type="button"
            onClick={() => setIsArchiveOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition shrink-0"
          >
            <FolderArchive className="h-3.5 w-3.5 text-slate-500" />
            <span>📁 View Scan Archive</span>
          </button>

          {/* Export PDF Button */}
          <button
            type="button"
            onClick={handleExportDossier}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition shrink-0"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileDown className="h-3.5 w-3.5" />
            )}
            <span>Export PDF</span>
          </button>
        </div>
      </header>

      {/* Confirmation Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-2.5 shadow-2xl animate-in fade-in slide-in-from-top-3 text-xs font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================= */}
      {/* 3. MAIN GRID - grid-cols-12 gap-6 h-[calc(100vh-64px)] p-6    */}
      {/* ============================================================= */}
      <main className="grid grid-cols-12 gap-6 h-[calc(100vh-64px)] p-6 overflow-hidden relative z-10">
        {/* ========================================================= */}
        {/* LEFT PANEL: col-span-7 flex flex-col gap-6                */}
        {/* ========================================================= */}
        <section className="col-span-12 xl:col-span-7 flex flex-col gap-6 h-full overflow-hidden">
          {/* 4. LEFT PANEL: MRI VISUALIZER (FIXED HEIGHT) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 p-5 flex flex-col justify-between shrink-0">
            {/* Visualizer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  2D Axial MRI Analysis
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-medium text-slate-600">
                  {currentScan?.diagnosis || "Glioma"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadScanOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition"
              >
                <UploadCloud className="h-3.5 w-3.5 text-cyan-600" />
                <span>Upload MRI</span>
              </button>
            </div>

            {/* Inner Black Box (CRITICAL FIX): Fixed 350px height, NO aspect-square */}
            {currentScan?.originalImageUrl ? (
              <div className="relative w-full h-[350px] bg-[#0a0a0a] rounded-xl overflow-hidden flex items-center justify-center mt-4 border border-slate-200">
                {/* Base MRI Image */}
                <img
                  src={currentScan.originalImageUrl}
                  className="object-contain w-full h-full"
                  alt="MRI Scan"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                  }}
                />

                {/* Grad-CAM Heatmap Localization Overlay */}
                {currentScan.gradCamUrl && (
                  <img
                    src={currentScan.gradCamUrl}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-85 mix-blend-screen"
                    alt={`Grad-CAM Heatmap for ${(currentScan.diagnosis || "scan").toLowerCase()}`}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                )}
              </div>
            ) : (
              /* Empty State: Aceternity CanvasRevealEffect */
              <div className="relative w-full h-[350px] bg-[#0a0a0a] rounded-xl overflow-hidden flex items-center justify-center mt-4 border border-slate-200">
                <CanvasRevealEffect
                  animationSpeed={0.5}
                  dotSize={2.5}
                  colors={[[37, 99, 235], [6, 182, 212], [99, 102, 241]]}
                  containerClassName="absolute inset-0 bg-[#0a0a0a]"
                />
                <div className="relative z-10 text-center p-6">
                  <p className="text-sm font-bold text-white">No MRI Scan Selected</p>
                  <p className="text-xs text-slate-400 mt-1">Upload a scan to initiate ResNet-50 inference</p>
                </div>
              </div>
            )}

            {/* Visualizer Footer Sub-metrics */}
            <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-600 pt-2 border-t border-slate-100">
              <span>Scan Date: {currentScan?.date || "2026-10-09"}</span>
              <span className="font-semibold text-slate-800">
                {(currentScan?.tumorAreaPixels || 9280).toLocaleString()} px Area (estimated)
              </span>
              <span className="font-bold text-blue-700">
                {(((currentScan?.confidence || 0.998)) * 100).toFixed(1)}% Confidence
              </span>
            </div>
          </div>

          {/* 5. LEFT PANEL: LONGITUDINAL TIMELINE (DottedGlowBackground) */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <DottedGlowBackground className="h-full w-full shadow-sm">
              <div className="flex flex-col p-5 h-full justify-between">
                {/* Timeline Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      Estimated Lesion Area Progression (px)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Longitudinal trajectory for {activePatient.name} ({activeScans.length} Scans)
                    </p>
                  </div>

                  {/* [🔮 Simulate Future Trajectory] Button */}
                  <button
                    type="button"
                    onClick={() => setIsSimulatingFuture(!isSimulatingFuture)}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                      isSimulatingFuture
                        ? "bg-violet-700 text-white ring-2 ring-violet-400"
                        : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
                    }`}
                  >
                    <span>🔮</span>
                    <span>Simulate Future Trajectory</span>
                    <span className="sr-only">Simulate Future Growth</span>
                    {isSimulatingFuture && (
                      <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] uppercase font-mono">
                        Active
                      </span>
                    )}
                  </button>
                </div>

                {/* Recharts Area & Forecast Line */}
                <div className="flex-1 min-h-[140px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 8, right: 16, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.16} />
                          <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="displayDate"
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        axisLine={{ stroke: "#e2e8f0" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        axisLine={{ stroke: "#e2e8f0" }}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md p-3 shadow-lg text-xs">
                                <p className="font-mono text-slate-500 font-semibold">{data.date}</p>
                                <p className="font-bold text-blue-700 mt-1">
                                  Lesion Area: {data.tumorArea?.toLocaleString()} px
                                </p>
                                <p className="text-slate-600">{data.diagnosis}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="historicalArea"
                        stroke="#1d4ed8"
                        strokeWidth={2.5}
                        fill="url(#blueAreaGrad)"
                        name="Verified Scans"
                        activeDot={{ r: 5, fill: "#1d4ed8" }}
                      />
                      {isSimulatingFuture && (
                        <Line
                          type="monotone"
                          dataKey="forecastArea"
                          stroke="#8b5cf6"
                          strokeWidth={2.5}
                          strokeDasharray="5 5"
                          name="Future Projection"
                          dot={{ r: 4, fill: "#8b5cf6" }}
                          activeDot={{ r: 6, fill: "#8b5cf6" }}
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </DottedGlowBackground>
          </div>
        </section>

        {/* ========================================================= */}
        {/* RIGHT PANEL: col-span-5 flex flex-col gap-6               */}
        {/* ========================================================= */}
        <section className="col-span-12 xl:col-span-5 flex flex-col gap-6 h-full overflow-hidden">
          {/* 6. RIGHT PANEL: GEOSPATIAL ROUTING */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 p-5 flex flex-col justify-between h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Regional Referral &amp; Catchment Route
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tertiary facilities and acute neurosurgical routing
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-blue-700" />
                <span>Base: {activePatient.referralCity || "Jaipur"}</span>
              </span>
            </div>

            {/* Top Card: Aceternity GlareCard around Primary Hospital */}
            <GlareCard className="border-blue-200/80 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-100/70 px-2.5 py-0.5 text-xs font-bold text-blue-900">
                    <span className="h-2 w-2 rounded-full bg-blue-700 animate-pulse" />
                    <span>Referral Rec: High-Priority Routing</span>
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    Facility ID: {primaryHospital.id}
                  </span>
                </div>

                <div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    {primaryHospital.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Distance: <strong className="text-slate-800">{primaryHospital.distanceKm} km</strong> | Neuro-ICU Beds Available ({primaryHospital.currentBedCapacity}) | {primaryHospital.equipmentLevel}
                  </p>
                </div>

                {/* Standard Request Standard Referral Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReferralRequested(true);
                      triggerToast(`Referral requested for ${primaryHospital.name}`);
                    }}
                    className="bg-blue-600 text-white w-full py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition"
                  >
                    Request Standard Referral
                  </button>
                </div>

                {referralRequested && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Requisition dispatched to {primaryHospital.name}. Acute transfer dossier linked.</span>
                  </div>
                )}
              </div>
            </GlareCard>

            {/* Static Street Route Map UI below the Glare Card */}
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Clinical Route Map ({activePatient.referralCity || "Jaipur"})</span>
                <span className="font-mono text-[11px] text-blue-700 font-semibold">
                  {primaryHospital.distanceKm} km • ~{primaryHospital.driveTimeMin} min transit
                </span>
              </div>

              <div className="relative w-full h-44 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shadow-xs">
                <svg
                  viewBox="0 0 460 220"
                  className="w-full h-full"
                  aria-label="Street map of patient catchment area"
                >
                  <rect width="460" height="220" fill="#f8fafc" />
                  <g stroke="#e2e8f0" strokeWidth="1">
                    <line x1="40" y1="0" x2="40" y2="220" />
                    <line x1="140" y1="0" x2="140" y2="220" />
                    <line x1="240" y1="0" x2="240" y2="220" />
                    <line x1="340" y1="0" x2="340" y2="220" />
                    <line x1="440" y1="0" x2="440" y2="220" />
                    <line x1="0" y1="35" x2="460" y2="35" />
                    <line x1="0" y1="95" x2="460" y2="95" />
                    <line x1="0" y1="155" x2="460" y2="155" />
                  </g>
                  <g stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round">
                    <line x1="30" y1="60" x2="430" y2="60" />
                    <line x1="150" y1="20" x2="260" y2="210" />
                    <line x1="240" y1="20" x2="370" y2="210" />
                    <line x1="30" y1="140" x2="280" y2="140" />
                  </g>
                  <text x="50" y="52" fill="#94a3b8" fontSize="9" fontFamily="monospace">MI ROAD</text>
                  <text x="250" y="45" fill="#94a3b8" fontSize="9" fontFamily="monospace">JLN MARG</text>
                  <text x="145" y="105" fill="#94a3b8" fontSize="9" fontFamily="monospace">TONK RD</text>
                  <path
                    d="M 110 140 L 195 140 L 255 105 L 320 95"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="110" cy="140" r="5" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="320" cy="95" r="6" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
                  <text x="330" y="99" fill="#1e293b" fontSize="10" fontWeight="bold">SMS Hospital</text>
                </svg>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Intakes & Modals */}
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

      <PatientArchiveDrawer
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
      />
    </div>
  );
}