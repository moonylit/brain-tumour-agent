"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const GlareCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const isPointerInside = useRef(false);
  const refElement = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({
    glare: {
      x: 50,
      y: 50,
      opacity: 0,
    },
    rotate: {
      x: 0,
      y: 0,
    },
  });

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rotateFactor = 0.4;
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    const percentage = {
      x: (100 / rect.width) * position.x,
      y: (100 / rect.height) * position.y,
    };
    const delta = {
      x: percentage.x - 50,
      y: percentage.y - 50,
    };

    const { x: degX, y: degY } = {
      x: (delta.y / 2) * rotateFactor,
      y: -(delta.x / 2) * rotateFactor,
    };

    setState({
      glare: {
        x: percentage.x,
        y: percentage.y,
        opacity: 0.75,
      },
      rotate: {
        x: degX,
        y: degY,
      },
    });
  };

  const handlePointerEnter = () => {
    isPointerInside.current = true;
  };

  const handlePointerLeave = () => {
    isPointerInside.current = false;
    setState({
      glare: {
        x: 50,
        y: 50,
        opacity: 0,
      },
      rotate: {
        x: 0,
        y: 0,
      },
    });
  };

  return (
    <div
      style={{
        perspective: "800px",
      }}
      className="w-full"
    >
      <div
        ref={refElement}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        style={{
          transform: `rotateX(${state.rotate.x}deg) rotateY(${state.rotate.y}deg)`,
          transition: isPointerInside.current ? "transform 0.08s ease-out" : "transform 0.5s ease-out",
        }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50 to-blue-50/50 p-6 shadow-xl shadow-slate-200/50 transition-shadow hover:shadow-2xl hover:shadow-blue-200/40 will-change-transform",
          className
        )}
      >
        {/* Dynamic Light Sheen Glare Reflection */}
        <div
          className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay transition-opacity duration-300"
          style={{
            opacity: state.glare.opacity,
            background: `radial-gradient(circle 320px at ${state.glare.x}% ${state.glare.y}%, rgba(255, 255, 255, 0.9), rgba(59, 130, 246, 0.25) 40%, transparent 80%)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 w-full">{children}</div>
      </div>
    </div>
  );
};
