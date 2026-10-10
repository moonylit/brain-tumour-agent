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
              {(activeDemoPatient === "Eleanor Vance" || activeDemoPatient === "Marcus Brody") && (
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
        {/* 6. Vertical System Architecture Pipeline / Features */}
        <section id="features" className="w-full">
          <span id="pipeline" className="sr-only">Pipeline</span>
          <div className="w-full max-w-5xl mx-auto py-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Diagnostic Data Pipeline
              </h2>
              <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
                A transparent, three-stage computational workflow from raw MRI ingestion to actionable clinical routing.
              </p>
            </div>

            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-blue-500 before:via-purple-500 before:to-emerald-500 before:opacity-30">
              
              {/* Stage 1: ResNet-50 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-white bg-blue-600 text-white shadow-xl shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <div className="w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-100 rounded-md">Stage 01</span>
                    <span className="px-2.5 py-1 text-[10px] font-mono font-bold text-slate-500 bg-slate-100 rounded-md">FastAPI + Keras</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Primary Vision Engine</h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Raw MRI scans undergo OpenCV contour-based skull-stripping before processing through a fine-tuned ResNet-50 v2 convolutional network.
                  </p>
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-slate-700">Validation Accuracy: <span className="text-blue-600 font-black">98.09%</span></span>
                  </div>
                </div>
              </div>

              {/* Stage 2: Grad-CAM */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-white bg-purple-600 text-white shadow-xl shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
                <div className="w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-100 rounded-md">Stage 02</span>
                    <span className="px-2.5 py-1 text-[10px] font-mono font-bold text-slate-500 bg-slate-100 rounded-md">Explainable AI (XAI)</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Spatial Heatmap Localization</h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Eliminating the &quot;black box&quot; by extracting feature maps from the final convolutional layer. Gradients are calculated to highlight the exact anatomical pathology.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                     <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 text-center">
                       <span className="block text-[10px] font-bold text-slate-400 uppercase">Input</span>
                       <span className="block text-xs font-bold text-slate-700">Convolutional Weights</span>
                     </div>
                     <div className="px-3 py-2 bg-purple-50 rounded-lg border border-purple-100 text-center">
                       <span className="block text-[10px] font-bold text-purple-400 uppercase">Output</span>
                       <span className="block text-xs font-bold text-purple-700">Grad-CAM Overlay</span>
                     </div>
                  </div>
                </div>
              </div>

              {/* Stage 3: SerpApi */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-white bg-emerald-500 text-white shadow-xl shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 rounded-md">Stage 03</span>
                    <span className="px-2.5 py-1 text-[10px] font-mono font-bold text-slate-500 bg-slate-100 rounded-md">SerpApi + Geospatial</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Automated Referral Routing</h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Upon high-confidence mass detection, SerpApi agents dynamically scrape regional facility data to route the patient to the nearest specialized neurotrauma center.
                  </p>
                  <div className="flex items-center gap-3">
                     <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold">H</div>
                        <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-[8px] font-bold">H</div>
                     </div>
                     <span className="text-xs font-bold text-emerald-600">Dynamic Facility Fetching</span>
                  </div>
                </div>
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

        <div className="flex items-center justify-center gap-3 mt-12 opacity-85 hover:opacity-100 transition-opacity">
          <span className="text-[11px] font-black text-slate-400 tracking-[0.2em] uppercase">Powered By</span>

          {/* Antigravity: Ensure the src path maps correctly to the user's uploaded SerpApi logo image */}
          <img 
            src="/serpapi-logo.png" /* Update this path to match the pasted image asset */
            alt="SerpApi Logo" 
            className="h-8 object-contain drop-shadow-sm" 
          />
        </div>
      </footer>
    </main>
  );
}