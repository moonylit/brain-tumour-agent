"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import UploadCard from "@/components/UploadCard";
import EvaluationCard from "@/components/EvaluationCard";
import Features from "@/components/Features";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";

export default function Home() {
  const [region, setRegion] = useState("Jaipur");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col space-y-12 pb-16">
        <Hero />
        <UploadCard region={region} onRegionChange={setRegion} />
        <EvaluationCard />
        <Features />
        <Stats />

        {/* System Architecture & Pipeline */}
        <section id="pipeline" className="w-full">
          <h2 className="text-3xl font-extrabold text-slate-900 mt-24 mb-4 text-center">
            System Architecture &amp; Pipeline
          </h2>
          <p className="text-lg text-slate-600 text-center max-w-2xl mx-auto mb-12">
            A transparent breakdown of the data flow and machine learning models powering the NeuroAgent engine.
          </p>

          <div className="flex flex-col gap-8 max-w-4xl mx-auto px-4 mb-24">
            {/* Step 1: Classification Engine */}
            <div className="bg-white/40 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 font-black text-xl shadow-xs">
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
            <div className="bg-white/40 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 font-black text-xl shadow-xs">
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
            <div className="bg-white/40 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-black text-xl shadow-xs">
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
      <Footer />
    </main>
  );
}