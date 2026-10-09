"use client";

import React, { useState } from "react";
import {
  REGIONAL_CATCHMENT_FACILITIES,
  HospitalFacility,
} from "@/lib/mockData";
import {
  MapPin,
  Phone,
  FileText,
  Navigation,
  ExternalLink,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { GlareCard } from "@/components/ui/glare-card";

interface GeospatialTriageProps {
  severity?: "Routine" | "Critical";
  confidence?: number;
  diagnosis?: string;
  patientCity?: string;
  onLocationChange?: (city: string) => void;
}

const AVAILABLE_LOCATIONS = [
  "Jaipur",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "London",
  "New York",
];

export default function GeospatialTriage({
  severity = "Critical",
  confidence = 0.998,
  diagnosis = "Glioblastoma Multiforme",
  patientCity = "Jaipur",
  onLocationChange,
}: GeospatialTriageProps) {
  const [selectedCity, setSelectedCity] = useState(patientCity);
  const [referralRequested, setReferralRequested] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>("HOSP-01");

  const isHighPriority =
    severity === "Critical" ||
    (diagnosis.toLowerCase() !== "notumor" &&
      diagnosis.toLowerCase() !== "no tumor detected" &&
      confidence > 0.85);

  const hospitals: HospitalFacility[] = REGIONAL_CATCHMENT_FACILITIES;
  const primaryHospital =
    hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  const handleCityChange = (newCity: string) => {
    setSelectedCity(newCity);
    onLocationChange?.(newCity);
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xl shadow-slate-200/50 h-full overflow-y-auto space-y-4 sm:space-y-5">
      {/* 1. Header & Location Search Select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Regional Referral &amp; Catchment Route
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Geographic tertiary facilities and acute neurosurgical referral
          </p>
        </div>

        {/* Location Select Input: 📍 Base Location: Jaipur */}
        <div className="flex items-center gap-2">
          <label htmlFor="base-location-select" className="text-xs font-medium text-slate-600 flex items-center gap-1 shrink-0">
            <MapPin className="h-3.5 w-3.5 text-blue-700" />
            <span>Base Location:</span>
          </label>
          <select
            id="base-location-select"
            aria-label="Base Location"
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none shadow-xs"
          >
            {AVAILABLE_LOCATIONS.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Referral Recommendation Block using GlareCard */}
      <GlareCard className="border-blue-200/80 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            {/* Blue Badge: Referral Rec: High-Priority Routing */}
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-100/70 px-3 py-1 text-xs font-bold text-blue-900">
              <span className="h-2 w-2 rounded-full bg-blue-700 animate-pulse" />
              <span>
                {isHighPriority
                  ? "Referral Rec: High-Priority Routing"
                  : "Referral Rec: Standard Clinical Route"}
              </span>
            </span>

            <span className="text-xs font-mono font-semibold text-slate-500">
              Facility ID: {primaryHospital.id}
            </span>
          </div>

          {/* Primary Hospital Details */}
          <div>
            <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {primaryHospital.name}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Distance: <strong className="text-slate-800">{primaryHospital.distanceKm} km</strong> | Neuro-ICU Beds Available ({primaryHospital.currentBedCapacity}) | {primaryHospital.equipmentLevel}
            </p>
          </div>

          {/* Call to Action: Request Standard Referral */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setReferralRequested(true)}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700"
            >
              Request Standard Referral
            </button>
          </div>

          {/* Standard Text Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReferralRequested(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs transition"
            >
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              <span>📄 Request Referral</span>
            </button>

            <a
              href={`tel:${primaryHospital.contactPhone}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs transition"
            >
              <Phone className="h-3.5 w-3.5 text-slate-500" />
              <span>📞 Call Center</span>
            </a>

            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=26.9124,75.7873&destination=${encodeURIComponent(
                primaryHospital.name + " " + selectedCity
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline ml-auto"
            >
              <span>Open Maps Route</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Confirmation note */}
          {referralRequested && (
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Transfer requisition confirmed for {primaryHospital.name}. Acute transfer dossier dispatched.
              </span>
            </div>
          )}
        </div>
      </GlareCard>

      {/* 3. Reference Street Map of Jaipur with deep blue route indicator path */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Clinical Route Map ({selectedCity})</span>
          <span className="font-mono text-[11px] text-blue-700 font-semibold">
            {primaryHospital.distanceKm} km • ~{primaryHospital.driveTimeMin} min transit
          </span>
        </div>

        {/* Standard flat medical street map */}
        <div className="relative w-full h-52 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shadow-xs">
          <svg
            viewBox="0 0 460 220"
            className="w-full h-full"
            aria-label="Street map of patient catchment area"
          >
            {/* Background Map Canvas Grid */}
            <rect width="460" height="220" fill="#f8fafc" />

            {/* Minor Street Grid Lines */}
            <g stroke="#e2e8f0" strokeWidth="1" strokeDasharray="none">
              <line x1="40" y1="0" x2="40" y2="220" />
              <line x1="90" y1="0" x2="90" y2="220" />
              <line x1="140" y1="0" x2="140" y2="220" />
              <line x1="190" y1="0" x2="190" y2="220" />
              <line x1="240" y1="0" x2="240" y2="220" />
              <line x1="290" y1="0" x2="290" y2="220" />
              <line x1="340" y1="0" x2="340" y2="220" />
              <line x1="390" y1="0" x2="390" y2="220" />
              <line x1="440" y1="0" x2="440" y2="220" />

              <line x1="0" y1="35" x2="460" y2="35" />
              <line x1="0" y1="75" x2="460" y2="75" />
              <line x1="0" y1="115" x2="460" y2="115" />
              <line x1="0" y1="155" x2="460" y2="155" />
              <line x1="0" y1="195" x2="460" y2="195" />
            </g>

            {/* Major Arterial Roads */}
            <g stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round">
              {/* MI Road */}
              <line x1="30" y1="60" x2="430" y2="60" />
              {/* Tonk Road */}
              <line x1="150" y1="20" x2="260" y2="210" />
              {/* JLN Marg */}
              <line x1="240" y1="20" x2="370" y2="210" />
              {/* Ajmer Road */}
              <line x1="30" y1="140" x2="280" y2="140" />
            </g>

            {/* Street Names (Subtle clinical labels) */}
            <text x="50" y="52" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              MI ROAD
            </text>
            <text x="250" y="45" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              JLN MARG
            </text>
            <text x="145" y="105" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              TONK RD
            </text>
            <text x="50" y="132" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              AJMER RD
            </text>

            {/* Standard Deep Blue Indicator Path from Patient Origin to Hospital */}
            {/* Route path from (110, 140) to (320, 95) */}
            <path
              d="M 110 140 L 195 140 L 255 105 L 320 95"
              fill="none"
              stroke="#1d4ed8"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Subtle path outline for clarity */}
            <path
              d="M 110 140 L 195 140 L 255 105 L 320 95"
              fill="none"
              stroke="#93c5fd"
              strokeWidth="7"
              strokeOpacity="0.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Patient Origin Pin */}
            <g transform="translate(110, 140)">
              <circle r="6" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2" />
              <rect x="-45" y="-24" width="90" height="16" rx="4" fill="#1e293b" />
              <text x="0" y="-13" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                PATIENT ORIGIN
              </text>
            </g>

            {/* Hospital Center Destination Pin */}
            <g transform="translate(320, 95)">
              <circle r="7" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
              <rect x="-55" y="-26" width="110" height="18" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <text x="0" y="-14" fill="#0f172a" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                SMS HOSPITAL
              </text>
            </g>

            {/* Route Callout Tag */}
            <g transform="translate(220, 175)">
              <rect x="0" y="0" width="170" height="24" rx="6" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.05))" />
              <circle cx="12" cy="12" r="3" fill="#1d4ed8" />
              <text x="22" y="15" fill="#334155" fontSize="9" fontWeight="600" fontFamily="sans-serif">
                Primary Route: 4.8 km via JLN Marg
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* 4. Catchment Facilities List (Flat, clean, professional) */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-700 block">
          Regional Catchment Facilities ({selectedCity})
        </span>

        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden text-xs">
          {hospitals.slice(0, 3).map((facility) => {
            const isSelected = facility.id === selectedHospitalId;
            return (
              <div
                key={facility.id}
                onClick={() => setSelectedHospitalId(facility.id)}
                className={`p-2.5 flex items-center justify-between cursor-pointer transition ${
                  isSelected
                    ? "bg-blue-50/60 font-medium text-slate-900"
                    : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className={`h-4 w-4 shrink-0 ${isSelected ? "text-blue-700" : "text-slate-400"}`} />
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900 block truncate">
                      {facility.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {facility.distanceKm} km • {facility.equipmentLevel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-mono text-slate-600">
                    {facility.currentBedCapacity} ICU Beds
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-blue-700 uppercase">
                      Selected
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
