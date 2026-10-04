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
      color: "text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.25)]",
    },
    {
      value: stats ? formatConfidence(stats.average_confidence) : "-",
      label: "Average Confidence",
      color: "text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.25)]",
    },
    {
      value: stats ? formatTime(stats.average_processing_time_ms) : "-",
      label: "Average Inference",
      color: "text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.25)]",
    },
    {
      value: stats?.most_common_prediction
        ? formatTumorClass(stats.most_common_prediction)
        : "N/A",
      label: "Most Common Class",
      color: "text-purple-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.25)]",
    },
  ];

  const allClasses = ["glioma", "meningioma", "pituitary", "notumor"];

  return (
    <section id="stats" className="mx-auto max-w-7xl px-6 sm:px-8 py-20">
      <div className="mb-14 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Prediction Statistics &amp; Analytics
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Aggregated analytics computed in real-time from inference history.
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && !stats && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-3xl border border-white/[0.06] bg-slate-900/60 p-8 text-center"
            >
              <div className="mx-auto h-12 w-24 rounded bg-slate-800" />
              <div className="mx-auto mt-4 h-4 w-32 rounded bg-slate-800/60" />
            </div>
          ))}
        </div>
      )}

      {/* Error Banner */}
      {error && !stats && (
        <div className="rounded-3xl border border-red-500/30 bg-red-950/40 p-8 text-center backdrop-blur-md">
          <p className="font-semibold text-red-300">
            Failed to load statistics from backend
          </p>
          <p className="mt-1 text-sm text-red-400">{error}</p>
          <button
            onClick={fetchStats}
            className="btn-primary mt-4 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
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
                className="glass-card-interactive rounded-3xl p-8 text-center"
              >
                <h3
                  className={`text-4xl sm:text-5xl font-bold font-mono tracking-tight ${stat.color}`}
                >
                  {stat.value}
                </h3>
                <p className="mt-3 text-xs font-mono font-medium uppercase tracking-wider text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Class Distribution Breakdown */}
          {stats.total_predictions > 0 && (
            <div className="glass-card mt-12 rounded-3xl p-8 sm:p-10 border border-white/[0.08]">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Class Distribution &amp; Percentages
                </h3>
                <span className="font-mono text-xs text-slate-400">
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
                      className="rounded-2xl border border-white/[0.06] bg-slate-950/60 p-5 backdrop-blur-md"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">
                          {formattedClass}
                        </span>
                        <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/40 border border-sky-500/20 px-2 py-0.5 rounded-md">
                          {count} {count === 1 ? "scan" : "scans"}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs font-mono text-slate-400">
                        <span>Cohort Share</span>
                        <span className="font-semibold text-slate-300">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800/80">
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