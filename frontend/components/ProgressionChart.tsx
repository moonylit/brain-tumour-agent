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

export interface ProgressionChartProps {
  scans: ScanRecord[];
  patientName?: string;
  onOpenArchive?: () => void;
}

export default function ProgressionChart({
  scans,
  patientName,
  onOpenArchive,
}: ProgressionChartProps) {
  // Format scans for recharts with simple formatted dates
  const chartData = scans.map((s) => {
    const d = new Date(s.date);
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const day = d.toLocaleDateString("en-US", { day: "2-digit" });
    const year = d.getFullYear().toString().slice(-2);
    return {
      date: s.date,
      displayDate: `${month} '${day}`,
      shortDate: `${month} '${year}`,
      tumorArea: s.tumorAreaPixels,
      confidence: (s.confidence * 100).toFixed(1),
      diagnosis: s.diagnosis,
      severity: s.severity,
    };
  });

  const firstScanArea = scans[0]?.tumorAreaPixels || 0;
  const latestScanArea = scans[scans.length - 1]?.tumorAreaPixels || 0;
  const areaDelta = latestScanArea - firstScanArea;
  const percentDelta =
    firstScanArea > 0
      ? Math.round((areaDelta / firstScanArea) * 100)
      : latestScanArea > 0
      ? 100
      : 0;

  const isRemission = latestScanArea === 0 && firstScanArea === 0;

  return (
    <div className="flex flex-col rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Estimated Lesion Area Progression (px)
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              ({scans.length} Timed Scans)
            </span>
          </div>
          {patientName && (
            <p className="text-xs text-slate-500 mt-0.5">
              Longitudinal tracking for{" "}
              <span className="font-medium text-slate-700">{patientName}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onOpenArchive && (
            <button
              type="button"
              onClick={onOpenArchive}
              className="inline-flex items-center gap-1.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-md px-2.5 py-1 text-xs font-medium shadow-xs transition"
              title="View Scan Archive"
            >
              <span>📂</span>
              <span>View Scan Archive</span>
            </button>
          )}

          {isRemission ? (
            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
              Zero Recurrence (0 px)
            </span>
          ) : (
            <span
              className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
                percentDelta > 40
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              {percentDelta >= 0 ? `+${percentDelta}%` : `${percentDelta}%`} Delta
            </span>
          )}
        </div>
      </div>

      {/* Recharts Area / Line Chart with deep blue line */}
      <div className="h-48 w-full">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No historical records.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 12, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#f1f5f9"
                strokeDasharray="3 3"
                vertical={false}
              />

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
                tickFormatter={(val) =>
                  val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
                }
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-md text-xs">
                        <p className="font-mono text-slate-500 font-semibold">
                          Date: {data.date}
                        </p>
                        <p className="font-bold text-blue-700 mt-1">
                          Lesion Area: {data.tumorArea.toLocaleString()} px
                        </p>
                        <p className="text-slate-600 font-medium">
                          {data.diagnosis} ({data.confidence}% conf)
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
                stroke="#1d4ed8"
                strokeWidth={2.5}
                fill="url(#blueAreaGrad)"
                activeDot={{
                  r: 5,
                  fill: "#1d4ed8",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Clean Single Line Tracking Strip */}
      <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span>Baseline: {firstScanArea.toLocaleString()} px</span>
        <span className="text-slate-300">•</span>
        <span>Latest: {latestScanArea.toLocaleString()} px</span>
        <span className="text-slate-300">•</span>
        <span className="font-medium text-slate-700">
          Net: {areaDelta >= 0 ? `+${areaDelta.toLocaleString()}` : areaDelta.toLocaleString()} px
        </span>
      </div>
    </div>
  );
}
