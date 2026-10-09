"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ScanRecord } from "@/lib/mockData";
import { Sparkles, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

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
  const [isSimulatingFuture, setIsSimulatingFuture] = useState(false);

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

  // Format historical scans for recharts
  const historicalData = scans.map((s, idx) => {
    const d = new Date(s.date);
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const day = d.toLocaleDateString("en-US", { day: "2-digit" });
    const isLast = idx === scans.length - 1;

    return {
      date: s.date,
      displayDate: `${month} '${day}`,
      historicalArea: s.tumorAreaPixels,
      // If simulating future, connect the dashed forecast line starting from the last historical scan
      forecastArea: isSimulatingFuture && isLast ? s.tumorAreaPixels : null,
      tumorArea: s.tumorAreaPixels,
      confidence: (s.confidence * 100).toFixed(1),
      diagnosis: s.diagnosis,
      severity: s.severity,
      isForecast: false,
    };
  });

  // Dynamically append 2 mock future data points if simulation is active
  let chartData = [...historicalData];
  if (isSimulatingFuture && scans.length > 0) {
    const lastDate = new Date(scans[scans.length - 1].date);

    // Future Point 1 (+2.5 months)
    const futureDate1 = new Date(lastDate);
    futureDate1.setMonth(futureDate1.getMonth() + 2);
    futureDate1.setDate(15);
    const m1 = futureDate1.toLocaleDateString("en-US", { month: "short" });
    const y1 = futureDate1.getFullYear().toString().slice(-2);
    const p1Area = isRemission ? 0 : Math.round(latestScanArea * 1.15 + 400);

    // Future Point 2 (+5 months)
    const futureDate2 = new Date(lastDate);
    futureDate2.setMonth(futureDate2.getMonth() + 5);
    futureDate2.setDate(1);
    const m2 = futureDate2.toLocaleDateString("en-US", { month: "short" });
    const y2 = futureDate2.getFullYear().toString().slice(-2);
    const p2Area = isRemission ? 0 : Math.round(latestScanArea * 1.32 + 850);

    chartData.push({
      date: futureDate1.toISOString().slice(0, 10),
      displayDate: `${m1} '${y1} (Est)`,
      historicalArea: null as any,
      forecastArea: p1Area,
      tumorArea: p1Area,
      confidence: "89.2",
      diagnosis: isRemission ? "Stable Remission (Est)" : "Projected Lesion Expansion",
      severity: isRemission ? "Routine" : "Critical",
      isForecast: true,
    });

    chartData.push({
      date: futureDate2.toISOString().slice(0, 10),
      displayDate: `${m2} '${y2} (Est)`,
      historicalArea: null as any,
      forecastArea: p2Area,
      tumorArea: p2Area,
      confidence: "84.5",
      diagnosis: isRemission ? "Stable Remission (Est)" : "High-Risk Growth Forecast",
      severity: isRemission ? "Routine" : "Critical",
      isForecast: true,
    });
  }

  const projectedDelta = isSimulatingFuture && !isRemission && latestScanArea > 0
    ? Math.round((((chartData[chartData.length - 1].forecastArea || 0) - latestScanArea) / latestScanArea) * 100)
    : 0;

  return (
    <DottedGlowBackground className="h-full w-full shadow-xl shadow-slate-200/50">
      <div className="flex flex-col p-5 sm:p-6 h-full justify-between">
        {/* Header with Title & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Estimated Lesion Area Progression (px)
              </h3>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-semibold text-slate-600">
                ({scans.length} Timed Scans)
              </span>
            </div>
            {patientName && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <span>Longitudinal trajectory for</span>
                <span className="font-semibold text-slate-800">{patientName}</span>
              </p>
            )}
          </div>

          {/* Action Controls Array */}
          <div className="flex flex-wrap items-center gap-2">
            {/* THE PREDICT TRAJECTORY BUTTON */}
            <button
              type="button"
              onClick={() => setIsSimulatingFuture(!isSimulatingFuture)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md ${
                isSimulatingFuture
                  ? "bg-violet-700 text-white ring-2 ring-violet-400 shadow-violet-500/30"
                  : "bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-violet-500/25 hover:shadow-violet-500/40"
              }`}
              title="Simulate Future Trajectory"
            >
              <span>🔮</span>
              <span>Simulate Future Trajectory</span>
              <span className="sr-only">Simulate Future Growth</span>
              {isSimulatingFuture && (
                <span className="ml-0.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider">
                  Active
                </span>
              )}
            </button>

          {onOpenArchive && (
            <button
              type="button"
              onClick={onOpenArchive}
              className="inline-flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold shadow-xs transition"
              title="View Scan Archive"
            >
              <span>📂</span>
              <span>View Scan Archive</span>
            </button>
          )}

          {isRemission ? (
            <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
              Zero Recurrence (0 px)
            </span>
          ) : (
            <span
              className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${
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

      {/* Interactive Recharts Composed Chart with Dual Solid + Dashed Forecast Line */}
      <div className="h-48 sm:h-52 w-full my-auto">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No historical records found.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 12, right: 16, left: -6, bottom: 0 }}
            >
              <defs>
                <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.16} />
                  <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="violetAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#f1f5f9"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="displayDate"
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />

              <YAxis
                tick={{ fill: "#64748b", fontSize: 12 }}
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
                      <div className="rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md p-3.5 shadow-xl text-xs max-w-xs">
                        {data.isForecast ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 text-violet-800 px-2 py-0.5 text-[10px] font-bold">
                              🔮 AI Projected Trajectory
                            </span>
                            <p className="font-mono text-slate-500 font-semibold mt-1">
                              Target Date: {data.date}
                            </p>
                            <p className="font-extrabold text-violet-700 text-sm">
                              Estimated Lesion Area: {data.tumorArea.toLocaleString()} px
                            </p>
                            <p className="text-slate-600 font-medium">
                              {data.diagnosis} ({data.confidence}% Bayesian Certainty)
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold">
                              ✓ Verified MRI Scan
                            </span>
                            <p className="font-mono text-slate-500 font-semibold mt-1">
                              Acquisition Date: {data.date}
                            </p>
                            <p className="font-extrabold text-blue-700 text-sm">
                              Measured Lesion Area: {data.tumorArea.toLocaleString()} px
                            </p>
                            <p className="text-slate-600 font-medium">
                              {data.diagnosis} ({data.confidence}% conf)
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Verified Scans: Solid Deep Blue Line + Subtle Gradient Area */}
              <Area
                type="monotone"
                dataKey="historicalArea"
                stroke="#1d4ed8"
                strokeWidth={3}
                fill="url(#blueAreaGrad)"
                name="Verified MRI Scan"
                activeDot={{
                  r: 6,
                  fill: "#1d4ed8",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />

              {/* AI Forecasted Growth: Dashed Violet Line */}
              {isSimulatingFuture && (
                <Line
                  type="monotone"
                  dataKey="forecastArea"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  name="AI Projected Growth"
                  dot={{
                    r: 5,
                    fill: "#8b5cf6",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 7,
                    fill: "#8b5cf6",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Sub-Metrics Telemetry Strip */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs font-mono text-slate-600">
        <div className="flex items-center gap-3">
          <span>Baseline: <strong className="text-slate-800">{firstScanArea.toLocaleString()} px</strong></span>
          <span className="text-slate-300">•</span>
          <span>Latest: <strong className="text-slate-800">{latestScanArea.toLocaleString()} px</strong></span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-slate-900">
            Historical Delta: {areaDelta >= 0 ? `+${areaDelta.toLocaleString()}` : areaDelta.toLocaleString()} px
          </span>
        </div>

        {isSimulatingFuture && (
          <div className="inline-flex items-center gap-1.5 text-violet-700 font-bold bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-200 text-xs">
            <span>🔮 Forecasted Growth:</span>
            <span>+{projectedDelta}% over 5 mos</span>
          </div>
        )}
      </div>
    </div>
  </DottedGlowBackground>
  );
}
