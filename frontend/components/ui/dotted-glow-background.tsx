"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface DottedGlowBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  dotColor?: string;
  dotSize?: number;
  gap?: number;
  glowColor?: string;
}

export function DottedGlowBackground({
  children,
  className = "",
  dotColor = "rgba(148, 163, 184, 0.35)",
  dotSize = 1.5,
  gap = 18,
  glowColor = "rgba(99, 102, 241, 0.15)",
}: DottedGlowBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative w-full h-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50",
        className
      )}
    >
      {/* Background SVG Dot Pattern */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-80"
        style={{
          backgroundImage: `radial-gradient(${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${gap}px ${gap}px`,
        }}
      />

      {/* Dynamic Interactive Glow on Mouse Movement */}
      {mousePos && (
        <div
          className="pointer-events-none absolute z-0 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-300"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            background: `radial-gradient(circle, ${glowColor} 0%, rgba(56, 189, 248, 0.08) 40%, transparent 70%)`,
          }}
        />
      )}

      {/* Subtle Default Ambient Corner Glow */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 z-0 h-48 w-48 rounded-full bg-violet-400/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 z-0 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Foreground Content */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
}

export default DottedGlowBackground;
