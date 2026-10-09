"use client";

import React, { useState } from "react";
import { HospitalFacility, REGIONAL_CATCHMENT_FACILITIES } from "@/lib/mockData";
import {
  Compass,
  Phone,
  BedDouble,
  ShieldCheck,
  Building2,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Plane,
  Truck,
} from "lucide-react";

interface GeospatialTriageProps {
  severity: "Routine" | "Critical";
  confidence: number;
  diagnosis: string;
  patientCity?: string;
}

export default function GeospatialTriage({
  severity,
  confidence,
  diagnosis,
  patientCity = "Jaipur",
}: GeospatialTriageProps) {
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [heliDispatched, setHeliDispatched] = useState(false);

  const isCritical = severity === "Critical";

  // Routing Logic Engine:
  // If CRITICAL: Filter to only facilities with Neuro-ICU AND bed capacity > 0
  const eligibleFacilities = REGIONAL_CATCHMENT_FACILITIES.filter((h) => {
    if (isCritical) {
      return h.hasNeuroICU && h.currentBedCapacity > 0;
    }
    return true;
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  // Optimal recommended hospital
  const optimalFacility: HospitalFacility = eligibleFacilities[0] || REGIONAL_CATCHMENT_FACILITIES[0];
  const activeSelected =
    eligibleFacilities.find((h) => h.id === selectedHospitalId) || optimalFacility;

  return (
    <div className="flex flex-col rounded-3xl border border-slate-200/90 bg-white/95 p-5 sm:p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl h-full">
      {/* Triage Panel Header */}
      <div className="border-b border-slate-100 pb-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-xs font-mono font-bold text-cyan-800">
              <Compass className="h-3.5 w-3.5 text-cyan-600 animate-spin" style={{ animationDuration: "12s" }} />
              Geospatial Catchment Triage
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-mono text-slate-700">
              Center: {patientCity}
            </span>
          </div>

          {/* Real-time Triage Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono font-bold shadow-sm ${
              isCritical
                ? "bg-rose-100 text-rose-800 border border-rose-300"
                : "bg-emerald-100 text-emerald-800 border border-emerald-300"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isCritical ? "bg-rose-600 animate-ping" : "bg-emerald-600"
              }`}
            />
            {isCritical ? "CRITICAL TRIAGE: HIGH-PRIORITY ROUTING" : "ROUTINE TRIAGE: STANDARD MONITORING"}
          </span>
        </div>

        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Navigation className="h-5 w-5 text-cyan-600" />
          Autonomous Medical Dispatch &amp; Catchment Router
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Dynamic facility filtering based on live Neuro-ICU capacity and clinical lesion severity.
        </p>
      </div>

      {/* Recommended Dispatch Command Banner */}
      <div
        className={`mb-5 rounded-2xl border p-4 shadow-md transition-all ${
          isCritical
            ? "border-rose-300 bg-gradient-to-br from-rose-50/80 via-white to-amber-50/50"
            : "border-cyan-200 bg-gradient-to-br from-cyan-50/70 via-white to-violet-50/50"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm ${
                isCritical
                  ? "bg-rose-500 text-white border-rose-600"
                  : "bg-cyan-600 text-white border-cyan-700"
              }`}
            >
              {isCritical ? (
                <Plane className="h-5 w-5 animate-pulse" />
              ) : (
                <Truck className="h-5 w-5" />
              )}
            </div>

            <div>
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 block">
                Primary Recommended Routing Protocol
              </span>
              <span
                className={`text-sm font-black tracking-tight ${
                  isCritical ? "text-rose-900" : "text-cyan-900"
                }`}
              >
                {isCritical
                  ? "Route Patient via Heli-Ambulance"
                  : "Standard Ground Medical Transfer"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-sm">
              Transit: {isCritical ? `${optimalFacility.flightTimeMin} min flight` : `${optimalFacility.driveTimeMin} min drive`}
            </span>

            <button
              type="button"
              onClick={() => setHeliDispatched(true)}
              disabled={heliDispatched}
              className={`tactile-button inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm transition ${
                heliDispatched
                  ? "bg-emerald-600 cursor-default"
                  : isCritical
                  ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
                  : "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30"
              }`}
            >
              {heliDispatched ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Protocol Dispatched</span>
                </>
              ) : (
                <>
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Authorize Route</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Selected Facility Overview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-cyan-600" />
              <span>{activeSelected.name}</span>
            </h4>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                Distance: {activeSelected.distanceKm} km
              </span>
              <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                <BedDouble className="h-3 w-3" />
                {activeSelected.currentBedCapacity} Neuro-ICU Beds Open
              </span>
              <span className="font-mono text-[11px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded">
                {activeSelected.equipmentLevel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${activeSelected.contactPhone.replace(/[^0-9+]/g, "")}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:text-cyan-700 hover:border-cyan-300 shadow-sm transition"
            >
              <Phone className="h-3.5 w-3.5 text-cyan-600" />
              <span>Direct ICU Line</span>
            </a>
          </div>
        </div>
      </div>

      {/* Tactical Radar Route Visualizer Box */}
      <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white shadow-inner relative overflow-hidden">
        {/* Radar Rings Grid */}
        <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-2">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            LIVE RADAR RANGE: 25 KM CATCHMENT
          </span>
          <span className="text-slate-400">COORDINATES: 26.912° N, 75.787° E</span>
        </div>

        {/* Radar Map Canvas Representation */}
        <div className="relative h-36 w-full flex items-center justify-center border border-cyan-500/20 rounded-xl bg-slate-950/80 overflow-hidden">
          {/* Concentric distance rings */}
          <div className="absolute h-16 w-16 rounded-full border border-cyan-500/30" />
          <div className="absolute h-28 w-28 rounded-full border border-cyan-500/20" />
          <div className="absolute h-full w-full rounded-full border border-cyan-500/10" />

          {/* Crosshairs */}
          <div className="absolute h-full w-px bg-cyan-500/20" />
          <div className="absolute w-full h-px bg-cyan-500/20" />

          {/* Patient Center Locus */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-3.5 w-3.5 rounded-full bg-cyan-400 border-2 border-white shadow-lg shadow-cyan-400/80 animate-pulse" />
            <span className="text-[9px] font-mono text-cyan-300 font-bold mt-1 bg-slate-900/90 px-1 rounded">
              PATIENT LOCUS
            </span>
          </div>

          {/* Blips for Hospitals */}
          {eligibleFacilities.map((fac, idx) => {
            // Distribute blips based on mock angle/distance
            const angles = [45, 135, 220, 310, 80];
            const angle = angles[idx % angles.length];
            const rad = (angle * Math.PI) / 180;
            const distRadius = 20 + (fac.distanceKm / 25) * 45; // scale to 45px
            const x = Math.cos(rad) * distRadius;
            const y = Math.sin(rad) * distRadius;

            const isLead = fac.id === activeSelected.id;

            return (
              <button
                key={fac.id}
                type="button"
                onClick={() => setSelectedHospitalId(fac.id)}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                className={`absolute group cursor-pointer p-1 transition-transform hover:scale-125 focus:outline-none`}
                title={`${fac.name} (${fac.distanceKm} km)`}
              >
                <div
                  className={`h-2.5 w-2.5 rounded-full border shadow-md transition ${
                    isLead
                      ? "bg-rose-400 border-white ring-4 ring-rose-500/50 animate-bounce"
                      : "bg-emerald-400 border-white"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>● Patient Locus (Origin)</span>
          <span className="text-emerald-400">● Qualified Receiving Facilities</span>
          <span className="text-rose-400">● Primary Recommended Vector</span>
        </div>
      </div>

      {/* Eligible Facility Roster (Filtered by Severity) */}
      <div className="flex-1 overflow-y-auto max-h-72 space-y-2.5 pr-1">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 pb-1">
          <span>Available Catchment Facilities ({eligibleFacilities.length})</span>
          {isCritical && (
            <span className="text-rose-700 text-[11px]">
              Filters: Neuro-ICU Required &bull; Beds &gt; 0
            </span>
          )}
        </div>

        {eligibleFacilities.map((facility) => {
          const isCurrentActive = facility.id === activeSelected.id;

          return (
            <div
              key={facility.id}
              onClick={() => setSelectedHospitalId(facility.id)}
              className={`cursor-pointer rounded-2xl border p-3.5 transition-all shadow-sm ${
                isCurrentActive
                  ? "border-cyan-500 bg-cyan-50/50 shadow-md ring-1 ring-cyan-500/20"
                  : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/80"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h5 className="text-xs font-bold text-slate-900 leading-snug flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                  <span>{facility.name}</span>
                </h5>
                <span className="shrink-0 font-mono text-[10px] font-extrabold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {facility.distanceKm} km
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500">
                <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                  <BedDouble className="h-3 w-3" />
                  {facility.currentBedCapacity} Beds
                </span>
                <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                  {facility.equipmentLevel}
                </span>
                {facility.helipadAvailable && (
                  <span className="text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-200 font-semibold flex items-center gap-0.5">
                    <Plane className="h-2.5 w-2.5" />
                    Helipad Active
                  </span>
                )}
                <span className="ml-auto text-cyan-700 font-bold font-sans">
                  {facility.driveTimeMin} min drive
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
