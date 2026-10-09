"use client";

import React, { useState } from "react";
import { Patient } from "@/lib/mockData";
import {
  ChevronDown,
  Check,
  User,
  Plus,
  UploadCloud,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

interface PatientCommandModuleProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  onOpenAddPatient: () => void;
  onOpenUploadScan: () => void;
}

export default function PatientCommandModule({
  patients,
  selectedPatientId,
  onSelectPatient,
  onOpenAddPatient,
  onOpenUploadScan,
}: PatientCommandModuleProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activePatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Patient Directory Dropdown Selector */}
      <div className="relative inline-block text-left">
        <label htmlFor="patient-directory-select" className="sr-only">
          Select Patient
        </label>

        <button
          id="patient-directory-select"
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 transition shadow-xs"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100/70 text-blue-700">
            <User className="h-3.5 w-3.5" />
          </div>
          <span>
            Select Patient:{" "}
            <span className="font-bold text-slate-900">
              {activePatient.name} ({activePatient.age}y)
            </span>
          </span>

          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="absolute left-0 z-50 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
              <div className="px-3 py-2 border-b border-slate-100 mb-1 flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Registered Patients
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {patients.length} Clinical Profiles
                </span>
              </div>

              <div className="space-y-1">
                {patients.map((patient) => {
                  const isSelected = patient.id === selectedPatientId;
                  return (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => {
                        onSelectPatient(patient.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition ${
                        isSelected
                          ? "bg-blue-50 text-blue-900 font-bold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-900 font-bold">
                            {patient.name}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            ({patient.age}y)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal truncate max-w-[200px] mt-0.5">
                          {patient.primaryDiagnosis}
                        </p>
                      </div>

                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-700 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* TWO PROMINENT, PRIMARY-COLORED ACTION BUTTONS */}
      <button
        type="button"
        onClick={onOpenAddPatient}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold px-3.5 py-2 text-xs sm:text-sm shadow-md shadow-blue-700/20 hover:shadow-lg transition cursor-pointer"
        title="Add New Clinical Patient"
      >
        <Plus className="h-4 w-4" />
        <span>➕ Add New Patient</span>
      </button>

      <button
        type="button"
        onClick={onOpenUploadScan}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold px-3.5 py-2 text-xs sm:text-sm shadow-md shadow-cyan-600/20 hover:shadow-lg transition cursor-pointer"
        title="Upload MRI Scan via Dropzone"
      >
        <UploadCloud className="h-4 w-4 text-cyan-100" />
        <span>📤 Upload MRI Scan</span>
      </button>
    </div>
  );
}
