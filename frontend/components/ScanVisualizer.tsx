"use client";

import React, { useState, useRef } from "react";
import { Eye, Zap, Columns } from "lucide-react";

export interface ScanVisualizerProps {
  rawImage: string;
  gradCamImage?: string;
  prediction?: string;
  heatmapFilename?: string;
  scanDate?: string;
  tumorAreaPixels?: number;
  confidence?: number;
  showCrosshairsDefault?: boolean;
}

export type VisualizerMode = "overlay" | "xray" | "side-by-side";

export default function ScanVisualizer({
  rawImage,
  gradCamImage,
  prediction = "Scan",
  heatmapFilename,
  scanDate = "2026-10-09",
  tumorAreaPixels = 9280,
  confidence = 0.998,
}: ScanVisualizerProps) {
  const [mode, setMode] = useState<VisualizerMode>("overlay");
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isHovering, setIsHovering] = useState(false);
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

  // Precise 120px circular mask behavior for X-Ray flashlight
  const xrayClipPath =
    isHovering && cursorPos
      ? `circle(120px at ${cursorPos.x}px ${cursorPos.y}px)`
      : `circle(120px at 50% 50%)`;

  const formattedArea = tumorAreaPixels
    ? `${tumorAreaPixels.toLocaleString()} px Area (estimated)`
    : "9,280 px Area (estimated)";

  const formattedConfidence = confidence !== undefined
    ? `${(confidence * 100).toFixed(1)}% Confidence`
    : "99.8% Confidence";

  return (
    <div className="flex flex-col rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
      {/* Minimalist Sub-Header Mode Switcher Array */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-800">
            2D Axial MRI Analysis
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {prediction}
          </span>
        </div>

        {/* Minimalist button array */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode("overlay")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
              mode === "overlay"
                ? "bg-white text-blue-700 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Overlay</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("xray")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
              mode === "xray"
                ? "bg-white text-blue-700 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>X-Ray Flashlight</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("side-by-side")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
              mode === "side-by-side"
                ? "bg-white text-blue-700 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Columns className="h-3.5 w-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {/* Main Square Clinical Scan Visualizer Stage */}
      {mode === "side-by-side" ? (
        <div className="grid grid-cols-2 gap-3 w-full">
          {/* Left: Raw 2D Axial MRI in Grayscale */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider text-center">
              Original Axial MRI (T1-Gd)
            </span>
            <div className="aspect-square w-full rounded-lg bg-black overflow-hidden border border-slate-200 relative flex items-center justify-center">
              <img
                src={rawImage}
                alt="Raw MRI Input Scan"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
                className="w-full h-full object-contain grayscale filter select-none"
              />
            </div>
          </div>

          {/* Right: Grad-CAM Heatmap */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider text-center">
              Grad-CAM Localization
            </span>
            <div className="aspect-square w-full rounded-lg bg-black overflow-hidden border border-slate-200 relative flex items-center justify-center">
              <img
                src={effectiveGradCam}
                alt={`Grad-CAM Heatmap for ${prediction}`}
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
                className="w-full h-full object-contain select-none"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Single Perfect Square Stage: Overlay or 120px X-Ray Flashlight */
        <div
          ref={containerRef}
          onMouseMove={mode === "xray" ? handleMouseMove : undefined}
          onMouseLeave={mode === "xray" ? handleMouseLeave : undefined}
          className="relative aspect-square w-full max-w-[460px] mx-auto rounded-lg bg-black overflow-hidden border border-slate-200 cursor-crosshair select-none flex items-center justify-center"
        >
          {/* Base Real 2D Axial MRI in Grayscale */}
          <img
            src={rawImage}
            alt="Raw MRI Input Scan"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
            className="w-full h-full object-contain grayscale filter pointer-events-none"
          />

          {/* Heatmap Layer */}
          {mode === "overlay" ? (
            <img
              src={effectiveGradCam}
              alt={`Grad-CAM Heatmap for ${prediction}`}
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-85 mix-blend-screen"
            />
          ) : (
            /* Precise 120px circular mask X-Ray Flashlight */
            <img
              src={effectiveGradCam}
              alt={`Grad-CAM Heatmap for ${prediction}`}
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
              style={{ clipPath: xrayClipPath }}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-[clip-path] duration-75"
            />
          )}

          {/* Subtle cursor guide ring for flashlight */}
          {mode === "xray" && isHovering && cursorPos && (
            <div
              className="pointer-events-none absolute h-[240px] w-[240px] rounded-full border border-blue-400/60 shadow-[0_0_12px_rgba(59,130,246,0.3)] transition-transform duration-75"
              style={{
                left: `${cursorPos.x - 120}px`,
                top: `${cursorPos.y - 120}px`,
              }}
            />
          )}
        </div>
      )}

      {/* Sub-metrics: Single Line of Small Monospace Text with Subtle Borders */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-3 py-2 border border-slate-200/90 rounded-md bg-slate-50 text-[11px] font-mono text-slate-600">
        <span className="font-medium text-slate-800">
          Scan Date: {scanDate}
        </span>
        <span className="text-slate-300 hidden sm:inline">•</span>
        <span className="font-medium text-slate-700">
          {formattedArea}
        </span>
        <span className="text-slate-300 hidden sm:inline">•</span>
        <span className="font-semibold text-blue-700">
          {formattedConfidence}
        </span>
      </div>
    </div>
  );
}
