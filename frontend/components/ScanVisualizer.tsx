"use client";

import React, { useState, useRef } from "react";
import { Eye, Zap, Columns, UploadCloud, Loader2, RefreshCw } from "lucide-react";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { FileUpload } from "@/components/ui/file-upload";

export interface ScanVisualizerProps {
  rawImage?: string;
  gradCamImage?: string;
  prediction?: string;
  heatmapFilename?: string;
  scanDate?: string;
  tumorAreaPixels?: number;
  confidence?: number;
  showCrosshairsDefault?: boolean;
  onUpload?: (file: File) => void;
  isUploading?: boolean;
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
  onUpload,
  isUploading = false,
}: ScanVisualizerProps) {
  const [mode, setMode] = useState<VisualizerMode>("overlay");
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [showUploadView, setShowUploadView] = useState<boolean>(!rawImage);
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

  const handleFileDrop = (files: File[]) => {
    if (files.length > 0 && onUpload) {
      onUpload(files[0]);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xl shadow-slate-200/50 h-full justify-between">
      {/* Sub-Header Mode Switcher & Re-upload Controls */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-bold text-slate-900">
            2D Axial MRI Analysis
          </span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-medium text-slate-600">
            {prediction}
          </span>
        </div>

        {/* Action Controls Array */}
        <div className="flex items-center gap-2">
          {rawImage && (
            <button
              type="button"
              onClick={() => setShowUploadView(!showUploadView)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition"
              title="Toggle Diagnostic Upload View"
            >
              <UploadCloud className="h-3.5 w-3.5 text-cyan-600" />
              <span>{showUploadView ? "View Current MRI" : "Upload MRI"}</span>
            </button>
          )}

          {!showUploadView && (
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs">
              <button
                type="button"
                onClick={() => setMode("overlay")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mode === "overlay"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Overlay</span>
              </button>

              <button
                type="button"
                onClick={() => setMode("xray")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mode === "xray"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>X-Ray Flashlight</span>
              </button>

              <button
                type="button"
                onClick={() => setMode("side-by-side")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mode === "side-by-side"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Columns className="h-3.5 w-3.5" />
                <span>Side-by-Side</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Visualizer Stage: Empty State (Canvas Reveal + FileUpload) vs Active State */}
      {showUploadView || !rawImage ? (
        <div className="relative aspect-square w-full max-h-[360px] sm:max-h-[380px] mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-inner my-auto flex items-center justify-center">
          {/* Idle Neural Synaptic Network: Canvas Reveal Effect */}
          <CanvasRevealEffect
            animationSpeed={0.5}
            dotSize={2.5}
            colors={[[37, 99, 235], [6, 182, 212], [99, 102, 241]]}
            containerClassName="absolute inset-0 bg-slate-50"
          />

          {/* Overlaid File Upload Component */}
          <div className="relative z-10 w-full max-w-sm px-4">
            {isUploading ? (
              <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white/90 backdrop-blur-xl border border-cyan-200 shadow-xl">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-600 mb-2" />
                <span className="text-sm font-bold text-slate-900">
                  Executing ResNet-50 Inference
                </span>
                <span className="text-xs font-mono text-cyan-700 mt-1">
                  Generating Grad-CAM localization...
                </span>
              </div>
            ) : (
              <FileUpload onChange={handleFileDrop} />
            )}
          </div>
        </div>
      ) : mode === "side-by-side" ? (
        <div className="grid grid-cols-2 gap-4 w-full my-auto">
          {/* Left: Raw 2D Axial MRI in Grayscale */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider text-center">
              Original Axial MRI (T1-Gd)
            </span>
            <div className="aspect-square w-full rounded-xl bg-black overflow-hidden border border-slate-200 relative flex items-center justify-center shadow-inner">
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
            <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider text-center">
              Grad-CAM Localization
            </span>
            <div className="aspect-square w-full rounded-xl bg-black overflow-hidden border border-slate-200 relative flex items-center justify-center shadow-inner">
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
        /* Single Massive Perfect Square Stage: Overlay or 120px X-Ray Flashlight */
        <div
          ref={containerRef}
          onMouseMove={mode === "xray" ? handleMouseMove : undefined}
          onMouseLeave={mode === "xray" ? handleMouseLeave : undefined}
          className="relative aspect-square w-full max-h-[360px] sm:max-h-[380px] mx-auto rounded-xl bg-black overflow-hidden border border-slate-200 cursor-crosshair select-none flex items-center justify-center shadow-inner my-auto"
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
              className="pointer-events-none absolute h-[240px] w-[240px] rounded-full border border-blue-400/70 shadow-[0_0_16px_rgba(59,130,246,0.4)] transition-transform duration-75"
              style={{
                left: `${cursorPos.x - 120}px`,
                top: `${cursorPos.y - 120}px`,
              }}
            />
          )}
        </div>
      )}

      {/* Sub-metrics: Single Line of Small Monospace Text with Subtle Borders */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border border-slate-200/90 rounded-xl bg-slate-50 text-xs font-mono text-slate-600">
        <span className="font-semibold text-slate-800">
          Scan Date: {scanDate}
        </span>
        <span className="text-slate-300 hidden sm:inline">•</span>
        <span className="font-semibold text-slate-700">
          {formattedArea}
        </span>
        <span className="text-slate-300 hidden sm:inline">•</span>
        <span className="font-bold text-blue-700">
          {formattedConfidence}
        </span>
      </div>
    </div>
  );
}
