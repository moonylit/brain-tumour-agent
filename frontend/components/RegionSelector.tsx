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
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-sm">
        <label
          htmlFor="region-input"
          className="flex items-center gap-2 font-bold text-slate-800"
        >
          <MapPin className="h-4 w-4 text-blue-600" />
          <span>Patient Region &amp; Referral Routing</span>
        </label>
        <button
          type="button"
          onClick={handleAutoDetect}
          disabled={disabled || isDetecting}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition disabled:opacity-50 shadow-xs"
          title="Auto-detect current location via browser geolocation"
        >
          {isDetecting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
              <span>Detecting...</span>
            </>
          ) : (
            <>
              <Crosshair className="h-3.5 w-3.5 text-blue-600" />
              <span>Auto-detect</span>
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
          placeholder="e.g., Jaipur, New Delhi, London, Boston"
          className="w-full bg-white border-2 border-blue-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-2xl px-4 py-3.5 text-base font-semibold text-slate-800 placeholder-slate-400 outline-none shadow-xs transition disabled:opacity-50"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Sparkles className="h-4 w-4 text-blue-400" />
        </div>
      </div>

      {detectError && (
        <p className="text-xs font-medium text-amber-700 pl-1">{detectError}</p>
      )}

      {/* Preset Hubs */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-bold text-slate-500 mr-0.5">Quick Hubs:</span>
        {PRESET_REGIONS.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={disabled}
            onClick={() => {
              setDetectError(null);
              onChange(preset);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              value.trim().toLowerCase() === preset.toLowerCase()
                ? "bg-blue-600 text-white border border-blue-600 shadow-sm"
                : "bg-blue-50/70 hover:bg-blue-100 text-blue-900 border border-blue-200/80"
            }`}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}
