"use client";

import React, { useState, useRef } from "react";
import {
  Layers,
  Crosshair,
  Zap,
  Eye,
  Maximize2,
  Columns,
} from "lucide-react";

export interface ScanVisualizerProps {
  rawImage: string;
  gradCamImage?: string;
  prediction?: string;
  heatmapFilename?: string;
  showCrosshairsDefault?: boolean;
}

export type VisualizerMode = "xray" | "side-by-side" | "raw" | "gradcam";

export default function ScanVisualizer({
  rawImage,
  gradCamImage,
  prediction = "Scan",
  heatmapFilename,
  showCrosshairsDefault = true,
}: ScanVisualizerProps) {
  const [mode, setMode] = useState<VisualizerMode>("xray");
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [showCrosshairs, setShowCrosshairs] = useState(showCrosshairsDefault);
  const containerRef = useRef<HTMLDivElement>(null);

  const effectiveGradCam = gradCamImage || rawImage;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    setCursorPos({ x, y });
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setCursorPos(null);
  };

  // 120px circular radius flashlight reveal
  const xrayClipPath =
    isHovering && cursorPos
      ? `circle(120px at ${cursorPos.x}px ${cursorPos.y}px)`
      : `circle(90px at 50% 50%)`;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-600" />
            <span>Grad-CAM Heatmap Localization</span>
          </h3>
          {heatmapFilename && (
            <span className="font-mono text-[11px] text-slate-500 block mt-0.5">
              Generated file: {heatmapFilename}
            </span>
          )}
        </div>

        {/* View Controls Toolbar */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setMode("xray")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              mode === "xray"
                ? "bg-white text-cyan-700 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="120px circular X-Ray cursor flashlight"
          >
            <Zap className="h-3 w-3" />
            <span>X-Ray Flashlight</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("side-by-side")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              mode === "side-by-side"
                ? "bg-white text-cyan-700 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Side-by-side comparison"
          >
            <Columns className="h-3 w-3" />
            <span className="hidden sm:inline">Side-by-Side</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("gradcam")}
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg transition ${
              mode === "gradcam"
                ? "bg-white text-cyan-700 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Full Grad-CAM overlay"
          >
            <Eye className="h-3 w-3" />
            <span className="hidden sm:inline">Overlay</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("raw")}
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg transition ${
              mode === "raw"
                ? "bg-white text-cyan-700 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Raw MRI input scan"
          >
            <Maximize2 className="h-3 w-3" />
            <span className="hidden sm:inline">Raw</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCrosshairs(!showCrosshairs)}
            className={`p-1.5 rounded-lg transition text-xs ${
              showCrosshairs
                ? "text-cyan-700 bg-cyan-50 border border-cyan-200"
                : "text-slate-400 hover:text-slate-700"
            }`}
            title="Toggle Inspection Crosshairs"
          >
            <Crosshair className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Visualizer Stage */}
      <div className="relative">
        {mode === "xray" && (
          <div className="flex flex-col items-center">
            {/* Interactive Flashlight Plate */}
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full max-w-[380px] aspect-square rounded-xl border border-slate-300 bg-black p-1 overflow-hidden shadow-md cursor-crosshair select-none"
            >
              {/* Base Layer: Raw MRI Scan */}
              <img
                src={rawImage}
                alt="Raw MRI Input Scan"
                className="w-full h-full object-contain rounded-lg select-none pointer-events-none"
              />

              {/* Overlaid Layer: Grad-CAM Heatmap revealed within 120px circular radius */}
              <img
                src={effectiveGradCam}
                alt={`Grad-CAM Heatmap for ${prediction}`}
                style={{
                  clipPath: xrayClipPath,
                  WebkitClipPath: xrayClipPath,
                }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
                className="absolute inset-0 m-auto w-full h-full object-contain rounded-lg select-none pointer-events-none transition-[clip-path] duration-75"
              />

              {/* Glowing X-Ray Flashlight Ring following cursor */}
              {isHovering && cursorPos && (
                <div
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-transform duration-75 flex items-center justify-center"
                  style={{
                    left: `${cursorPos.x}px`,
                    top: `${cursorPos.y}px`,
                    width: "240px",
                    height: "240px",
                  }}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                </div>
              )}

              {/* Optional Static Crosshairs */}
              {showCrosshairs && !isHovering && (
                <div className="pointer-events-none absolute inset-0 border border-cyan-500/20">
                  <div className="absolute inset-x-0 top-1/2 border-t border-cyan-500/30 border-dashed" />
                  <div className="absolute inset-y-0 left-1/2 border-l border-cyan-500/30 border-dashed" />
                </div>
              )}
            </div>

            <p className="mt-2 text-xs text-slate-500 text-center">
              Move cursor over the scan to reveal the 120px Grad-CAM salience heatmap.
            </p>
          </div>
        )}

        {mode === "side-by-side" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Raw MRI Scan */}
            <div className="relative rounded-xl border border-slate-200 bg-slate-950 p-2 flex flex-col items-center overflow-hidden shadow-sm">
              <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-black/80 border border-slate-700 text-[10px] font-mono text-slate-200">
                Original MRI (T1-Gd)
              </span>
              <div className="relative overflow-hidden rounded-lg aspect-square w-full max-w-[220px] flex items-center justify-center">
                <img
                  src={rawImage}
                  alt="Raw MRI Input Scan"
                  className="object-contain w-full h-full"
                />
                {showCrosshairs && (
                  <div className="pointer-events-none absolute inset-0 border border-cyan-500/20">
                    <div className="absolute inset-x-0 top-1/2 border-t border-cyan-500/30 border-dashed" />
                    <div className="absolute inset-y-0 left-1/2 border-l border-cyan-500/30 border-dashed" />
                  </div>
                )}
              </div>
            </div>

            {/* Grad-CAM Heatmap */}
            <div className="relative rounded-xl border border-slate-200 bg-slate-950 p-2 flex flex-col items-center overflow-hidden shadow-sm">
              <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-700 text-[10px] font-mono text-cyan-300">
                Grad-CAM Overlay
              </span>
              <div className="relative overflow-hidden rounded-lg aspect-square w-full max-w-[220px] flex items-center justify-center">
                <img
                  src={effectiveGradCam}
                  alt={`Grad-CAM Heatmap for ${prediction}`}
                  className="object-contain w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                {showCrosshairs && (
                  <div className="pointer-events-none absolute inset-0 border border-cyan-500/20">
                    <div className="absolute inset-x-0 top-1/2 border-t border-cyan-500/30 border-dashed" />
                    <div className="absolute inset-y-0 left-1/2 border-l border-cyan-500/30 border-dashed" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {mode === "raw" && (
          <div className="relative rounded-xl border border-slate-200 bg-slate-950 p-3 flex flex-col items-center">
            <div className="relative overflow-hidden rounded-lg aspect-square w-full max-w-[320px] flex items-center justify-center">
              <img
                src={rawImage}
                alt="Raw MRI Input Scan"
                className="object-contain w-full h-full max-h-72"
              />
              {showCrosshairs && (
                <div className="pointer-events-none absolute inset-0 border border-cyan-500/20">
                  <div className="absolute inset-x-0 top-1/2 border-t border-cyan-500/30 border-dashed" />
                  <div className="absolute inset-y-0 left-1/2 border-l border-cyan-500/30 border-dashed" />
                </div>
              )}
            </div>
          </div>
        )}

        {mode === "gradcam" && (
          <div className="relative rounded-xl border border-slate-200 bg-slate-950 p-3 flex flex-col items-center">
            <div className="relative overflow-hidden rounded-lg aspect-square w-full max-w-[320px] flex items-center justify-center">
              <img
                src={effectiveGradCam}
                alt={`Grad-CAM Heatmap for ${prediction}`}
                className="object-contain w-full h-full max-h-72"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              {showCrosshairs && (
                <div className="pointer-events-none absolute inset-0 border border-cyan-500/20">
                  <div className="absolute inset-x-0 top-1/2 border-t border-cyan-500/30 border-dashed" />
                  <div className="absolute inset-y-0 left-1/2 border-l border-cyan-500/30 border-dashed" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Heatmap Spectrum Legend */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Baseline (0.0)</span>
        <div className="h-1.5 w-32 sm:w-40 rounded-full bg-gradient-to-r from-blue-700 via-cyan-400 via-yellow-400 to-red-600" />
        <span>Focal Peak (1.0)</span>
      </div>
    </div>
  );
}
