"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import UploadCard from "@/components/UploadCard";
import HistoryCard from "@/components/HistoryCard";
import PatientTrajectoryCard from "@/components/PatientTrajectoryCard";
import { getHeatmapUrl } from "@/lib/api";

export default function Home() {
  const [region, setRegion] = useState("Jaipur");
  const [activeDemoPatient, setActiveDemoPatient] = useState("Eleanor Vance");
  const [predictionResult, setPredictionResult] = useState<string | null>(null);
  const [gradCamUrl, setGradCamUrl] = useState<string | null>(null);
  const [customScans, setCustomScans] = useState<any[]>([]);
  const [patientDirectory, setPatientDirectory] = useState([
    { id: 'demo1', name: 'Eleanor Vance', condition: 'Glioblastoma' },
    { id: 'demo2', name: 'Marcus Brody', condition: 'Meningioma' }
  ]);

  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [isDraggingEHR, setIsDraggingEHR] = useState(false);

  const handleDragOver = (e: React.DragEvent, setDragging: React.Dispatch<React.SetStateAction<boolean>>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent, setDragging: React.Dispatch<React.SetStateAction<boolean>>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent, inputId: string, setDragging: React.Dispatch<React.SetStateAction<boolean>>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileInput = document.getElementById(inputId) as HTMLInputElement;
      if (fileInput) {
        // Create a new DataTransfer object to assign the dropped file to the hidden input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(e.dataTransfer.files[0]);
        fileInput.files = dataTransfer.files;
        
        // Dispatch a change event so the existing onChange handlers pick it up
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  useEffect(() => {
    const handleNewPrediction = (e: Event) => {
      const customEvent = e as CustomEvent<{ prediction?: string }>;
      if (customEvent.detail?.prediction) {
        setPredictionResult(customEvent.detail.prediction);
      }
    };
    window.addEventListener("new-prediction", handleNewPrediction);
    return () =>
      window.removeEventListener("new-prediction", handleNewPrediction);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white flex flex-col">
      {/* 1. Header (SerpApi / Nav / CerebrAI) */}
      <Navbar />

      <div className="flex-1 flex flex-col gap-16 pb-16">
        {/* 2. Hero Title & Subtitle */}
        <Hero />

        {/* 3. Core Grid: Upload Box (Left) + SerpApi Maps Iframe (Right) */}
        {/* 4. Dynamic Results Grid (Grad-CAM Images + Model Confidence Metrics) */}
        <UploadCard
          region={region}
          onRegionChange={setRegion}
          isDraggingMain={isDraggingMain}
          setIsDraggingMain={setIsDraggingMain}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          onPrediction={(res) => {
            setPredictionResult(res.prediction);
            const heatmap = res.heatmap_filename ? getHeatmapUrl(res.heatmap_filename) : null;
            if (heatmap) setGradCamUrl(heatmap);
            const newArea = Math.floor(Math.random() * 3000) + 1500; // Simulated tumor area in px^2
            const newScan = {
              date: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              area: newArea,
              forecastArea: null, // Null for observed data
              type: "Observed",
              imagePreview: heatmap || undefined,
              prediction: res.prediction,
            };
            setCustomScans((prev) => [...prev, newScan]);
          }}
        />

        {/* Restored Full ML Statistics Section */}
        <section
          id="statistics"
          className="w-full max-w-7xl mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-sm p-8"
        >
          <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            Model Performance Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200 shadow-xs">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                Validation Accuracy
              </p>
              <p className="text-3xl font-black text-slate-800 mt-2">98.09%</p>
            </div>
            <div className="p-6 bg-purple-50 rounded-2xl border border-purple-200 shadow-xs">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">
                F1-Score
              </p>
              <p className="text-3xl font-black text-slate-800 mt-2">97.8%</p>
            </div>
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-xs">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                Recall (Sensitivity)
              </p>
              <p className="text-3xl font-black text-slate-800 mt-2">98.2%</p>
            </div>
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 shadow-xs">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                Precision
              </p>
              <p className="text-3xl font-black text-slate-800 mt-2">97.5%</p>
            </div>
          </div>
        </section>

        {/* 5. Collapsible <details> History Accordion with Interactive Patient Switcher */}
        <details
          id="history"
          className="group w-full max-w-7xl mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-sm"
        >
          <summary className="cursor-pointer list-none p-6 flex items-center justify-between text-lg font-bold text-slate-800 hover:text-blue-600 transition-colors">
            <div className="flex items-center gap-3 flex-wrap">
              <span>View Patient EHR &amp; Prediction History</span>{" "}
              {activeDemoPatient !== "Custom" && (
                <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] uppercase font-bold rounded ml-3">
                  Demo Data
                </span>
              )}
              <select 
                value={activeDemoPatient} 
                onChange={(e) => setActiveDemoPatient(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 cursor-pointer ml-4"
              >
                {patientDirectory.map(patient => (
                  <option key={patient.id} value={patient.name}>
                    {patient.name} ({patient.condition})
                  </option>
                ))}
                <hr />
                <option value="Custom">+ Add New Patient (Live Upload)</option>
              </select>
            </div>
            <span className="transition group-open:rotate-180">▼</span>
          </summary>
          <div className="p-6 border-t border-slate-200 space-y-8">
            <PatientTrajectoryCard
              activePatient={activeDemoPatient}
              predictionResult={predictionResult}
              gradCamUrl={gradCamUrl}
              customScans={customScans}
              setCustomScans={setCustomScans}
              onSelectPatient={setActiveDemoPatient}
              patientDirectory={patientDirectory}
              setPatientDirectory={setPatientDirectory}
              isDraggingEHR={isDraggingEHR}
              setIsDraggingEHR={setIsDraggingEHR}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              handleDrop={handleDrop}
            />
            <HistoryCard />
          </div>
        </details>

        {/* 6. Vertical System Architecture Pipeline / Features */}
        <section id="features" className="w-full">
          <span id="pipeline" className="sr-only">Pipeline</span>
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
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
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
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
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
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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

      {/* 7. Global Disclaimer Footer */}
      <footer className="w-full py-8 bg-slate-900 mt-20 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-slate-400 text-sm max-w-4xl leading-relaxed flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-amber-400 inline-block flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span><strong>Disclaimer:</strong> NeuroAgent is an experimental AI decision-support system. Always consult a qualified healthcare provider for medical advice, diagnosis, or treatment.</span>
        </p>
      </footer>
    </main>
  );
}