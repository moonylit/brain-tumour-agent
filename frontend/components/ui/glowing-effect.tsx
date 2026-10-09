"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface GlowingEffectProps {
  children: React.ReactNode;
  className?: string;
  glowClassName?: string;
  glow?: boolean;
}

export const GlowingEffect = ({
  children,
  className,
  glowClassName,
  glow = true,
}: GlowingEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative rounded-2xl p-[1.5px] overflow-hidden group transition-all duration-300", className)}
    >
      {/* Background Animated Glowing Ambient Border */}
      {glow && (
        <>
          {/* Subtle Ambient Gradient Border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/40 via-cyan-400/30 to-violet-400/40 pointer-events-none" />

          {/* Mouse-Driven Highlight Glow */}
          {mousePos && (
            <div
              className={cn(
                "pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm",
                glowClassName
              )}
              style={{
                background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.45), rgba(139, 92, 246, 0.25), transparent 70%)`,
              }}
            />
          )}
        </>
      )}

      {/* Internal Content Container */}
      <div className="relative w-full h-full rounded-2xl bg-white overflow-hidden shadow-sm">
        {children}
      </div>
    </div>
  );
};
