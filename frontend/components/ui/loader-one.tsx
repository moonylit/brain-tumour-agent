"use client";

import React from "react";
import { motion } from "framer-motion";

export interface LoaderOneProps {
  message?: string;
  subMessage?: string;
  className?: string;
}

export function LoaderOne({
  message = "Processing MRI Scan...",
  subMessage = "Executing ResNet-50 inference & Grad-CAM localization...",
  className = "",
}: LoaderOneProps) {
  return (
    <div
      className={`absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/65 backdrop-blur-md rounded-xl p-6 text-white select-none ${className}`}
    >
      {/* Concentric Rotating Radar Rings */}
      <div className="relative flex items-center justify-center h-28 w-28 mb-5">
        {/* Outermost Pulsing Ring */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full border border-cyan-400/50"
        />

        {/* Outer Clockwise Spinning Arc */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-2 rounded-full border-2 border-transparent border-t-cyan-400 border-r-blue-500"
        />

        {/* Counter-Clockwise Inner Arc */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-5 rounded-full border-2 border-transparent border-b-indigo-400 border-l-cyan-300"
        />

        {/* Core Pulsing Glowing Orb */}
        <motion.div
          animate={{
            scale: [0.85, 1.15, 0.85],
            boxShadow: [
              "0 0 10px rgba(6,182,212,0.5)",
              "0 0 25px rgba(6,182,212,0.9)",
              "0 0 10px rgba(6,182,212,0.5)",
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-7 w-7 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 flex items-center justify-center"
        >
          <div className="h-2 w-2 rounded-full bg-white animate-ping" />
        </motion.div>
      </div>

      {/* Status Typography */}
      <motion.p
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="text-base font-bold text-white tracking-wide text-center"
      >
        {message}
      </motion.p>
      {subMessage && (
        <p className="text-xs font-mono text-cyan-300/90 text-center mt-1.5 max-w-xs">
          {subMessage}
        </p>
      )}

      {/* Subtle Progress Bar Indicator */}
      <div className="w-48 h-1 bg-slate-800 rounded-full mt-4 overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        />
      </div>
    </div>
  );
}

export default LoaderOne;
