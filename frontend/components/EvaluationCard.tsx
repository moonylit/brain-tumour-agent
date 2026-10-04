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
  const [activeTab, setActiveTab] = useState<EvaluationTab | null>(defaultTab);
  const [loading, setLoading] = useState(!incomingMetrics || !incomingPlots);
  const [error, setError] = useState<string | null>(null);

  const fetchEvaluationData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [metricsData, plotsData] = await Promise.all([
        getEvaluation(),
        getEvaluationPlots(),
      ]);
      setMetrics(metricsData);
      setPlots(plotsData);
    } catch (err) {
      console.error("Failed to load evaluation data:", err);
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (incomingMetrics) {
      setMetrics(incomingMetrics);
    }
    if (incomingPlots) {
      setPlots(incomingPlots);
    }
    if (!incomingMetrics || !incomingPlots) {
      fetchEvaluationData();
    }
  }, [incomingMetrics, incomingPlots, fetchEvaluationData]);

  const activeTabConfig = TAB_CONFIG.find((tab) => tab.id === activeTab);

  function handleTabClick(tabId: EvaluationTab) {
    setActiveTab((prev) => (prev === tabId ? null : tabId));
  }

  return (
    <section id="evaluation" className="mx-auto max-w-7xl px-6 sm:px-8 py-16">
      <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/[0.08]">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-mono text-sky-400">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              <span>Validated Test Performance</span>
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Model Evaluation
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
              Performance metrics and diagnostic curves evaluated on the validation dataset using the trained ResNet-50 network.
            </p>
          </div>

          {error && (
            <button
              onClick={fetchEvaluationData}
              className="btn-secondary inline-flex items-center gap-2 self-start rounded-xl px-4 py-2 text-sm font-medium text-slate-300 hover:text-white"
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
                  className="rounded-2xl border border-white/[0.06] bg-slate-950/60 p-6 text-center"
                >
                  <div className="mx-auto h-4 w-20 rounded bg-slate-800" />
                  <div className="mx-auto mt-3 h-8 w-24 rounded bg-slate-800/80" />
                </div>
              ))}
            </div>
            <div className="h-40 rounded-2xl border border-white/[0.06] bg-slate-950/40" />
          </div>
        )}

        {/* Error State */}
        {error && !metrics && (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/40 p-8 text-center backdrop-blur-md">
            <p className="font-semibold text-red-300">
              Unable to load model evaluation data
            </p>
            <p className="mt-1 text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Evaluation Metrics Cards */}
        {metrics && (
          <div className="mb-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            <div className="glass-card-interactive rounded-2xl p-6 text-center">
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400">
                Accuracy
              </span>
              <p className="mt-2 text-3xl sm:text-4xl font-bold font-mono tracking-tight text-emerald-400">
                {(metrics.accuracy * 100).toFixed(2)}%
              </p>
            </div>

            <div className="glass-card-interactive rounded-2xl p-6 text-center">
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400">
                Precision
              </span>
              <p className="mt-2 text-3xl sm:text-4xl font-bold font-mono tracking-tight text-sky-400">
                {(metrics.precision * 100).toFixed(2)}%
              </p>
            </div>

            <div className="glass-card-interactive rounded-2xl p-6 text-center">
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400">
                Recall
              </span>
              <p className="mt-2 text-3xl sm:text-4xl font-bold font-mono tracking-tight text-blue-400">
                {(metrics.recall * 100).toFixed(2)}%
              </p>
            </div>

            <div className="glass-card-interactive rounded-2xl p-6 text-center">
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400">
                F1 Score
              </span>
              <p className="mt-2 text-3xl sm:text-4xl font-bold font-mono tracking-tight text-purple-400">
                {(metrics.f1_score * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        )}

        {/* Buttons for Curves & Matrix (Click to toggle display) */}
        <div className="mb-4 border-b border-white/[0.08] pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
              Evaluation Visualizations
            </span>
            {activeTab && (
              <button
                type="button"
                onClick={() => setActiveTab(null)}
                className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 self-start sm:self-auto cursor-pointer"
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
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white border border-blue-400/50 shadow-[0_0_20px_rgba(37,99,235,0.35)]"
                      : "bg-white/[0.04] text-slate-300 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white hover:border-white/[0.15]"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isSelected ? "bg-white" : "bg-slate-500"
                    }`}
                  />
                  <span>{tab.label}</span>
                  {isSelected && (
                    <span className="text-xs text-blue-200 font-mono ml-0.5">✓</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Visualization One-Line Explanation (Shown ONLY when a tab is active) */}
          {activeTabConfig && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-slate-950/60 px-4 py-3 text-sm text-slate-300 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-sky-400 shrink-0" />
              <span className="font-semibold text-sky-400 font-mono text-xs uppercase tracking-wider">
                {activeTabConfig.label}:
              </span>
              <span className="text-slate-300">{activeTabConfig.explanation}</span>
            </div>
          )}
        </div>

        {/* If no tab selected, show clean prompt */}
        {!activeTab && (
          <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-8 text-center">
            <p className="text-sm font-medium text-slate-300">
              Diagnostic Visualizations
            </p>
            <p className="mt-1 text-xs text-slate-400">
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
            className="rounded-2xl border border-white/[0.08] bg-slate-950/50 p-6 sm:p-8 backdrop-blur-md"
          >
            {activeTab === "confusion_matrix" && plots.confusion_matrix && (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl p-2">
                  <img
                    src={getPlotUrl(plots.confusion_matrix)}
                    alt="Confusion Matrix"
                    className="w-full object-contain rounded-xl"
                  />
                </div>

                {metrics?.confusion_matrix && metrics?.class_labels && (
                  <div className="mt-8 w-full max-w-2xl">
                    <h4 className="mb-3 text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                      Class Confusion Matrix Summary
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-slate-900/90 shadow-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-white/[0.08] bg-slate-950/80 text-slate-400 font-mono">
                          <tr>
                            <th className="px-4 py-3 font-medium">True \ Pred</th>
                            {metrics.class_labels.map((label) => (
                              <th
                                key={label}
                                className="px-4 py-3 font-semibold text-slate-300"
                              >
                                {formatTumorClass(label)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.06] font-mono">
                          {metrics.confusion_matrix.map((row, rowIdx) => {
                            const rowLabel = metrics.class_labels![rowIdx];
                            return (
                              <tr
                                key={rowLabel}
                                className="hover:bg-white/[0.02] transition"
                              >
                                <td className="px-4 py-3 font-sans font-medium text-slate-300">
                                  {formatTumorClass(rowLabel)}
                                </td>
                                {row.map((val, colIdx) => (
                                  <td
                                    key={colIdx}
                                    className={`px-4 py-3 ${
                                      rowIdx === colIdx
                                        ? "font-bold text-emerald-400 bg-emerald-950/30"
                                        : val > 0
                                        ? "text-amber-400"
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
                <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl p-2">
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
                        className="rounded-xl border border-white/[0.08] bg-slate-900/90 p-3.5 text-center shadow-lg"
                      >
                        <span className="text-xs text-slate-400 block font-medium">
                          {formatTumorClass(cls)}
                        </span>
                        <p className="mt-1 font-mono text-sm font-bold text-sky-400">
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
                <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl p-2">
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
                          className="rounded-xl border border-white/[0.08] bg-slate-900/90 p-3.5 text-center shadow-lg"
                        >
                          <span className="text-xs text-slate-400 block font-medium">
                            {formatTumorClass(cls)}
                          </span>
                          <p className="mt-1 font-mono text-sm font-bold text-purple-400">
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