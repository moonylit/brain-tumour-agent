"use client";

import React, { useState } from "react";
import { UserPlus, X, Check, Building2, AlertTriangle, ShieldCheck } from "lucide-react";
import { Patient, ScanRecord } from "@/lib/mockData";

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (newPatient: Patient, initialScan: ScanRecord) => void;
}

const REGIONS = ["Jaipur", "Mumbai", "Delhi", "Bangalore", "London", "New York"];

export default function AddPatientModal({
  isOpen,
  onClose,
  onAddPatient,
}: AddPatientModalProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("52");
  const [region, setRegion] = useState("Jaipur");
  const [riskLevel, setRiskLevel] = useState<"Critical" | "Low">("Critical");
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState("Glioma (Suspected)");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const patientId = `PT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPatient: Patient = {
      id: patientId,
      name: name.trim(),
      age: parseInt(age) || 50,
      gender: "Other",
      referralCity: region,
      riskLevel: riskLevel,
      primaryDiagnosis: primaryDiagnosis,
      baselineDate: new Date().toISOString().slice(0, 10),
    };

    const isRoutine = riskLevel === "Low" || primaryDiagnosis.toLowerCase().includes("routine");
    const baselineScan: ScanRecord = {
      id: `SCN-${Date.now().toString().slice(-4)}`,
      patientId: patientId,
      date: new Date().toISOString().slice(0, 10),
      originalImageUrl: isRoutine ? "/scans/axial_notumor.jpg" : "/scans/axial_glioma_01.jpg",
      gradCamUrl: isRoutine ? "/scans/axial_notumor.jpg" : "/scans/axial_glioma_01.jpg",
      tumorAreaPixels: isRoutine ? 0 : 8450,
      confidence: 0.991,
      severity: isRoutine ? "Routine" : "Critical",
      diagnosis: isRoutine ? "No Tumor Detected" : primaryDiagnosis,
      notes: `Baseline clinical intake record created for ${name.trim()} in ${region}`,
    };

    onAddPatient(newPatient, baselineScan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xl shadow-slate-900/20"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-patient-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 text-blue-700">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h2 id="add-patient-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Add New Clinical Patient
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Initialize longitudinal tracking &amp; referral catchment
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Patient Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Arthur Pendelton"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Age (Years)
              </label>
              <input
                type="number"
                required
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Referral City
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none shadow-xs"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Primary Diagnostic Classification
            </label>
            <select
              value={primaryDiagnosis}
              onChange={(e) => setPrimaryDiagnosis(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none shadow-xs"
            >
              <option value="Glioma (Suspected)">Glioma (Suspected)</option>
              <option value="Meningioma">Meningioma</option>
              <option value="Pituitary Adenoma">Pituitary Adenoma</option>
              <option value="Routine Surveillance (Post-Op)">Routine Surveillance (Post-Op)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Triage Urgency Level
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRiskLevel("Critical")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition ${
                  riskLevel === "Critical"
                    ? "border-amber-400 bg-amber-50 text-amber-900 shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Critical Escalation</span>
              </button>

              <button
                type="button"
                onClick={() => setRiskLevel("Low")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition ${
                  riskLevel === "Low"
                    ? "border-emerald-400 bg-emerald-50 text-emerald-900 shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Routine Screening</span>
              </button>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold shadow-md shadow-blue-700/20 transition"
            >
              Register Patient &amp; Initialize
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
