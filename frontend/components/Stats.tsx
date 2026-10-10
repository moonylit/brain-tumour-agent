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
      color: "text-sky-600",
      bg: "border-2 border-sky-200 bg-gradient-to-br from-sky-50/80 via-white to-sky-50/30 shadow-lg shadow-sky-500/10",
      labelColor: "text-sky-900",
    },
    {
      value: stats ? formatConfidence(stats.average_confidence) : "-",
      label: "Average Confidence",
      color: "text-emerald-600",
      bg: "border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 shadow-lg shadow-emerald-500/10",
      labelColor: "text-emerald-900",
    },
    {
      value: stats ? formatTime(stats.average_processing_time_ms) : "-",
      label: "Average Inference",
      color: "text-amber-600",
      bg: "border-2 border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 shadow-lg shadow-amber-500/10",
      labelColor: "text-amber-900",
    },
    {
      value: stats?.most_common_prediction
        ? formatTumorClass(stats.most_common_prediction)
        : "N/A",
      label: "Most Common Class",
      color: "text-purple-600",
      bg: "border-2 border-purple-200 bg-gradient-to-br from-purple-50/80 via-white to-purple-50/30 shadow-lg shadow-purple-500/10",
      labelColor: "text-purple-900",
    },
  ];

  const allClasses = ["glioma", "meningioma", "pituitary", "notumor"];

  return (
    <section id="stats" className="mx-auto max-w-[1720px] w-full px-6 sm:px-8 py-20">
      <div className="mb-14 text-center">
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
          Prediction Statistics &amp; Analytics
        </h2>
        <p className="mt-3 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Aggregated analytics computed in real-time from inference history.
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && !stats && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border-2 border-slate-200 bg-slate-50 p-10 text-center"
            >
              <div className="mx-auto h-12 w-24 rounded bg-slate-200" />
              <div className="mx-auto mt-4 h-4 w-32 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {/* Error Banner */}
      {error && !stats && (
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-10 text-center shadow-sm">
          <p className="font-bold text-lg text-red-800">
            Failed to load statistics from backend
          </p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-5 rounded-xl border-2 border-red-300 bg-white px-6 py-3 text-sm font-bold text-red-700 hover:bg-red-50 shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Stats Display */}
      {stats && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {primaryCards.map((stat) =>
              stat.label === "Most Common Class" ? (
                <div
                  key={stat.label}
                  className="overflow-hidden p-6 flex flex-col items-center justify-center bg-purple-50/50 rounded-2xl border border-purple-100 transition-all hover:scale-102 hover:shadow-md"
                >
                  <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight break-words text-center w-full">
                    {stat.value}
                  </h3>
                  <p className="text-xs font-bold text-purple-600 tracking-widest uppercase mt-1">
                    {stat.label}
                  </p>
                </div>
              ) : (
                <div
                  key={stat.label}
                  className={`rounded-3xl p-10 text-center transition-all hover:scale-102 hover:shadow-xl ${stat.bg}`}
                >
                  <h3
                    className={`text-5xl sm:text-6xl font-black font-mono tracking-tight ${stat.color}`}
                  >
                    {stat.value}
                  </h3>
                  <p
                    className={`mt-4 text-sm font-mono font-bold uppercase tracking-wider ${stat.labelColor}`}
                  >
                    {stat.label}
                  </p>
                </div>
              )
            )}
          </div>

          {/* Class Distribution Breakdown */}
          {stats.total_predictions > 0 && (
            <div className="bg-white/90 backdrop-blur-md mt-14 rounded-3xl border-2 border-blue-200/80 shadow-2xl shadow-blue-900/10 p-8 sm:p-14">
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-200/60 pb-5">
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Class Distribution &amp; Percentages
                </h3>
                <span className="font-mono text-sm font-bold text-blue-700 bg-blue-100 border border-blue-300 px-3 py-1 rounded-full">
                  Based on {stats.total_predictions} historical records
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {allClasses.map((cls) => {
                  const count = stats.class_distribution?.[cls] || 0;
                  const percentage = stats.class_percentages?.[cls] || 0;
                  const formattedClass = formatTumorClass(cls);

                  return (
                    <div
                      key={cls}
                      className="rounded-2xl border-2 border-blue-100 bg-gradient-to-b from-white to-blue-50/30 p-6 shadow-sm hover:border-blue-300 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base text-slate-900">
                          {formattedClass}
                        </span>
                        <span className="font-mono text-xs font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2.5 py-1 rounded-md">
                          {count} {count === 1 ? "scan" : "scans"}
                        </span>
                      </div>

                      <div className="mt-5 flex items-center justify-between text-xs font-mono text-slate-600">
                        <span className="font-semibold">Cohort Share</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="mt-2.5 h-3 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
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