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
    <section id="stats" className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <div className="mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Prediction Statistics &amp; Analytics
        </h2>
        <p className="mt-1 text-sm text-slate-500 max-w-xl mx-auto leading-relaxed font-normal">
          Aggregated analytics computed in real-time from inference history.
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && !stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {primaryCards.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white border border-slate-200 p-6 text-center shadow-sm"
              >
                <h3
                  className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${stat.color}`}
                >
                  {stat.value}
                </h3>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Class Distribution Breakdown */}
          {stats.total_predictions > 0 && (
            <div className="mt-8 rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-sm">
              <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-3.5">
                <h3 className="text-base font-bold tracking-tight text-slate-900">
                  Class Distribution &amp; Percentages
                </h3>
                <span className="font-mono text-xs text-slate-400">
                  Based on {stats.total_predictions} historical records
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {allClasses.map((cls) => {
                  const count = stats.class_distribution?.[cls] || 0;
                  const percentage = stats.class_percentages?.[cls] || 0;
                  const formattedClass = formatTumorClass(cls);

                  return (
                    <div
                      key={cls}
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-800">
                          {formattedClass}
                        </span>
                        <span className="font-mono text-xs font-semibold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-md">
                          {count} {count === 1 ? "scan" : "scans"}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400">
                        <span>Cohort Share</span>
                        <span className="font-bold text-slate-700">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-violet-600 transition-all duration-500"
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