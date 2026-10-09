"use client";

import { useEffect, useState, useCallback } from "react";
import {
  HistoryItem,
  HistoryQueryParams,
  getHistory,
  getHeatmapUrl,
  formatTumorClass,
  formatApiError,
} from "@/lib/api";

type Props = {
  initialHistory?: HistoryItem[];
  refreshTrigger?: number;
};

const VALID_CLASSES = [
  { label: "All Classes", value: "" },
  { label: "Glioma", value: "glioma" },
  { label: "Meningioma", value: "meningioma" },
  { label: "Pituitary", value: "pituitary" },
  { label: "No Tumor", value: "notumor" },
];

export default function HistoryCard({
  initialHistory,
  refreshTrigger,
}: Props) {
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter and pagination state
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [limit, setLimit] = useState<number | undefined>(10);
  const [selectedHeatmap, setSelectedHeatmap] = useState<string | null>(null);

  const fetchHistoryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: HistoryQueryParams = {
        sort: sortOrder,
      };

      if (selectedClass) {
        params.prediction = selectedClass;
      }
      if (limit && limit > 0) {
        params.limit = limit;
      }

      const data = await getHistory(params);
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history:", err);
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [selectedClass, sortOrder, limit]);

  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData, refreshTrigger]);

  function getBadgeColor(prediction: string) {
    switch (prediction.toLowerCase()) {
      case "glioma":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "meningioma":
        return "bg-rose-50 text-rose-800 border-rose-200";
      case "pituitary":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "notumor":
      case "no tumor":
      case "no_tumor":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  }

  return (
    <div
      id="history"
      className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-xl shadow-blue-900/5 p-8 sm:p-10"
    >
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Prediction History
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Log of past MRI scans and model predictions.
          </p>
        </div>

        <button
          onClick={fetchHistoryData}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-400 border-r-transparent" />
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span>Refresh</span>
            </>
          )}
        </button>
      </div>

      {/* Query Controls */}
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
        {/* Class Filter */}
        <div>
          <label className="mb-1.5 block text-xs font-mono font-medium uppercase tracking-wider text-slate-600">
            Filter by Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:outline-none shadow-xs transition"
          >
            {VALID_CLASSES.map((cls) => (
              <option key={cls.value} value={cls.value}>
                {cls.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="mb-1.5 block text-xs font-mono font-medium uppercase tracking-wider text-slate-600">
            Sort Order
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:outline-none shadow-xs transition"
          >
            <option value="desc">Newest First (Desc)</option>
            <option value="asc">Oldest First (Asc)</option>
          </select>
        </div>

        {/* Limit */}
        <div>
          <label className="mb-1.5 block text-xs font-mono font-medium uppercase tracking-wider text-slate-600">
            Display Limit
          </label>
          <select
            value={limit || ""}
            onChange={(e) =>
              setLimit(e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:outline-none shadow-xs transition"
          >
            <option value="5">5 records</option>
            <option value="10">10 records</option>
            <option value="25">25 records</option>
            <option value="">All records</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
          <p className="font-semibold text-red-800">
            Error loading prediction history
          </p>
          <p className="mt-1 text-red-700">{error}</p>
          <button
            onClick={fetchHistoryData}
            className="mt-3 rounded-lg border border-red-300 bg-white px-3.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 shadow-xs"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-12 text-center text-slate-500">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-r-transparent" />
          <p className="mt-4 text-xs font-mono">Fetching prediction telemetry...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && history.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-500 bg-slate-50">
          <p className="text-base font-semibold text-slate-700">
            No prediction history found
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {selectedClass
              ? `No records found for class "${formatTumorClass(selectedClass)}". Try adjusting your filters.`
              : "Upload an MRI scan to generate your first prediction."}
          </p>
        </div>
      )}

      {/* History List */}
      {!loading && !error && history.length > 0 && (
        <div className="space-y-3">
          {history.map((item, index) => {
            const heatmapUrl = item.heatmap_filename
              ? getHeatmapUrl(item.heatmap_filename)
              : null;
            const formattedPrediction = formatTumorClass(item.prediction);

            return (
              <div
                key={`${item.timestamp}-${index}`}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 transition hover:shadow-xs sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  {/* Grad-CAM Thumbnail */}
                  {heatmapUrl ? (
                    <div
                      className="group relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-black/5 shadow-xs"
                      onClick={() => setSelectedHeatmap(heatmapUrl)}
                      title="Click to view full heatmap"
                    >
                      <img
                        src={heatmapUrl}
                        alt={`Heatmap for ${item.filename}`}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-xs font-mono text-slate-500">
                      No map
                    </div>
                  )}

                  {/* Metadata and Details */}
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800 text-sm sm:text-base">
                      {item.filename}
                    </span>

                    <span className="mt-1 font-mono text-xs text-slate-500">
                      {new Date(item.timestamp).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getBadgeColor(
                          item.prediction,
                        )}`}
                      >
                        {formattedPrediction}
                      </span>

                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {(item.confidence * 100).toFixed(2)}%
                      </span>

                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {item.processing_time_ms.toFixed(2)} ms
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Heatmap Modal Dialog */}
      {selectedHeatmap && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
          onClick={() => setSelectedHeatmap(null)}
        >
          <div
            className="relative max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                Grad-CAM Explainability Heatmap
              </h3>
              <button
                onClick={() => setSelectedHeatmap(null)}
                aria-label="Close modal"
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="overflow-hidden rounded-xl bg-slate-900 p-2 border border-slate-200">
              <img
                src={selectedHeatmap}
                alt="Full Grad-CAM Heatmap"
                className="max-h-[70vh] w-auto rounded-lg object-contain mx-auto"
              />
            </div>
            <div className="mt-5 flex justify-end">
              <a
                href={selectedHeatmap}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 shadow-sm"
              >
                Open in New Tab
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}