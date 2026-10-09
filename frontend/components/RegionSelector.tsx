"use client";

import React, { useState } from "react";
import { MapPin, Crosshair, Loader2, Sparkles } from "lucide-react";

interface RegionSelectorProps {
  value: string;
  onChange: (region: string) => void;
  disabled?: boolean;
}

const PRESET_REGIONS = [
  "Jaipur",
  "Delhi",
  "Mumbai",
  "Bangalore",
  "New York",
  "London",
  "Boston",
];

export default function RegionSelector({
  value,
  onChange,
  disabled = false,
}: RegionSelectorProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      setDetectError("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);
    setDetectError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                "Accept-Language": "en",
              },
            }
          );
          if (!res.ok) {
            throw new Error("Geocoding service unavailable");
          }
          const data = await res.json();
          const address = data.address || {};
          const detectedCity =
            address.city ||
            address.town ||
            address.state_district ||
            address.state ||
            "Jaipur";

          onChange(detectedCity);
        } catch {
          setDetectError("Unable to resolve city name. Falling back to default.");
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        setIsDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setDetectError("Location access denied by user.");
        } else {
          setDetectError("Location signal timed out.");
        }
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs">
        <label
          htmlFor="region-input"
          className="flex items-center gap-1.5 font-bold text-slate-700"
        >
          <MapPin className="h-3.5 w-3.5 text-cyan-600" />
          <span>Patient Region &amp; Referral Routing</span>
        </label>
        <button
          type="button"
          onClick={handleAutoDetect}
          disabled={disabled || isDetecting}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-cyan-700 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition disabled:opacity-50 shadow-sm"
          title="Auto-detect current location via browser geolocation"
        >
          {isDetecting ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-cyan-600" />
              <span>Detecting Location...</span>
            </>
          ) : (
            <>
              <Crosshair className="h-3 w-3" />
              <span>Detect My Location</span>
            </>
          )}
        </button>
      </div>

      <div className="relative">
        <input
          id="region-input"
          type="text"
          value={value}
          onChange={(e) => {
            setDetectError(null);
            onChange(e.target.value);
          }}
          disabled={disabled}
          placeholder="Enter patient referral region (e.g. Mumbai, London)..."
          className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-medium outline-none transition disabled:opacity-50 shadow-inner"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Sparkles className="h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>

      {detectError && (
        <p className="text-[11px] text-amber-700 font-medium pl-1">{detectError}</p>
      )}

      {/* Preset Hubs */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[11px] font-mono text-slate-500 mr-0.5">Quick Hubs:</span>
        {PRESET_REGIONS.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={disabled}
            onClick={() => {
              setDetectError(null);
              onChange(preset);
            }}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-medium transition ${
              value.trim().toLowerCase() === preset.toLowerCase()
                ? "bg-cyan-100 text-cyan-800 border border-cyan-400 font-bold shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}
