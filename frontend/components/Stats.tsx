"use client";

import { useEffect, useState, useCallback } from "react";
import {
  StatisticsResponse,
  getStatistics,
  formatTumorClass,
  formatApiError,
} from "@/lib/api";

type Props = {
  refreshTrigger?: number;
};

export default function Stats({ refreshTrigger }: Props) {
  const [stats, setStats] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStatistics();
      setStats(data);
    } catch (err) {
      console.error("Failed to load statistics:", err);
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, refreshTrigger]);

  function formatConfidence(avgConfidence: number): string {
    if (avgConfidence === undefined || avgConfidence === null) return "0.0%";
    const val = avgConfidence <= 1 ? avgConfidence * 100 : avgConfidence;
    return `${val.toFixed(1)}%`;
  }

  function formatTime(ms: number): string {
    if (!ms) return "0 ms";
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(2)}s`;
    }
    return `${ms.toFixed(0)} ms`;
  }

  const primaryCards = [
    {
      value: stats ? stats.total_predictions.toLocaleString() : "-",
      label: "Total Predictions",
      color: "text-cyan-600",
    },
    {
      value: stats ? formatConfidence(stats.average_confidence) : "-",
      label: "Average Confidence",
      color: "text-emerald-600",
    },
    {
      value: stats ? formatTime(stats.average_processing_time_ms) : "-",
      label: "Average Inference",
      color: "text-amber-600",
    },
    {
      value: stats?.most_common_prediction
        ? formatTumorClass(stats.most_common_prediction)
        : "N/A",
      label: "Most Common Class",
      color: "text-violet-600",
    },
  ];

  const allClasses = ["glioma", "meningioma", "pituitary", "notumor"];

  return (
    <section id="stats" className="w-full">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-mono font-bold text-cyan-800 mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-600" />
          <span>Real-Time Inference Analytics</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Prediction Statistics &amp; Analytics
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed font-medium">
          Aggregated analytics computed in real-time from inference history.
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && !stats && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <div className="mx-auto h-10 w-20 rounded bg-slate-100" />
              <div className="mx-auto mt-3 h-3 w-28 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {/* Error Banner */}
      {error && !stats && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="font-bold text-rose-900 text-sm">
            Failed to load statistics from backend
          </p>
          <p className="mt-1 text-xs text-rose-700">{error}</p>
          <button
            onClick={fetchStats}
            className="btn-primary mt-3 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Stats Display */}
      {stats && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {primaryCards.map((stat, idx) => {
              const borderGradients = [
                "from-cyan-500 to-sky-500",
                "from-emerald-500 to-teal-500",
                "from-amber-500 to-orange-500",
                "from-violet-500 to-purple-500",
              ];
              const bgPillColors = [
                "bg-cyan-50 text-cyan-700 border-cyan-200",
                "bg-emerald-50 text-emerald-700 border-emerald-200",
                "bg-amber-50 text-amber-700 border-amber-200",
                "bg-violet-50 text-violet-700 border-violet-200",
              ];

              return (
                <div
                  key={stat.label}
                  className="group relative overflow-hidden rounded-2xl bg-white/95 border border-slate-200/90 p-6 text-left shadow-md shadow-slate-200/40 hover:shadow-xl hover:border-cyan-300 hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${borderGradients[idx % 4]}`}
                  />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {stat.label}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${bgPillColors[idx % 4]}`}
                    >
                      Real-Time
                    </span>
                  </div>
                  <h3
                    className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${stat.color}`}
                  >
                    {stat.value}
                  </h3>
                  <div className="mt-3 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${borderGradients[idx % 4]} w-3/4`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Class Distribution Breakdown */}
          {stats.total_predictions > 0 && (
            <div className="mt-10 rounded-3xl bg-white/95 border border-slate-200/90 p-6 sm:p-8 shadow-xl shadow-slate-200/40">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-slate-900">
                    Class Distribution &amp; Percentages
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Empirical incidence rate breakdown across patient evaluations
                  </p>
                </div>
                <span className="font-mono text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 font-semibold">
                  Based on {stats.total_predictions} historical records
                </span>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {allClasses.map((cls) => {
                  const count = stats.class_distribution?.[cls] || 0;
                  const percentage = stats.class_percentages?.[cls] || 0;
                  const formattedClass = formatTumorClass(cls);

                  const classColorStyles: Record<
                    string,
                    { border: string; bar: string; badge: string }
                  > = {
                    glioma: {
                      border: "border-amber-200 bg-amber-50/40",
                      bar: "from-amber-500 to-orange-500",
                      badge: "bg-amber-100 text-amber-800 border-amber-200",
                    },
                    meningioma: {
                      border: "border-rose-200 bg-rose-50/40",
                      bar: "from-rose-500 to-pink-500",
                      badge: "bg-rose-100 text-rose-800 border-rose-200",
                    },
                    pituitary: {
                      border: "border-violet-200 bg-violet-50/40",
                      bar: "from-violet-500 to-purple-500",
                      badge: "bg-violet-100 text-violet-800 border-violet-200",
                    },
                    notumor: {
                      border: "border-emerald-200 bg-emerald-50/40",
                      bar: "from-emerald-500 to-teal-500",
                      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
                    },
                  };

                  const currentStyle =
                    classColorStyles[cls.toLowerCase()] || {
                      border: "border-slate-200 bg-slate-50/60",
                      bar: "from-cyan-600 to-violet-600",
                      badge: "bg-slate-100 text-slate-800 border-slate-200",
                    };

                  return (
                    <div
                      key={cls}
                      className={`rounded-2xl border p-5 transition-all shadow-sm hover:shadow-md ${currentStyle.border}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">
                          {formattedClass}
                        </span>
                        <span
                          className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border ${currentStyle.badge}`}
                        >
                          {count} {count === 1 ? "scan" : "scans"}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs font-mono text-slate-500">
                        <span>Cohort Share</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200/80">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${currentStyle.bar} transition-all duration-500`}
                          style={{
                            width: `${Math.min(Math.max(percentage, 0), 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}