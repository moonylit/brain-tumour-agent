"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface CanvasRevealEffectProps {
  animationSpeed?: number;
  opacities?: number[];
  colors?: number[][];
  containerClassName?: string;
  dotSize?: number;
  showGradient?: boolean;
}

export const CanvasRevealEffect = ({
  animationSpeed = 0.4,
  opacities = [0.2, 0.2, 0.4, 0.4, 0.6, 0.8, 1],
  colors = [[59, 130, 246], [6, 182, 212], [99, 102, 241]], // Blue, Cyan, Indigo
  containerClassName,
  dotSize = 2.5,
  showGradient = true,
}: CanvasRevealEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    const spacing = 18;
    let time = 0;

    const render = () => {
      time += animationSpeed * 0.05;
      ctx.clearRect(0, 0, width, height);

      const cols = Math.floor(width / spacing);
      const rows = Math.floor(height / spacing);

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * spacing;
          const y = j * spacing;

          // Synaptic neural matrix pulsing wave
          const wave =
            Math.sin(i * 0.25 + time) * 0.5 +
            Math.cos(j * 0.25 + time * 0.8) * 0.5;

          const colorIndex = (i + j) % colors.length;
          const color = colors[colorIndex];
          const opacityIndex = Math.min(
            Math.floor(Math.abs(wave) * opacities.length),
            opacities.length - 1
          );
          const opacity = opacities[opacityIndex] * 0.75;

          ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
          ctx.beginPath();
          const radius = (dotSize / 2) * (0.8 + Math.abs(wave) * 0.6);
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Connect nearby dots with subtle neural synaptic lines
          if (wave > 0.4 && (i + j) % 3 === 0) {
            ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity * 0.35})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + spacing * 0.7, y + spacing * 0.7);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [animationSpeed, colors, dotSize, opacities]);

  return (
    <div
      className={cn(
        "h-full relative bg-slate-50/90 w-full overflow-hidden rounded-2xl flex items-center justify-center border border-slate-200/90",
        containerClassName
      )}
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full" />
      {showGradient && (
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-50/50 to-slate-50 pointer-events-none" />
      )}
    </div>
  );
};
