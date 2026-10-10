"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import UploadCard from "@/components/UploadCard";
import HistoryCard from "@/components/HistoryCard";

export default function Home() {
  const [region, setRegion] = useState("Jaipur");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white flex flex-col">
      {/* 1. Header (SerpApi / Nav / BrainTumourAI) */}
      <Navbar />

      <div className="flex-1 flex flex-col gap-16 pb-16">
        {/* 2. Hero Title & Subtitle */}
        <Hero />

        {/* 3. Core Grid: Upload Box (Left) + SerpApi Maps Iframe (Right) */}
        {/* 4. Dynamic Results Grid (Grad-CAM Images + Model Confidence Metrics) */}
        <UploadCard region={region} onRegionChange={setRegion} />

        {/* 5. Collapsible <details> History Accordion */}
        <details
          id="history"
          className="group w-full max-w-7xl mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-sm"
        >
          <summary className="cursor-pointer list-none p-6 flex items-center justify-between text-lg font-bold text-slate-800 hover:text-blue-600 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span> View Patient EHR &amp; Prediction History
            </div>
            <span className="transition group-open:rotate-180">▼</span>
          </summary>
          <div className="p-6 border-t border-slate-200">
            <HistoryCard />
          </div>
        </details>

        {/* 6. Vertical System Architecture Pipeline */}
        <section id="pipeline" className="w-full">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4 text-center">
            System Architecture &amp; Pipeline
          </h2>
          <p className="text-lg text-slate-600 text-center max-w-2xl mx-auto mb-12">
            A transparent breakdown of the data flow and machine learning models powering the NeuroAgent engine.
          </p>

          <div className="relative flex flex-col gap-8 max-w-4xl mx-auto px-4">
            <div className="absolute left-8 md:left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 via-purple-200 to-emerald-200"></div>

            {/* Step 1: Classification Engine */}
            <div className="relative z-10 bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-500/30">
                01
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="text-xl font-bold text-slate-800">
                    ResNet-50 Deep Learning Model
                  </h3>
                  <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold tracking-wide">
                    FastAPI + Keras
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed mt-2">
                  The core vision engine is a ResNet-50 v2 convolutional neural network. It processes the MRI through an OpenCV contour-based skull-stripping pipeline, delivering 98.09% validation accuracy across multiple merged datasets.
                </p>
              </div>
            </div>

            {/* Step 2: Explainability */}
            <div className="relative z-10 bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-purple-500/30">
                02
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="text-xl font-bold text-slate-800">
                    Gradient-Weighted Activation Maps
                  </h3>
                  <span className="px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold tracking-wide">
                    Grad-CAM
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed mt-2">
                  To prevent the &quot;black box&quot; problem, the system extracts feature maps from the final convolutional layer. It calculates the gradients for the predicted class to highlight the exact anatomical pixels driving the tumor classification.
                </p>
              </div>
            </div>

            {/* Step 3: Autonomous Routing */}
            <div className="relative z-10 bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-emerald-500/30">
                03
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="text-xl font-bold text-slate-800">
                    Geospatial Decision Agent
                  </h3>
                  <span className="px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold tracking-wide">
                    SerpApi + Google Maps
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed mt-2">
                  Once a high-confidence mass is detected, the dashboard triggers SerpApi web search agents to autonomously scrape regional medical data, mapping the fastest route to the nearest tertiary neurotrauma center.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 7. Footer */}
      <footer className="w-full py-8 text-center text-slate-500 text-sm mt-12 border-t border-slate-200">
        Built for Autonomous Clinical Triage
      </footer>
    </main>
  );
}