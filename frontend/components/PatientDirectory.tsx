"use client";

import React, { useState } from "react";
import { Patient } from "@/lib/mockData";
import { Users, ChevronDown, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";

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

  function getRiskBadge(risk: Patient["riskLevel"]) {
    switch (risk) {
      case "Critical":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "Moderate":
      case "High":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Low":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  }

  function getRiskIcon(risk: Patient["riskLevel"]) {
    switch (risk) {
      case "Critical":
        return <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />;
      case "Moderate":
      case "High":
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />;
      case "Low":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
      default:
        return null;
    }
  }

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-2">
        <label htmlFor="patient-directory-select" className="sr-only">
          Select Patient
        </label>

        {/* Sleek Custom Trigger Button */}
        <button
          id="patient-directory-select"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2 shadow-sm hover:border-cyan-400 hover:shadow-md transition-all text-left"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-50 to-violet-50 border border-cyan-200 text-cyan-700 shadow-sm shrink-0">
            <Users className="h-4 w-4" />
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Patient Directory
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition">
                {activePatient.name}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                ({activePatient.age}y &bull; {activePatient.id})
              </span>
            </div>
          </div>

          <span
            className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold border ${getRiskBadge(
              activePatient.riskLevel
            )}`}
          >
            {getRiskIcon(activePatient.riskLevel)}
            <span>{activePatient.riskLevel.toUpperCase()}</span>
          </span>

          <ChevronDown
            className={`h-4 w-4 text-slate-400 ml-1 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 sm:left-0 z-50 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-300/60 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-slate-100">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Registered Cohort Records
              </span>
            </div>

            <div className="mt-1 space-y-1">
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
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition ${
                      isSelected
                        ? "bg-cyan-50/70 border border-cyan-200 text-cyan-900 shadow-sm"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">
                          {patient.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {patient.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate max-w-[190px]">
                        {patient.primaryDiagnosis}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold border ${getRiskBadge(
                        patient.riskLevel
                      )}`}
                    >
                      {getRiskIcon(patient.riskLevel)}
                      <span>{patient.riskLevel}</span>
                    </span>
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
