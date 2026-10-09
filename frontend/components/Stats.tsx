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
      color: "text-purple-600",
    },
  ];

  const allClasses = ["glioma", "meningioma", "pituitary", "notumor"];

  return (
    <section id="stats" className="mx-auto max-w-7xl px-6 sm:px-8 py-20">
      <div className="mb-14 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800">
          Prediction Statistics &amp; Analytics
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Aggregated analytics computed in real-time from inference history.
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && !stats && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-8 text-center"
            >
              <div className="mx-auto h-12 w-24 rounded bg-slate-200" />
              <div className="mx-auto mt-4 h-4 w-32 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {/* Error Banner */}
      {error && !stats && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <p className="font-semibold text-red-800">
            Failed to load statistics from backend
          </p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Stats Display */}
      {stats && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {primaryCards.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center"
              >
                <h3
                  className={`text-4xl sm:text-5xl font-bold font-mono tracking-tight ${stat.color}`}
                >
                  {stat.value}
                </h3>
                <p className="mt-3 text-xs font-mono font-medium uppercase tracking-wider text-slate-600">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Class Distribution Breakdown */}
          {stats.total_predictions > 0 && (
            <div className="bg-white mt-12 rounded-xl shadow-sm border border-slate-200 p-8 sm:p-10">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
                <h3 className="text-xl font-bold tracking-tight text-slate-800">
                  Class Distribution &amp; Percentages
                </h3>
                <span className="font-mono text-xs text-slate-500">
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
                      className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">
                          {formattedClass}
                        </span>
                        <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                          {count} {count === 1 ? "scan" : "scans"}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs font-mono text-slate-500">
                        <span>Cohort Share</span>
                        <span className="font-semibold text-slate-700">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-500"
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