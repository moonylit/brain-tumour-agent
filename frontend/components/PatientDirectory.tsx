"use client";

import React, { useState } from "react";
import { Patient } from "@/lib/mockData";
import { ChevronDown, Check } from "lucide-react";

interface PatientDirectoryProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
}

export default function PatientDirectory({
  patients,
  selectedPatientId,
  onSelectPatient,
}: PatientDirectoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activePatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-2">
        <label htmlFor="patient-directory-select" className="sr-only">
          Select Patient
        </label>

        {/* Straightforward Clinical Trigger Button */}
        <button
          id="patient-directory-select"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 transition shadow-xs"
        >
          <span>
            Select Patient:{" "}
            <span className="font-semibold text-slate-900">
              {activePatient.name} ({activePatient.age}y)
            </span>
          </span>

          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Flat Clinical Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 z-50 mt-1.5 w-72 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
            <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-400">
                Registered Patients
              </span>
            </div>

            <div className="space-y-0.5">
              {patients.map((patient) => {
                const isSelected = patient.id === selectedPatientId;
                return (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => {
                      onSelectPatient(patient.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-left text-xs transition ${
                      isSelected
                        ? "bg-blue-50 text-blue-900 font-semibold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-900 font-medium">
                          {patient.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          ({patient.age}y)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal truncate max-w-[190px]">
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
  );
}
