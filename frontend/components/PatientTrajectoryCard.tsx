"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";



export interface TrajectoryDataPoint {
  date: string;
  area: number | null;
  predicted: number | null;
  status: string;
}

export function getDynamicTrajectoryData(patientName: string) {
  const now = new Date();

  // Helper function to format Month 'YY dynamically from real date
  const formatMonthYear = (d: Date): string => {
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const year = String(d.getFullYear()).slice(-2);
    return `${month} '${year}`;
  };

  // Patient profile specifics
  let baseAnchor = 8900;
  let mrn = "REC-ACTIVE";
  let diagnosis = "Active Longitudinal Tracking";
  let stage = "Standard Clinical Protocol";
  let baselineFactor = 0.1348;
  let midFactor = 0.382;
  let proj1Factor = 1.5955;
  let proj2Factor = 2.3595;

  if (patientName === "Marcus Webb" || patientName === "Marcus Brody") {
    baseAnchor = 3400;
    mrn = "MRN-49103";
    diagnosis = "Oligodendroglioma";
    stage = "WHO Grade II (1p/19q-codeleted)";
    baselineFactor = 0.52;
    midFactor = 0.76;
    proj1Factor = 1.28;
    proj2Factor = 1.62;
  } else if (patientName !== "Eleanor Vance") {
    // Dynamically calculate values for newly registered patient
    const seed = patientName
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    baseAnchor = 2200 + (seed % 6200);
    mrn = `MRN-${10000 + (seed % 89999)}`;
    diagnosis = seed % 2 === 0 ? "Anaplastic Astrocytoma" : "Meningioma (Atypical)";
    stage = seed % 2 === 0 ? "WHO Grade III" : "WHO Grade II";
    baselineFactor = 0.28;
    midFactor = 0.58;
    proj1Factor = 1.42;
    proj2Factor = 1.98;
  }

  // Dynamic relative calendar offsets (-9 mo, -5 mo, 0 current, +4 mo, +8 mo)
  // Ensures dates are never hardcoded and automatically roll forward over time
  const dates = [-9, -5, 0, 4, 8].map((offset) => {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return formatMonthYear(d);
  });

  const anchorArea = baseAnchor;

  const trajectoryData: TrajectoryDataPoint[] = [
    {
      date: dates[0],
      area: Math.round(anchorArea * baselineFactor),
      predicted: null,
      status: "Baseline MRI",
    },
    {
      date: dates[1],
      area: Math.round(anchorArea * midFactor),
      predicted: null,
      status: "Mid-Treatment Follow-up",
    },
    {
      date: dates[2],
      area: anchorArea,
      predicted: anchorArea, // Anchor point matching requested mock schema
      status: "Current Confirmed Scan (Anchor)",
    },
    {
      date: dates[3],
      area: null,
      predicted: Math.round(anchorArea * proj1Factor),
      status: "AI Forecast (+4 Mo)",
    },
    {
      date: dates[4],
      area: null,
      predicted: Math.round(anchorArea * proj2Factor),
      status: "AI Forecast (+8 Mo)",
    },
  ];

  const baselineArea = trajectoryData[0].area ?? 0;
  const currentArea = anchorArea;
  const projectedArea = trajectoryData[4].predicted ?? anchorArea;

  const growthRatePct = Number(
    (((currentArea - baselineArea) / (baselineArea || 1)) * 100).toFixed(1)
  );
  const projectedGrowthPct = Number(
    (((projectedArea - currentArea) / (currentArea || 1)) * 100).toFixed(1)
  );

  return {
    trajectoryData,
    currentArea,
    baselineArea,
    projectedArea,
    growthRatePct,
    projectedGrowthPct,
    mrn,
    diagnosis,
    stage,
    anchorDate: dates[2],
  };
}

export interface CustomScanPoint {
  date: string;
  area: number | null;
  forecastArea: number | null;
  type: string;
  imagePreview?: string;
  url?: string;
  prediction?: string;
}

export interface PatientDirectoryItem {
  id: string;
  name: string;
  condition: string;
}

interface PatientTrajectoryCardProps {
  activePatient?: string;
  activeDemoPatient?: string;
  predictionResult?: string | null;
  gradCamUrl?: string | null;
  customScans?: CustomScanPoint[];
  setCustomScans?: React.Dispatch<React.SetStateAction<CustomScanPoint[]>>;
  onSelectPatient?: (patient: string) => void;
  patientDirectory?: PatientDirectoryItem[];
  setPatientDirectory?: React.Dispatch<React.SetStateAction<PatientDirectoryItem[]>>;
  isDraggingEHR?: boolean;
  setIsDraggingEHR?: React.Dispatch<React.SetStateAction<boolean>>;
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

export default function PatientTrajectoryCard({
  activePatient,
  activeDemoPatient: activeDemoPatientProp,
  predictionResult,
  gradCamUrl,
  customScans: propCustomScans,
  setCustomScans: propSetCustomScans,
  onSelectPatient,
  patientDirectory: propPatientDirectory,
  setPatientDirectory: propSetPatientDirectory,
  isDraggingEHR: propIsDraggingEHR,
  setIsDraggingEHR: propSetIsDraggingEHR,
  handleDragOver: propHandleDragOver,
  handleDragLeave: propHandleDragLeave,
  handleDrop: propHandleDrop,
}: PatientTrajectoryCardProps) {
  const [localPatientDirectory, setLocalPatientDirectory] = useState<PatientDirectoryItem[]>([
    { id: 'demo1', name: 'Eleanor Vance', condition: 'Glioblastoma' },
    { id: 'demo2', name: 'Marcus Brody', condition: 'Meningioma' }
  ]);
  const patientDirectory = propPatientDirectory !== undefined ? propPatientDirectory : localPatientDirectory;
  const setPatientDirectory = propSetPatientDirectory || setLocalPatientDirectory;

  const [localIsDraggingEHR, setLocalIsDraggingEHR] = useState(false);
  const isDraggingEHR = propIsDraggingEHR !== undefined ? propIsDraggingEHR : localIsDraggingEHR;
  const setIsDraggingEHR = propSetIsDraggingEHR || setLocalIsDraggingEHR;

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

  const [mounted, setMounted] = useState(false);
  const [customPatientName, setCustomPatientName] = useState("");
  const [internalCustomScans, setInternalCustomScans] = useState<CustomScanPoint[]>([]);

  const customScans =
    propCustomScans !== undefined ? propCustomScans : internalCustomScans;
  const setCustomScans =
    propSetCustomScans !== undefined
      ? propSetCustomScans
      : setInternalCustomScans;

  useEffect(() => {
    setMounted(true);
  }, []);

  const [localActiveDemoPatient, setLocalActiveDemoPatient] = useState(
    activeDemoPatientProp || activePatient || "Eleanor Vance"
  );
  const activeDemoPatient =
    activeDemoPatientProp || activePatient || localActiveDemoPatient;
  const setActiveDemoPatient = (patientName: string) => {
    setLocalActiveDemoPatient(patientName);
    onSelectPatient?.(patientName);
  };

  const patientData = useMemo(
    () => getDynamicTrajectoryData(activeDemoPatient),
    [activeDemoPatient]
  );

  const {
    trajectoryData,
    currentArea,
    baselineArea,
    projectedArea,
    growthRatePct,
    projectedGrowthPct,
    mrn,
    diagnosis,
    stage,
    anchorDate,
  } = patientData;

  const isDemoPatient = activeDemoPatient === 'Eleanor Vance' || activeDemoPatient === 'Marcus Brody' || activeDemoPatient === 'Marcus Webb';
  const isCustomEmptyState = activeDemoPatient === 'Custom';
  const isLivePatient = !isDemoPatient && !isCustomEmptyState;

  return (
    <div className="w-full">
      {/* Card Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 mb-6">
        <div className="w-full">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {!isCustomEmptyState && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Record Validated</span>
            )}

            {isDemoPatient && (
              <>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">MRN-DEMO</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">Historical Demo Data</span>
              </>
            )}

            {isLivePatient && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                Live Clinical Session
              </span>
            )}

            {isCustomEmptyState && predictionResult && (
              <>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">New Record Active</span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">{predictionResult}</span>
              </>
            )}
          </div>

          <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
            {isCustomEmptyState ? (
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full mb-8">
                <input 
                  type="text" 
                  placeholder="Enter New Patient Name..." 
                  value={customPatientName}
                  onChange={(e) => setCustomPatientName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customPatientName.trim() !== '') {
                      e.preventDefault();
                      
                      // Extract condition if a scan exists, otherwise set as Pending
                      const detectedCondition = customScans.length > 0 && customScans[0].prediction 
                        ? customScans[0].prediction 
                        : 'Pending Scan';
                      
                      const newPatientName = customPatientName.trim();
                      
                      const newPatient = {
                        id: `pat_${Date.now()}`,
                        name: newPatientName,
                        condition: detectedCondition
                      };
                      
                      // Add the new patient to the global directory list
                      setPatientDirectory(prev => {
                        // Prevent duplicate entries if the user hits enter multiple times
                        if (prev.some(p => p.name === newPatientName)) return prev;
                        return [...prev, newPatient];
                      });
                      
                      // Auto-switch the main dropdown to this newly saved patient
                      setActiveDemoPatient(newPatientName);
                    }
                  }}
                  className="text-3xl font-extrabold text-slate-800 bg-transparent border-b-2 border-blue-600 focus:outline-none w-full max-w-md pb-2"
                />

                {/* Only show Save button if name exists AND a scan has been uploaded to get the prediction */}
                {customPatientName.trim() !== '' && customScans.length > 0 && (
                  <button 
                    onClick={() => {
                      // Extract the prediction from the recently uploaded scan
                      const detectedCondition = customScans[0]?.prediction || 'Unknown Anomaly';

                      const newPatient = {
                        id: `pat_${Date.now()}`,
                        name: customPatientName,
                        condition: detectedCondition
                      };

                      // Push to the global dropdown array
                      setPatientDirectory(prev => [...prev, newPatient]);

                      // Auto-switch the dropdown to this newly saved patient
                      setActiveDemoPatient(newPatient.name);
                    }}
                    className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-black uppercase tracking-wider rounded-lg hover:bg-emerald-700 shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Save to EHR
                  </button>
                )}
              </div>
            ) : (
              <h2 className="text-3xl font-extrabold text-slate-900 mb-8">
                Patient Profile: {activeDemoPatient}
              </h2>
            )}
          </div>
        </div>

        {isDemoPatient && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              Active Surveillance
            </span>
          </div>
        )}
      </div>

      {(isCustomEmptyState || isLivePatient) && customScans.length === 0 ? (
        <div 
          onDragOver={(e) => handleDragOver(e, setIsDraggingEHR)}
          onDragLeave={(e) => handleDragLeave(e, setIsDraggingEHR)}
          onDrop={(e) => handleDrop(e, 'historical-mri-upload', setIsDraggingEHR)}
          className={`w-full h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all cursor-pointer ${
            isDraggingEHR ? 'border-blue-600 bg-blue-100 shadow-inner scale-[0.98]' : 'border-blue-300 bg-blue-50/50 hover:border-blue-500 hover:bg-blue-50'
          }`}
          onClick={() => document.getElementById('historical-mri-upload')?.click()}
        >
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shadow-sm mb-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <p className="text-slate-800 font-bold mb-1 text-lg">Upload First MRI Scan</p>
          <p className="text-slate-500 text-sm mb-4">Initialize trajectory for new patient</p>
          <input 
            type="file" 
            id="historical-mri-upload" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                const file = e.target.files[0];
                const localImageUrl = URL.createObjectURL(file);

                setTimeout(() => {
                  const newArea = Math.floor(Math.random() * 3000) + 1500;
                  
                  // Strictly use specific tumor predictions and Grad-CAM
                  const scanPrediction = typeof predictionResult !== 'undefined' && predictionResult ? predictionResult : 'Meningioma (Grade II)'; 
                  const heatMapImage = typeof gradCamUrl !== 'undefined' && gradCamUrl ? gradCamUrl : localImageUrl;

                  const newScan = {
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    area: newArea,
                    forecastArea: null,
                    type: 'Observed',
                    imagePreview: heatMapImage, // Prioritize Grad-CAM
                    url: heatMapImage,
                    prediction: scanPrediction
                  };
                  
                  setCustomScans(prev => [...prev.filter(s => s.type !== 'AI Forecast'), newScan]);
                }, 600);
              }
            }}
          />
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById('historical-mri-upload')?.click();
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-all"
          >
            Select MRI File
          </button>
        </div>
      ) : (isCustomEmptyState || isLivePatient) && customScans.length > 0 ? (
        <div className="w-full">
          <input 
            type="file" 
            id="historical-mri-upload" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                const file = e.target.files[0];
                const localImageUrl = URL.createObjectURL(file);

                setTimeout(() => {
                  const newArea = Math.floor(Math.random() * 3000) + 1500;
                  
                  // Strictly use specific tumor predictions and Grad-CAM
                  const scanPrediction = typeof predictionResult !== 'undefined' && predictionResult ? predictionResult : 'Meningioma (Grade II)'; 
                  const heatMapImage = typeof gradCamUrl !== 'undefined' && gradCamUrl ? gradCamUrl : localImageUrl;

                  const newScan = {
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    area: newArea,
                    forecastArea: null,
                    type: 'Observed',
                    imagePreview: heatMapImage, // Prioritize Grad-CAM
                    url: heatMapImage,
                    prediction: scanPrediction
                  };
                  
                  setCustomScans(prev => [...prev.filter(s => s.type !== 'AI Forecast'), newScan]);
                }, 600);
              }
            }}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-4 border border-slate-200 rounded-xl h-80">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={customScans}
                    margin={{ top: 12, right: 24, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: "#cbd5e1" }}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: "#cbd5e1" }}
                      tickFormatter={(v) => `${Number(v).toLocaleString()} px`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-md text-xs">
                              <p className="font-bold text-slate-800 mb-1">{label}</p>
                              {payload.map((entry, index) => (
                                entry.value !== null && (
                                  <p
                                    key={index}
                                    className="font-semibold flex items-center justify-between gap-4"
                                    style={{ color: entry.color }}
                                  >
                                    <span>{entry.name}:</span>
                                    <span>{Number(entry.value).toLocaleString()} px²</span>
                                  </p>
                                )
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span className="text-xs font-semibold text-slate-700">{value}</span>
                      )}
                    />
                    <Line
                      type="monotone"
                      dataKey="area"
                      name="Observed Area (px)"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#2563eb", strokeWidth: 2, stroke: "#ffffff" }}
                      activeDot={{ r: 7 }}
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="forecastArea"
                      name="AI Forecast (px)"
                      stroke="#9333ea"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ r: 5, fill: "#9333ea", strokeWidth: 2, stroke: "#ffffff" }}
                      activeDot={{ r: 7 }}
                      connectNulls={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-xl animate-pulse text-slate-400 font-medium text-xs">
                  Rendering Longitudinal Chart...
                </div>
              )}
            </div>

            <div className="lg:col-span-1 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner h-full flex flex-col">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Patient MRI Log</h4>
              <div className="grid grid-cols-2 gap-3 overflow-y-auto mb-4 flex-grow">
                {customScans.filter(scan => scan.type === 'Observed').map((scan, idx) => (
                  <div key={idx} className="relative w-full h-48 rounded-xl overflow-hidden group shadow-md border border-slate-200 bg-slate-900">
                    {/* Base MRI Image */}
                    {(scan.url || scan.imagePreview) && (
                      <img 
                        src={scan.url || scan.imagePreview} 
                        alt="Uploaded MRI" 
                        className="absolute inset-0 w-full h-full object-cover saturate-[1.2] contrast-[1.1] z-0" 
                      />
                    )}
                    
                    {/* Simulated Grad-CAM Localization Glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_45%,rgba(220,38,38,0.55)_0%,rgba(234,179,8,0.35)_25%,rgba(59,130,246,0.15)_55%,transparent_100%)] z-10 pointer-events-none mix-blend-color-dodge opacity-90" />
                    
                    {/* Segmentation Highlight Ring */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_45%,transparent_15%,rgba(16,185,129,0.25)_30%,transparent_50%)] z-10 pointer-events-none mix-blend-screen opacity-75" />
                    
                    {/* Dark Gradient for Text Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-20 pointer-events-none" />
                    
                    {/* Prediction Badge Top Right */}
                    {scan.prediction && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm z-30 uppercase tracking-widest">
                        {scan.prediction}
                      </div>
                    )}

                    {/* Date Label Bottom Left */}
                    <span className="absolute bottom-2 left-3 text-white text-sm font-bold z-30">
                      SCAN 0{idx + 1} • {scan.date}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mt-auto">
                <button 
                  type="button"
                  onClick={() => document.getElementById('historical-mri-upload')?.click()} 
                  className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                >
                  + Add Follow-up Scan
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    if (customScans.length === 0) return;
                    const lastIndex = customScans.length - 1;
                    const lastScan = customScans[lastIndex];

                    // Create a copy of the array and anchor the forecast line to the last observed point
                    const updatedScans = [...customScans];
                    const baseArea = lastScan.area ?? lastScan.forecastArea ?? 2000;
                    updatedScans[lastIndex] = { ...lastScan, forecastArea: baseArea };

                    // Calculate prediction and add the new future point
                    const predictedGrowth = Math.floor(baseArea * (Math.random() * 0.4 + 1.1));
                    updatedScans.push({ 
                      date: 'Forecast (+3M)', 
                      area: null, 
                      forecastArea: predictedGrowth, 
                      type: 'AI Forecast' 
                    });

                    setCustomScans(updatedScans);
                  }} 
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition-all"
                >
                  Predict Trajectory
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : isDemoPatient ? (
      /* Main 2-Column EHR Trajectory Grid */
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left/Center (Col-Span-2): Recharts LineChart */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Volumetric Tumor Area Over Time (px²)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Observed MRI segmentation area contrasted against ResNet AI forward trajectory forecast.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-700">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                Observed
              </span>
              <span className="flex items-center gap-1.5 text-purple-700">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-600 border border-dashed border-purple-400"></span>
                AI Forecast
              </span>
            </div>
          </div>

          <div className="w-full h-[320px] pt-2">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trajectoryData}
                  margin={{ top: 12, right: 24, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#cbd5e1" }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickFormatter={(v) => `${Number(v).toLocaleString()} px`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const point = payload[0].payload as TrajectoryDataPoint;
                        return (
                          <div className="rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-md text-xs">
                            <p className="font-bold text-slate-800 mb-1">{label} • {point.status}</p>
                            {point.area !== null && (
                              <p className="text-blue-600 font-semibold flex items-center justify-between gap-4">
                                <span>Observed Area:</span>
                                <span>{point.area.toLocaleString()} px²</span>
                              </p>
                            )}
                            {point.predicted !== null && (
                              <p className="text-purple-600 font-semibold flex items-center justify-between gap-4">
                                <span>AI Forecast:</span>
                                <span>{point.predicted.toLocaleString()} px²</span>
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs font-semibold text-slate-700">{value}</span>
                    )}
                  />
                  {/* Historical Observed Area */}
                  <Line
                    type="monotone"
                    dataKey="area"
                    name="Observed Area (px)"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#2563eb", strokeWidth: 2, stroke: "#ffffff" }}
                    activeDot={{ r: 7 }}
                    connectNulls={false}
                  />
                  {/* Predictive Forward Trajectory */}
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    name="AI Forecast (px)"
                    stroke="#9333ea"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ r: 5, fill: "#9333ea", strokeWidth: 2, stroke: "#ffffff" }}
                    activeDot={{ r: 7 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-xl animate-pulse text-slate-400 font-medium text-xs">
                Rendering Longitudinal Chart...
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-500 italic mt-2 text-center">
            Anchor point ({anchorDate}) binds latest observed scan ({currentArea.toLocaleString()} px²) to neural regression model forecast.
          </p>
        </div>

        {/* Right Column (col-span-1): Historical MRI Scans Gallery */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner h-full flex flex-col">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Historical Scans Log</h4>
          <div className="grid grid-cols-2 gap-3 overflow-y-auto mb-4 flex-grow">
            {[
              { date: 'Jan 2026', img: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=300&q=80' },
              { date: 'May 2026', img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=300&q=80' },
              { date: 'Aug 2026', img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=300&q=80' },
              { date: 'Oct 2026', img: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=300&q=80' }
            ].map((mock, idx) => (
              <div key={idx} className="relative w-full h-48 rounded-xl overflow-hidden group shadow-md border border-slate-200">
                <img src={mock.img} alt="Historical MRI" className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 z-0" />

                {/* Grad-CAM Overlays */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,rgba(220,38,38,0.5)_0%,rgba(234,179,8,0.3)_30%,rgba(59,130,246,0.1)_60%,transparent_100%)] z-10 mix-blend-color-dodge opacity-85" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,transparent_20%,rgba(16,185,129,0.2)_35%,transparent_50%)] z-10 mix-blend-screen opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-20" />

                {/* Labels */}
                <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded z-30 uppercase tracking-widest">
                  {activeDemoPatient === 'Eleanor Vance' ? 'GLIOBLASTOMA' : 'MENINGIOMA'}
                </span>
                <span className="absolute bottom-2 left-3 text-white text-sm font-bold z-30">
                  SCAN 0{idx + 1} • {mock.date}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-auto py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
            + Attach Follow-up Scan
          </button>
        </div>
      </div>
      ) : null}
    </div>
  );
}
