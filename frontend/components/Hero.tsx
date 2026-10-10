"use client";

import React, { useState, useEffect } from "react";

export default function Hero() {
  const fullText = "AI-Powered Brain Tumor Diagnostics";
  const [typedText, setTypedText] = useState('');
  const [showSubtitle, setShowSubtitle] = useState(false);

  useEffect(() => {
    let currentText = '';
    let i = 0;
    // SLOWER TYPING SPEED (90ms instead of 50ms)
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        currentText += fullText.charAt(i);
        setTypedText(currentText);
        i++;
      } else {
        clearInterval(typingInterval);
        // Trigger subtitle animation exactly 300ms after typing finishes
        setTimeout(() => setShowSubtitle(true), 300);
      }
    }, 90); 

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
      {/* Enterprise Clinical Status Badge */}
      <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-slate-50 border border-slate-200 rounded-full shadow-sm mb-8 hover:shadow-md transition-shadow cursor-default">
        {/* Live Pulsing Indicator */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>

        {/* Core Value Proposition */}
        <span className="text-sm font-extrabold text-slate-800 tracking-wide uppercase">
          Autonomous Classification & Grad-CAM Segmentation
        </span>

        {/* Divider */}
        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>

        {/* Tech Stack Highlight */}
        <span className="text-xs font-black text-blue-600 tracking-widest uppercase">
          ResNet-50 Pipeline
        </span>
      </div>

      {/* Main Heading */}
      <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-8 min-h-[4.5rem]">
        {typedText.includes("Brain Tumor") ? (
          <>
            {typedText.split("Brain Tumor")[0]}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Brain Tumor
            </span>
            {typedText.split("Brain Tumor")[1]}
          </>
        ) : (
          typedText
        )}
        <span className="animate-pulse text-blue-500 font-light ml-1">|</span>
      </h1>

      {/* Subtitle */}
      <div className="text-lg md:text-xl font-medium max-w-2xl mx-auto flex flex-wrap justify-center gap-x-1.5 overflow-hidden min-h-[4rem]">
        {showSubtitle && "Upload an MRI scan for instant analysis. CerebrAI detects the anomaly, classifies the tumor type, and generates visual heatmaps to explain the results."
          .split(' ')
          .map((word, index) => (
            <span
              key={index}
              className="inline-block text-slate-600 opacity-0 animate-[dropIn_0.4s_ease-out_forwards]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {word}
            </span>
          ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
        <a
          href="#upload"
          className="btn-primary inline-flex items-center justify-center gap-3 px-10 py-5 text-xl font-bold rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <svg
            className="h-6 w-6 text-cyan-200"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Analyze MRI Scan</span>
        </a>

        <a
          href="#evaluation"
          className="inline-flex items-center justify-center gap-3 px-10 py-5 text-xl font-bold rounded-2xl text-slate-800 bg-white/95 border-2 border-blue-200/80 hover:bg-blue-50/80 hover:border-blue-400 hover:text-blue-900 shadow-lg shadow-blue-900/5 transition-all hover:scale-105 active:scale-95"
        >
          <svg
            className="h-6 w-6 text-indigo-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <span>Model Benchmarks</span>
        </a>
      </div>

      <style>{`
        @keyframes dropIn {
          0% { opacity: 0; transform: translateY(-20px) scale(0.9); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
      `}</style>
    </section>
  );
}