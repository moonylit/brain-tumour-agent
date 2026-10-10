"use client";

import { useState, useEffect } from "react";
import {
  predictMRI,
  PredictionResponse,
  formatApiError,
} from "@/lib/api";

import PredictionCard from "./PredictionCard";
import { Upload, Sparkles, AlertTriangle, X } from "lucide-react";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

interface UploadCardProps {
  region?: string;
  onRegionChange?: (region: string) => void;
  onPrediction?: (result: PredictionResponse) => void;
  isDraggingMain?: boolean;
  setIsDraggingMain?: React.Dispatch<React.SetStateAction<boolean>>;
  handleDragOver?: (
    e: React.DragEvent,
    setDragging: React.Dispatch<React.SetStateAction<boolean>>
  ) => void;
  handleDragLeave?: (
    e: React.DragEvent,
    setDragging: React.Dispatch<React.SetStateAction<boolean>>
  ) => void;
  handleDrop?: (
    e: React.DragEvent,
    inputId: string,
    setDragging: React.Dispatch<React.SetStateAction<boolean>>
  ) => void;
}

export default function UploadCard({
  region: propRegion,
  onRegionChange,
  onPrediction,
  isDraggingMain: propIsDraggingMain,
  setIsDraggingMain: propSetIsDraggingMain,
  handleDragOver: propHandleDragOver,
  handleDragLeave: propHandleDragLeave,
  handleDrop: propHandleDrop,
}: UploadCardProps = {}) {
  const [localIsDraggingMain, setLocalIsDraggingMain] = useState(false);
  const isDraggingMain = propIsDraggingMain !== undefined ? propIsDraggingMain : localIsDraggingMain;
  const setIsDraggingMain = propSetIsDraggingMain || setLocalIsDraggingMain;

  const defaultHandleDragOver = (e: React.DragEvent, setDragging: React.Dispatch<React.SetStateAction<boolean>>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const defaultHandleDragLeave = (e: React.DragEvent, setDragging: React.Dispatch<React.SetStateAction<boolean>>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const defaultHandleDrop = (e: React.DragEvent, inputId: string, setDragging: React.Dispatch<React.SetStateAction<boolean>>) => {
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

  const handleDragOver = propHandleDragOver || defaultHandleDragOver;
  const handleDragLeave = propHandleDragLeave || defaultHandleDragLeave;
  const handleDrop = propHandleDrop || defaultHandleDrop;

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [localRegion, setLocalRegion] = useState("Jaipur");
  const region = propRegion !== undefined ? propRegion : localRegion;

  function handleRegionChange(newRegion: string) {
    setLocalRegion(newRegion);
    onRegionChange?.(newRegion);
  }

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [result, setResult] = useState<PredictionResponse | null>(null);

  const [currentLocation, setCurrentLocation] = useState("Detecting your location...");
  const [searchQuery, setSearchQuery] = useState("Neuro Hospital");

  // Attempt to get user's live location on mount
  useEffect(() => {
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Reverse geocoding to get city name (using a free API for demo purposes)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const data = await response.json();
            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.state_district ||
              "Unknown Location";
            setCurrentLocation(city);
            setSearchQuery(`Neuro Hospital in ${city}`);
          } catch (error) {
            setCurrentLocation("Live Location Detected");
          }
        },
        (error) => {
          // Fallback if user blocks location permission
          setCurrentLocation("Location Access Denied - Using Default");
          setSearchQuery("Top Neuro Hospitals");
        }
      );
    }
  }, []);

  function validateFile(file: File): string | null {
    if (!file) {
      return "Please select an MRI image file before predicting.";
    }
    if (file.size === 0) {
      return "The selected image file is empty (0 bytes). Please select a valid MRI image.";
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum allowed limit of 10 MB.`;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Unsupported image format (${file.type || "unknown"}). Only JPG and PNG MRI scans are supported.`;
    }
    return null;
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    setErrorMessage(null);
    const file = event.target.files?.[0];

    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      setSelectedImage(null);
      setPreview(null);
      return;
    }

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setErrorMessage(null);
  }

  async function handleUpload() {
    if (!selectedImage) {
      setErrorMessage("Please select an MRI image file first.");
      return;
    }

    const validationError = validateFile(selectedImage);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      // Send MRI for real model prediction & SerpApi agent research with dynamic region
      const targetRegion = region && region.trim() ? region.trim() : "Jaipur";
      const predictionData =
        targetRegion.toLowerCase() === "jaipur"
          ? await predictMRI(selectedImage)
          : await predictMRI(selectedImage, targetRegion);

      setResult(predictionData);
      onPrediction?.(predictionData);

      // Trigger history & stats refresh
      setRefreshTrigger((prev) => prev + 1);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("new-prediction", { detail: predictionData })
        );
      }
    } catch (error: unknown) {
      console.error("Prediction failed:", error);
      setErrorMessage(formatApiError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="upload" className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-7xl mx-auto my-12 px-4">
        {/* Left Column (Upload Card) */}
        <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col h-full">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4 flex items-center gap-3">
                <Upload className="h-8 w-8 text-blue-600" />
                <span>Upload MRI Scan</span>
              </h2>
              <div className="mx-auto inline-flex items-center gap-3 px-5 py-2.5 bg-blue-50/50 rounded-full shadow-sm border border-blue-200 mb-8 hover:bg-blue-100/50 hover:border-blue-300 transition-all cursor-default whitespace-nowrap">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </div>
                <span className="text-sm font-bold text-slate-500 tracking-wider uppercase">Track 01</span>
                <span className="text-slate-300 font-light text-lg">/</span>
                <span className="text-sm font-black text-blue-600 tracking-widest uppercase">
                  SerpApi Decision Agent
                </span>
              </div>
            </div>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-8">
              Select a brain MRI image (JPG or PNG, max 10MB) for tumour classification, Grad-CAM explainability localization, and autonomous SerpApi clinical literature and regional hospital discovery.
            </p>

            {/* Massive Upload Dropzone */}
            <div 
              onDragOver={(e) => handleDragOver(e, setIsDraggingMain)}
              onDragLeave={(e) => handleDragLeave(e, setIsDraggingMain)}
              onDrop={(e) => handleDrop(e, 'main-mri-upload', setIsDraggingMain)}
              className={`w-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed rounded-3xl transition-all p-10 ${
                isDraggingMain ? 'border-blue-600 bg-blue-100 shadow-inner' : 'border-blue-300 bg-blue-50/40 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-blue-200 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25">
                <Upload className="h-7 w-7 text-white" />
              </div>

              <label htmlFor="main-mri-upload" className="cursor-pointer">
                <p className="text-xl font-bold text-slate-800 mb-2 text-center">
                  Browse neuroimaging file or select from local directory
                </p>
              </label>

              <button
                type="button"
                onClick={() => (document.getElementById("main-mri-upload") || document.getElementById("mri-upload-input"))?.click()}
                className="mt-6 px-10 py-4 bg-blue-600 text-white text-base font-bold uppercase tracking-wider rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Choose File
              </button>

              <input
                type="file"
                id="main-mri-upload"
                accept="image/jpeg,image/png"
                onChange={handleImageChange}
                className="hidden"
              />

              <p className="mt-4 text-xs font-mono font-medium text-slate-500">
                Supported formats: JPG, PNG • Max size: 10 MB
              </p>
            </div>
          </div>

          {/* Error Notification Banner */}
          {errorMessage && (
            <div className="flex items-start gap-3 rounded-2xl border-2 border-rose-300 bg-rose-50/90 p-4 text-rose-800 shadow-md mt-6">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <div className="flex-1 text-sm sm:text-base">
                <strong className="block font-bold text-rose-900">
                  Action Required
                </strong>
                <span className="text-rose-800">{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                aria-label="Dismiss error"
                className="rounded-xl p-1 text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Selected Image Preview & Action Button */}
          {preview && (
            <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-md p-5 shadow-inner mt-6">
              <div className="flex items-center justify-between mb-3 border-b border-blue-200/60 pb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                  Selected Scan
                </span>
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                  Ready for Analysis
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative overflow-hidden rounded-xl border border-slate-300 bg-black/90 p-2 shadow-sm">
                  <img
                    src={preview}
                    alt="MRI Preview"
                    className="max-h-[220px] rounded-lg object-contain mx-auto"
                  />
                </div>

                <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1 font-mono text-xs text-slate-700 border border-slate-200 shadow-2xs">
                  <span className="font-bold text-slate-900 truncate max-w-[150px]">
                    {selectedImage?.name}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600">
                    {((selectedImage?.size || 0) / 1024).toFixed(1)} KB
                  </span>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="btn-primary mt-5 w-full inline-flex items-center justify-center gap-3 px-6 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="inline-block h-5 w-5 animate-spin rounded-full border-3 border-white border-r-transparent" />
                      <span>Analyzing Brain MRI &amp; Querying SerpApi...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 text-cyan-200" />
                      <span>Analyze MRI Scan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (SerpApi Geographic Referral Routing) */}
        <div className="w-full max-w-5xl mx-auto bg-white p-8 md:p-12 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col h-full">
          {/* Heading Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Geographic Referral Routing</h2>
            </div>
            <p className="text-slate-600 font-medium text-lg">
              Target metropolitan region for autonomous hospital geolocation and tertiary surgical center referral routing:
            </p>
          </div>

          {/* The Interactive Dynamic Map */}
          <div className="w-full h-80 bg-slate-100 rounded-t-2xl border-t border-x border-slate-200 overflow-hidden relative shadow-sm">
            {/* Loading overlay while detecting location */}
            {currentLocation === "Detecting your location..." && (
              <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <span className="text-sm font-bold text-slate-700 animate-pulse">Triangulating Coordinator...</span>
              </div>
            )}

            {/* Live Google Maps Embed - Dynamically updates based on browser location */}
            <iframe 
              title="Dynamic Hospital Map"
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              loading="lazy" 
              allowFullScreen 
              src={`https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&t=m&z=12&output=embed&iwloc=near`}
            ></iframe>
          </div>

          {/* The Routing List */}
          <div className="w-full bg-white rounded-b-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Nearest Specialized Centers</h3>
              </div>

              {/* Dynamic Location Display */}
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Routing from: <span className="text-slate-800 font-bold">{currentLocation}</span>
              </span>
            </div>

            <div className="divide-y divide-slate-100">

              {/* Dynamic Hospital Entry (Mocked data, but uses dynamic location context) */}
              <div className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Primary Regional Neuro-Trauma Center</h4>
                  <p className="text-sm text-slate-500 mt-1">{currentLocation} • Neurology Specialization</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      ~Est. 20 mins
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200" title="Call Hospital">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </button>
                  <a href={`https://maps.google.com/?q=Neuro+Hospital+near+${currentLocation}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-md">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Navigate
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Prediction Results Display */}
      <div className="max-w-7xl mx-auto mt-10 px-4">
        {result ? (
          <PredictionCard
            prediction={result.prediction}
            confidence={result.confidence}
            probabilities={result.probabilities}
            processingTime={result.processing_time_ms}
            heatmapFilename={result.heatmap_filename}
            rawHeatmapFilename={result.raw_heatmap_filename}
            region={result.region || region}
            accessionId={result.accession_id}
            agentResearch={result.agent_research}
          />
        ) : (
          <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
            Awaiting neuro-imaging upload for ResNet-50 analysis...
          </div>
        )}
      </div>
    </section>
  );
}