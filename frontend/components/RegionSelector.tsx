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
          className="flex items-center gap-1.5 font-medium text-slate-300"
        >
          <MapPin className="h-3.5 w-3.5 text-cyan-400" />
          <span>Patient Region &amp; Referral Routing</span>
        </label>
        <button
          type="button"
          onClick={handleAutoDetect}
          disabled={disabled || isDetecting}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/40 transition disabled:opacity-50"
          title="Auto-detect current location via browser geolocation"
        >
          {isDetecting ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-cyan-400" />
              <span>Detecting...</span>
            </>
          ) : (
            <>
              <Crosshair className="h-3 w-3" />
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
          className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition disabled:opacity-50"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Sparkles className="h-3.5 w-3.5 text-slate-600" />
        </div>
      </div>

      {detectError && (
        <p className="text-[11px] text-amber-400/90 pl-1">{detectError}</p>
      )}

      {/* Preset Hubs */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[11px] text-slate-400 mr-0.5">Quick Hubs:</span>
        {PRESET_REGIONS.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={disabled}
            onClick={() => {
              setDetectError(null);
              onChange(preset);
            }}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition ${
              value.trim().toLowerCase() === preset.toLowerCase()
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm"
                : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}
