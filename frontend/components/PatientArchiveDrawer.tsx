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
import {
  X,
  RefreshCw,
  FolderArchive,
  Filter,
  Calendar,
  ExternalLink,
  ZoomIn,
  AlertTriangle,
} from "lucide-react";

export interface PatientArchiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  refreshTrigger?: number;
}

const VALID_CLASSES = [
  { label: "All Classes", value: "" },
  { label: "Glioma", value: "glioma" },
  { label: "Meningioma", value: "meningioma" },
  { label: "Pituitary", value: "pituitary" },
  { label: "No Tumor", value: "notumor" },
];

export default function PatientArchiveDrawer({
  isOpen,
  onClose,
  refreshTrigger,
}: PatientArchiveDrawerProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
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
      console.error("Failed to load archive history:", err);
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [sortOrder, selectedClass, limit]);

  // Fetch when mounted, when filters change, or when refreshTrigger increments
  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData, refreshTrigger]);

  // Listen for custom "new-prediction" event to keep archive fresh
  useEffect(() => {
    const handleNewPrediction = () => {
      fetchHistoryData();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("new-prediction", handleNewPrediction);
      return () => {
        window.removeEventListener("new-prediction", handleNewPrediction);
      };
    }
  }, [fetchHistoryData]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  function getBadgeColor(prediction: string) {
    switch (prediction.toLowerCase()) {
      case "glioma":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "meningioma":
        return "bg-rose-100 text-rose-900 border-rose-300";
      case "pituitary":
        return "bg-purple-100 text-purple-900 border-purple-300";
      case "notumor":
      case "no tumor":
      case "no_tumor":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  }

  return (
    <>
      {/* Semi-transparent Backdrop Scrim */}
      {isOpen && (
        <div
          data-testid="archive-drawer-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-xs transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Off-Canvas Drawer */}
      <aside
        data-testid="patient-archive-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Scan Archive Drawer"
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 flex flex-col border-l border-slate-200 ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 shadow-sm shrink-0">
              <FolderArchive className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Prediction History
                </h2>
                <span className="text-[10px] font-mono font-bold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full border border-cyan-200">
                  Archive
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Historical MRI scans and classification records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={fetchHistoryData}
              disabled={loading}
              title="Refresh scan history"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin text-cyan-600" : ""
                }`}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close archive drawer"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Query Controls */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs">
            <div className="flex items-center gap-1.5 font-mono font-bold text-slate-500 uppercase tracking-wider text-[10px]">
              <Filter className="h-3 w-3" />
              <span>Filter &amp; Query Controls</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Class Filter */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-600">
                  Filter by Class
                </label>
                <select
                  aria-label="Filter by Class"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:border-cyan-600 focus:outline-none transition shadow-sm"
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
                <label className="mb-1 block text-[11px] font-medium text-slate-600">
                  Sort Order
                </label>
                <select
                  aria-label="Sort Order"
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "desc" | "asc")
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:border-cyan-600 focus:outline-none transition shadow-sm"
                >
                  <option value="desc">Newest First (Desc)</option>
                  <option value="asc">Oldest First (Asc)</option>
                </select>
              </div>
            </div>

            {/* Display Limit */}
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-600">
                Display Limit
              </label>
              <select
                aria-label="Display Limit"
                value={limit || ""}
                onChange={(e) =>
                  setLimit(e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:border-cyan-600 focus:outline-none transition shadow-sm"
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
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-xs text-rose-900">
              <div className="flex items-center gap-1.5 font-bold text-rose-900">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>Error loading prediction history</span>
              </div>
              <p className="mt-1 text-rose-800">{error}</p>
              <button
                type="button"
                onClick={fetchHistoryData}
                className="mt-2.5 rounded-lg border border-rose-300 bg-white px-3 py-1 text-xs font-bold text-slate-800 hover:bg-rose-50 transition"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="py-10 text-center text-slate-500">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-cyan-600 border-r-transparent" />
              <p className="mt-3 text-xs font-mono font-medium">
                Fetching prediction telemetry...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && history.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500 bg-slate-50/60">
              <p className="text-sm font-bold text-slate-700">
                No prediction history found
              </p>
              <p className="mt-1 text-xs text-slate-500 font-medium">
                {selectedClass
                  ? `No records found for class "${formatTumorClass(
                      selectedClass
                    )}". Try adjusting filters.`
                  : "Upload an MRI scan to generate your first prediction."}
              </p>
            </div>
          )}

          {/* History Records List */}
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
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3.5 transition hover:border-cyan-400 hover:bg-white shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      {/* Grad-CAM Thumbnail */}
                      {heatmapUrl ? (
                        <div
                          className="group relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-slate-300 bg-slate-950 shadow-sm"
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
                            <ZoomIn className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-[10px] font-mono text-slate-400 font-semibold">
                          No map
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className="font-bold text-slate-900 text-xs truncate max-w-[170px]"
                            title={item.filename}
                          >
                            {item.filename}
                          </span>
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${getBadgeColor(
                              item.prediction
                            )}`}
                          >
                            {formattedPrediction}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(item.timestamp).toLocaleString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>

                        {/* Confidence Bar & Metrics */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-cyan-600 h-full rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  item.confidence * 100
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-slate-700">
                            {(item.confidence * 100).toFixed(1)}%
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {item.processing_time_ms.toFixed(0)}ms
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Full Heatmap Modal Dialog */}
        {selectedHeatmap && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
            onClick={() => setSelectedHeatmap(null)}
          >
            <div
              className="relative max-w-lg w-full rounded-3xl p-5 shadow-2xl border border-slate-200 bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Grad-CAM Explainability Heatmap
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedHeatmap(null)}
                  aria-label="Close modal"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="overflow-hidden rounded-xl bg-slate-950 p-2 border border-slate-200">
                <img
                  src={selectedHeatmap}
                  alt="Full Grad-CAM Heatmap"
                  className="max-h-[60vh] w-auto rounded-lg object-contain mx-auto"
                />
              </div>
              <div className="mt-4 flex justify-end">
                <a
                  href={selectedHeatmap}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition"
                >
                  <span>Open in New Tab</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
