"use client";

import { useEffect, useState, useCallback } from "react";
import {
  EvaluationMetrics,
  EvaluationPlots,
  getEvaluation,
  getEvaluationPlots,
  getPlotUrl,
  formatTumorClass,
  formatApiError,
} from "@/lib/api";

export type EvaluationTab = "confusion_matrix" | "roc_curve" | "precision_recall";

type Props = {
  metrics?: EvaluationMetrics;
  plots?: EvaluationPlots;
  initialMetrics?: EvaluationMetrics;
  initialPlots?: EvaluationPlots;
  defaultTab?: EvaluationTab | null;
};

export const TAB_CONFIG: {
  id: EvaluationTab;
  label: string;
  explanation: string;
}[] = [
  {
    id: "confusion_matrix",
    label: "Confusion Matrix",
    explanation:
      "Shows how often the model correctly identifies each tumor class and where classifications are confused.",
  },
  {
    id: "roc_curve",
    label: "ROC Curve",
    explanation:
      "Shows the model's class discrimination performance across classification thresholds.",
  },
  {
    id: "precision_recall",
    label: "Precision-Recall",
    explanation:
      "Shows the trade-off between precision and recall across classification thresholds.",
  },
];

export default function EvaluationCard({
  metrics: propMetrics,
  plots: propPlots,
  initialMetrics,
  initialPlots,
  defaultTab = null,
}: Props) {
  const incomingMetrics = propMetrics || initialMetrics || null;
  const incomingPlots = propPlots || initialPlots || null;

  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(incomingMetrics);
  const [plots, setPlots] = useState<EvaluationPlots | null>(incomingPlots);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default is null (closed), user must click a button to view visualization
  const [activeTab, setActiveTab] = useState<EvaluationTab | null>(defaultTab);

  const fetchEvaluationData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [evalData, plotData] = await Promise.all([
        getEvaluation(),
        getEvaluationPlots(),
      ]);
      setMetrics(evalData);
      setPlots(plotData);
    } catch (err) {
      console.error("Failed to load evaluation:", err);
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (incomingMetrics) setMetrics(incomingMetrics);
    if (incomingPlots) setPlots(incomingPlots);
  }, [incomingMetrics, incomingPlots]);

  useEffect(() => {
    if (!incomingMetrics || !incomingPlots) {
      fetchEvaluationData();
    }
  }, [incomingMetrics, incomingPlots, fetchEvaluationData]);

  const activeTabConfig = TAB_CONFIG.find((tab) => tab.id === activeTab);

  function handleTabClick(tabId: EvaluationTab) {
    setActiveTab((prev) => (prev === tabId ? null : tabId));
  }

  return (
    <section id="evaluation" className="w-full">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-10 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
        {/* Subtle top cyan/violet accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-600 via-sky-500 to-violet-600" />

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300 bg-cyan-50 px-3.5 py-1 text-xs font-mono font-bold text-cyan-800">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-600" />
              <span>Validated Test Performance</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Model Evaluation
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed font-medium">
              Performance metrics and diagnostic curves evaluated on the validation dataset using the trained ResNet-50 network.
            </p>
          </div>

          {error && (
            <button
              onClick={fetchEvaluationData}
              className="btn-secondary inline-flex items-center gap-2 self-start rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 shadow-sm"
            >
              Retry Load
            </button>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && !metrics && (
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-slate-100 p-6 text-center"
                >
                  <div className="mx-auto h-4 w-20 rounded bg-slate-300" />
                  <div className="mx-auto mt-3 h-8 w-24 rounded bg-slate-300" />
                </div>
              ))}
            </div>
            <div className="h-40 rounded-2xl border border-slate-200 bg-slate-100" />
          </div>
        )}

        {/* Error State */}
        {error && !metrics && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center backdrop-blur-md">
            <p className="font-bold text-rose-900">
              Unable to load model evaluation data
            </p>
            <p className="mt-1 text-sm text-rose-700 font-medium">{error}</p>
          </div>
        )}

        {/* Evaluation Metrics Cards */}
        {metrics && (
          <div className="mb-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            <div className="group relative overflow-hidden rounded-2xl bg-white/95 border border-slate-200/90 p-5 sm:p-6 text-left shadow-md shadow-slate-200/40 hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Accuracy
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <p className="mt-2 text-3xl sm:text-4xl font-black font-mono tracking-tight text-emerald-600">
                {(metrics.accuracy * 100).toFixed(2)}%
              </p>
              <div className="mt-3 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 w-[98%]" />
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-white/95 border border-slate-200/90 p-5 sm:p-6 text-left shadow-md shadow-slate-200/40 hover:shadow-xl hover:border-cyan-300 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-sky-500" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Precision
                </span>
                <span className="text-[10px] font-mono font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <p className="mt-2 text-3xl sm:text-4xl font-black font-mono tracking-tight text-cyan-600">
                {(metrics.precision * 100).toFixed(2)}%
              </p>
              <div className="mt-3 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-cyan-500 w-[98%]" />
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-white/95 border border-slate-200/90 p-5 sm:p-6 text-left shadow-md shadow-slate-200/40 hover:shadow-xl hover:border-violet-300 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Recall
                </span>
                <span className="text-[10px] font-mono font-bold text-violet-800 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <p className="mt-2 text-3xl sm:text-4xl font-black font-mono tracking-tight text-violet-600">
                {(metrics.recall * 100).toFixed(2)}%
              </p>
              <div className="mt-3 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-violet-500 w-[98%]" />
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-white/95 border border-slate-200/90 p-5 sm:p-6 text-left shadow-md shadow-slate-200/40 hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  F1 Score
                </span>
                <span className="text-[10px] font-mono font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <p className="mt-2 text-3xl sm:text-4xl font-black font-mono tracking-tight text-indigo-600">
                {(metrics.f1_score * 100).toFixed(2)}%
              </p>
              <div className="mt-3 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-500 w-[98%]" />
              </div>
            </div>
          </div>
        )}

        {/* Buttons for Curves & Matrix (Click to toggle display) */}
        <div className="mb-4 border-b border-slate-100 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
              Evaluation Visualizations
            </span>
            {activeTab && (
              <button
                type="button"
                onClick={() => setActiveTab(null)}
                className="text-xs text-slate-500 hover:text-slate-800 transition flex items-center gap-1 self-start sm:self-auto cursor-pointer font-semibold"
              >
                <span>Hide Visualization</span>
                <span>✕</span>
              </button>
            )}
          </div>

          <div
            role="tablist"
            aria-label="Model Evaluation Visualizations"
            className="flex flex-wrap items-center gap-2.5"
          >
            {TAB_CONFIG.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isSelected}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => handleTabClick(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-600 to-violet-600 text-white shadow-md shadow-cyan-600/30"
                      : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isSelected ? "bg-white" : "bg-slate-400"
                    }`}
                  />
                  <span>{tab.label}</span>
                  {isSelected && (
                    <span className="text-xs text-cyan-200 font-mono ml-0.5">✓</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Visualization One-Line Explanation (Shown ONLY when a tab is active) */}
          {activeTabConfig && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-cyan-200 bg-cyan-50/70 px-4 py-3 text-sm text-slate-800 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-cyan-600 shrink-0" />
              <span className="font-bold text-cyan-900 font-mono text-xs uppercase tracking-wider">
                {activeTabConfig.label}:
              </span>
              <span className="text-slate-700 font-medium">{activeTabConfig.explanation}</span>
            </div>
          )}
        </div>

        {/* If no tab selected, show clean prompt */}
        {!activeTab && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
            <p className="text-sm font-bold text-slate-700">
              Diagnostic Visualizations
            </p>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Click any button above to display the Confusion Matrix, ROC Curve, or Precision-Recall Curve.
            </p>
          </div>
        )}

        {/* Selected Visualization Panel (Displays ONLY when a button is clicked) */}
        {activeTab && plots && (
          <div
            role="tabpanel"
            id={`panel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 sm:p-8 backdrop-blur-md shadow-sm"
          >
            {activeTab === "confusion_matrix" && plots.confusion_matrix && (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-lg p-2">
                  <img
                    src={getPlotUrl(plots.confusion_matrix)}
                    alt="Confusion Matrix"
                    className="w-full object-contain rounded-xl"
                  />
                </div>

                {metrics?.confusion_matrix && metrics?.class_labels && (
                  <div className="mt-8 w-full max-w-2xl">
                    <h4 className="mb-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                      Class Confusion Matrix Summary
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono">
                          <tr>
                            <th className="px-4 py-3 font-bold">True \ Pred</th>
                            {metrics.class_labels.map((label) => (
                              <th
                                key={label}
                                className="px-4 py-3 font-bold text-slate-800"
                              >
                                {formatTumorClass(label)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {metrics.confusion_matrix.map((row, rowIdx) => {
                            const rowLabel = metrics.class_labels![rowIdx];
                            return (
                              <tr
                                key={rowLabel}
                                className="hover:bg-slate-50 transition"
                              >
                                <td className="px-4 py-3 font-sans font-bold text-slate-800">
                                  {formatTumorClass(rowLabel)}
                                </td>
                                {row.map((val, colIdx) => (
                                  <td
                                    key={colIdx}
                                    className={`px-4 py-3 ${
                                      rowIdx === colIdx
                                        ? "font-bold text-emerald-700 bg-emerald-50"
                                        : val > 0
                                        ? "text-amber-700 font-semibold"
                                        : "text-slate-400"
                                    }`}
                                  >
                                    {val}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "roc_curve" && plots.roc_curve && (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-lg p-2">
                  <img
                    src={getPlotUrl(plots.roc_curve)}
                    alt="ROC Curve"
                    className="w-full object-contain rounded-xl"
                  />
                </div>

                {metrics?.roc_curve && (
                  <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 w-full max-w-2xl">
                    {Object.entries(metrics.roc_curve).map(([cls, curve]) => (
                      <div
                        key={cls}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 text-center shadow-sm"
                      >
                        <span className="text-xs text-slate-500 block font-semibold">
                          {formatTumorClass(cls)}
                        </span>
                        <p className="mt-1 font-mono text-sm font-bold text-cyan-700">
                          AUC {curve.auc.toFixed(3)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "precision_recall" && plots.precision_recall_curve && (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-lg p-2">
                  <img
                    src={getPlotUrl(plots.precision_recall_curve)}
                    alt="Precision Recall Curve"
                    className="w-full object-contain rounded-xl"
                  />
                </div>

                {metrics?.precision_recall_curve && (
                  <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 w-full max-w-2xl">
                    {Object.entries(metrics.precision_recall_curve).map(
                      ([cls, curve]) => (
                        <div
                          key={cls}
                          className="rounded-xl border border-slate-200 bg-white p-3.5 text-center shadow-sm"
                        >
                          <span className="text-xs text-slate-500 block font-semibold">
                            {formatTumorClass(cls)}
                          </span>
                          <p className="mt-1 font-mono text-sm font-bold text-violet-700">
                            AP {curve.average_precision.toFixed(3)}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}