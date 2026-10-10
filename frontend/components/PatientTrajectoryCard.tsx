"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  FileText,
  UserCheck,
  Calendar,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

export interface TrajectoryDataPoint {
  date: string;
  area: number | null;
  predicted: number | null;
  status: string;
}

export function getDynamicTrajectoryData(patientName: string) {
  const now = new Date();

  // Helper function to format Month 'YY dynamically from real date
  const formatMonthYear = (d: Date): string => {
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const year = String(d.getFullYear()).slice(-2);
    return `${month} '${year}`;
  };

  // Patient profile specifics
  let baseAnchor = 8900;
  let mrn = "REC-ACTIVE";
  let diagnosis = "Active Longitudinal Tracking";
  let stage = "Standard Clinical Protocol";
  let baselineFactor = 0.1348;
  let midFactor = 0.382;
  let proj1Factor = 1.5955;
  let proj2Factor = 2.3595;

  if (patientName === "Marcus Webb") {
    baseAnchor = 3400;
    mrn = "MRN-49103";
    diagnosis = "Oligodendroglioma";
    stage = "WHO Grade II (1p/19q-codeleted)";
    baselineFactor = 0.52;
    midFactor = 0.76;
    proj1Factor = 1.28;
    proj2Factor = 1.62;
  } else if (patientName !== "Eleanor Vance") {
    // Dynamically calculate values for newly registered patient
    const seed = patientName
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    baseAnchor = 2200 + (seed % 6200);
    mrn = `MRN-${10000 + (seed % 89999)}`;
    diagnosis = seed % 2 === 0 ? "Anaplastic Astrocytoma" : "Meningioma (Atypical)";
    stage = seed % 2 === 0 ? "WHO Grade III" : "WHO Grade II";
    baselineFactor = 0.28;
    midFactor = 0.58;
    proj1Factor = 1.42;
    proj2Factor = 1.98;
  }

  // Dynamic relative calendar offsets (-9 mo, -5 mo, 0 current, +4 mo, +8 mo)
  // Ensures dates are never hardcoded and automatically roll forward over time
  const dates = [-9, -5, 0, 4, 8].map((offset) => {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return formatMonthYear(d);
  });

  const anchorArea = baseAnchor;

  const trajectoryData: TrajectoryDataPoint[] = [
    {
      date: dates[0],
      area: Math.round(anchorArea * baselineFactor),
      predicted: null,
      status: "Baseline MRI",
    },
    {
      date: dates[1],
      area: Math.round(anchorArea * midFactor),
      predicted: null,
      status: "Mid-Treatment Follow-up",
    },
    {
      date: dates[2],
      area: anchorArea,
      predicted: anchorArea, // Anchor point matching requested mock schema
      status: "Current Confirmed Scan (Anchor)",
    },
    {
      date: dates[3],
      area: null,
      predicted: Math.round(anchorArea * proj1Factor),
      status: "AI Forecast (+4 Mo)",
    },
    {
      date: dates[4],
      area: null,
      predicted: Math.round(anchorArea * proj2Factor),
      status: "AI Forecast (+8 Mo)",
    },
  ];

  const baselineArea = trajectoryData[0].area ?? 0;
  const currentArea = anchorArea;
  const projectedArea = trajectoryData[4].predicted ?? anchorArea;

  const growthRatePct = Number(
    (((currentArea - baselineArea) / (baselineArea || 1)) * 100).toFixed(1)
  );
  const projectedGrowthPct = Number(
    (((projectedArea - currentArea) / (currentArea || 1)) * 100).toFixed(1)
  );

  return {
    trajectoryData,
    currentArea,
    baselineArea,
    projectedArea,
    growthRatePct,
    projectedGrowthPct,
    mrn,
    diagnosis,
    stage,
    anchorDate: dates[2],
  };
}

interface PatientTrajectoryCardProps {
  activePatient: string;
}

export default function PatientTrajectoryCard({
  activePatient,
}: PatientTrajectoryCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const patientData = useMemo(
    () => getDynamicTrajectoryData(activePatient),
    [activePatient]
  );

  const {
    trajectoryData,
    currentArea,
    baselineArea,
    projectedArea,
    growthRatePct,
    projectedGrowthPct,
    mrn,
    diagnosis,
    stage,
    anchorDate,
  } = patientData;

  return (
    <div className="w-full">
      {/* Card Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-700 border border-blue-200">
                <UserCheck className="h-3.5 w-3.5" />
                Record Validated
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono text-slate-500 bg-slate-100">
                {mrn}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Activity className="h-7 w-7 text-blue-600 shrink-0" />
              <span>
                Patient Profile: {activePatient} — Longitudinal Tumor Trajectory
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              Active Surveillance
            </span>
          </div>
        </div>

      {/* Main 2-Column EHR Trajectory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left/Center (Col-Span-2): Recharts LineChart */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Volumetric Tumor Area Over Time (px²)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Observed MRI segmentation area contrasted against ResNet AI forward trajectory forecast.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-700">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                Observed
              </span>
              <span className="flex items-center gap-1.5 text-purple-700">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-600 border border-dashed border-purple-400"></span>
                AI Forecast
              </span>
            </div>
          </div>

          <div className="w-full h-[320px] pt-2">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trajectoryData}
                  margin={{ top: 12, right: 24, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#cbd5e1" }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickFormatter={(v) => `${Number(v).toLocaleString()} px`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const point = payload[0].payload as TrajectoryDataPoint;
                        return (
                          <div className="rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-md text-xs">
                            <p className="font-bold text-slate-800 mb-1">{label} • {point.status}</p>
                            {point.area !== null && (
                              <p className="text-blue-600 font-semibold flex items-center justify-between gap-4">
                                <span>Observed Area:</span>
                                <span>{point.area.toLocaleString()} px²</span>
                              </p>
                            )}
                            {point.predicted !== null && (
                              <p className="text-purple-600 font-semibold flex items-center justify-between gap-4">
                                <span>AI Forecast:</span>
                                <span>{point.predicted.toLocaleString()} px²</span>
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs font-semibold text-slate-700">{value}</span>
                    )}
                  />
                  {/* Historical Observed Area */}
                  <Line
                    type="monotone"
                    dataKey="area"
                    name="Observed Area (px)"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#2563eb", strokeWidth: 2, stroke: "#ffffff" }}
                    activeDot={{ r: 7 }}
                    connectNulls={false}
                  />
                  {/* Predictive Forward Trajectory */}
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    name="AI Forecast (px)"
                    stroke="#9333ea"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ r: 5, fill: "#9333ea", strokeWidth: 2, stroke: "#ffffff" }}
                    activeDot={{ r: 7 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-xl animate-pulse text-slate-400 font-medium text-xs">
                Rendering Longitudinal Chart...
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-500 italic mt-2 text-center">
            Anchor point ({anchorDate}) binds latest observed scan ({currentArea.toLocaleString()} px²) to neural regression model forecast.
          </p>
        </div>

        {/* Right Column: Longitudinal Patient Summary & EHR Metrics */}
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Clinical Trajectory
            </span>
            <h4 className="text-lg font-bold text-slate-900 mt-0.5">{diagnosis}</h4>
            <p className="text-xs font-medium text-slate-600">{stage}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100">
              <span className="text-[11px] font-semibold text-blue-700 block">Current Area</span>
              <span className="text-lg font-black text-blue-900 mt-0.5 block">
                {currentArea.toLocaleString()} <span className="text-xs font-normal text-blue-700">px²</span>
              </span>
              <span className="text-[10px] text-blue-600 font-medium mt-0.5 block">
                Confirmed {anchorDate}
              </span>
            </div>

            <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100">
              <span className="text-[11px] font-semibold text-purple-700 block">AI Forecast (+8M)</span>
              <span className="text-lg font-black text-purple-900 mt-0.5 block">
                {projectedArea.toLocaleString()} <span className="text-xs font-normal text-purple-700">px²</span>
              </span>
              <span className="text-[10px] text-purple-600 font-medium mt-0.5 block">
                +{projectedGrowthPct}% growth
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Baseline Scan:</span>
              <span className="font-bold text-slate-700">{baselineArea.toLocaleString()} px²</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Clinical Protocol:</span>
              <span className="font-semibold text-blue-700">Surveillance</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Volumetric Acceleration:</strong> Tumor area variance triggers automated SerpApi neuro-oncology referral routing below.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
