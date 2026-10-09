"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ScanRecord } from "@/lib/mockData";
import { TrendingUp, Activity, AlertCircle, ShieldCheck } from "lucide-react";

interface ProgressionChartProps {
  scans: ScanRecord[];
  patientName?: string;
  onOpenArchive?: () => void;
}

export default function ProgressionChart({
  scans,
  patientName,
  onOpenArchive,
}: ProgressionChartProps) {
  // Format scans for recharts
  const chartData = scans.map((s) => ({
    date: s.date,
    shortDate: new Date(s.date).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }),
    tumorArea: s.tumorAreaPixels,
    confidence: (s.confidence * 100).toFixed(1),
    diagnosis: s.diagnosis,
    severity: s.severity,
  }));

  // Calculate longitudinal growth delta
  const firstScanArea = scans[0]?.tumorAreaPixels || 0;
  const latestScanArea = scans[scans.length - 1]?.tumorAreaPixels || 0;
  const areaDelta = latestScanArea - firstScanArea;
  const percentDelta =
    firstScanArea > 0
      ? Math.round((areaDelta / firstScanArea) * 100)
      : latestScanArea > 0
      ? 100
      : 0;

  const isRapidGrowth = percentDelta > 50;
  const isRemission = latestScanArea === 0 && firstScanArea === 0;

  return (
    <div className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white/95 p-5 sm:p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-mono font-bold text-violet-800">
              <Activity className="h-3.5 w-3.5 text-violet-600" />
              Longitudinal Volumetric Tracking
            </span>
            <span className="text-xs font-mono text-slate-500">
              {scans.length} Timed Scans
            </span>
          </div>

          <h3 className="mt-1.5 text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Estimated Lesion Area Progression (px)
          </h3>
          {patientName && (
            <p className="text-xs text-slate-500 font-medium">
              Tracking patient history for <span className="font-bold text-slate-800">{patientName}</span>
            </p>
          )}
        </div>

        {/* Growth Velocity Badge & Secondary Archive Trigger Button */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenArchive && (
            <button
              type="button"
              onClick={onOpenArchive}
              className="inline-flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-md px-2.5 py-1 text-xs font-medium shadow-sm transition"
              title="View previous MRI scans and prediction history archive"
            >
              <span>📂</span>
              <span>View Scan Archive</span>
            </button>
          )}

          {isRemission ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Zero Recurrence (0 px)</span>
            </span>
          ) : isRapidGrowth ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800 shadow-sm">
              <TrendingUp className="h-4 w-4 text-rose-600" />
              <span>+{percentDelta}% Aggressive Expansion</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 shadow-sm">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span>{percentDelta >= 0 ? `+${percentDelta}%` : `${percentDelta}%`} Indolent Kinetics</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Progression Chart Container */}
      <div className="h-64 sm:h-72 w-full pt-2">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No historical scan records available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="progressionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

              <XAxis
                dataKey="shortDate"
                tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
              />

              <YAxis
                tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
                tickFormatter={(value) => `${value.toLocaleString()}`}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-2xl border border-slate-200 bg-white/95 p-3.5 shadow-xl shadow-slate-200/50 backdrop-blur-md">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-1.5 mb-1.5">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            Scan: {data.date}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                              data.severity === "Critical"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {data.severity}
                          </span>
                        </div>
                        <p className="text-xs font-extrabold text-violet-700">
                          {data.tumorArea.toLocaleString()} px Lesion Area
                        </p>
                        <p className="mt-1 text-[11px] text-slate-600 font-medium">
                          {data.diagnosis}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Inference Confidence: {data.confidence}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey="tumorArea"
                stroke="#7c3aed"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#progressionGradient)"
                isAnimationActive={true}
              />

              <Line
                type="monotone"
                dataKey="tumorArea"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{
                  r: 5,
                  fill: "#ffffff",
                  stroke: "#7c3aed",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 8,
                  fill: "#7c3aed",
                  stroke: "#ffffff",
                  strokeWidth: 3,
                }}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart Footer Micro-Strip */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-violet-600" />
          <span>Baseline: {firstScanArea.toLocaleString()} px</span>
          <span className="text-slate-300">→</span>
          <span className="font-bold text-slate-800">Current: {latestScanArea.toLocaleString()} px</span>
        </div>

        <span className="text-[11px] text-slate-400">
          Dynamic Grad-CAM Volumetric Estimator
        </span>
      </div>
    </div>
  );
}
