import { Activity, ShieldCheck, Zap, Sparkles, Brain, Cpu, Crosshair } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative mx-auto flex max-w-7xl flex-col items-center justify-center px-4 sm:px-6 pt-12 pb-14 text-center">
      {/* Cyber Ambient Halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Cyber-Clinical Telemetry Pill */}
      <div className="relative inline-flex items-center gap-2.5 rounded-full border border-cyan-500/40 bg-slate-950/80 px-4 py-1.5 text-xs font-mono text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.25)] backdrop-blur-xl">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
        </span>
        <span className="font-semibold tracking-wide">AI Powered MRI Classification</span>
        <span className="text-cyan-700">•</span>
        <span className="text-slate-300">ResNet-50</span>
        <span className="text-cyan-700">•</span>
        <span className="text-emerald-400 font-bold">98.09% Precision</span>
      </div>

      {/* Main Heading with Cyber Glow */}
      <h1 className="mt-6 max-w-4xl text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.1] drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
        <span className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Brain Tumour
        </span>{" "}
        <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(6,182,212,0.4)]">
          Detector &amp; Agent
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-slate-300/90 leading-relaxed font-sans">
        Upload an MRI scan to detect brain tumours and view Grad-CAM explainability heatmaps with autonomous SerpApi medical literature and regional surgical center discovery.
      </p>

      {/* Live Animated Neural Waveform SVG */}
      <div className="mt-6 flex items-center justify-center gap-2 text-cyan-400/80 font-mono text-[11px]">
        <Activity className="h-4 w-4 animate-pulse text-cyan-400" />
        <span className="tracking-widest uppercase">Live Neural Sensor Waveform:</span>
        <svg className="w-48 h-6 stroke-cyan-400 fill-none" viewBox="0 0 200 24">
          <path
            d="M0 12 L40 12 L45 3 L50 21 L55 12 L80 12 L85 6 L90 18 L95 12 L130 12 L135 1 L140 23 L145 12 L200 12"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-emerald-400 font-bold">STABLE</span>
      </div>

      {/* Futuristic Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 z-10">
        <a
          href="#upload"
          className="tactile-button group relative inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-[0_0_30px_rgba(6,182,212,0.4)] transition hover:shadow-[0_0_45px_rgba(6,182,212,0.6)]"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 text-white">
            <Zap className="h-4 w-4 fill-current" />
          </div>
          <span className="tracking-wide">Analyze MRI Scan</span>
          <span className="text-cyan-200 group-hover:translate-x-1 transition">→</span>
        </a>

        <a
          href="#evaluation"
          className="tactile-button inline-flex items-center justify-center gap-2.5 rounded-2xl border border-slate-700/80 bg-slate-900/80 px-7 py-4 text-sm font-semibold text-slate-200 hover:text-white hover:border-cyan-500/50 hover:bg-slate-800/80 transition shadow-lg backdrop-blur-md"
        >
          <Cpu className="h-4 w-4 text-cyan-400" />
          <span>Model Benchmarks</span>
        </a>
      </div>

      {/* 4 Telemetry HUD Metric Blocks */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-5xl">
        <div className="relative rounded-2xl border border-white/[0.08] bg-slate-950/60 p-4 text-left backdrop-blur-xl shadow-lg hover:border-cyan-500/40 transition">
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="hud-corner hud-bl" />
          <div className="hud-corner hud-br" />
          <span className="font-mono text-[10px] uppercase text-cyan-400 tracking-wider">Perception Metric</span>
          <p className="mt-1 font-mono text-2xl font-bold text-white">98.09%</p>
          <span className="text-xs text-slate-400">ResNet-50 v2 Accuracy</span>
        </div>

        <div className="relative rounded-2xl border border-white/[0.08] bg-slate-950/60 p-4 text-left backdrop-blur-xl shadow-lg hover:border-cyan-500/40 transition">
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="hud-corner hud-bl" />
          <div className="hud-corner hud-br" />
          <span className="font-mono text-[10px] uppercase text-sky-400 tracking-wider">Inference Speed</span>
          <p className="mt-1 font-mono text-2xl font-bold text-white">&lt; 180ms</p>
          <span className="text-xs text-slate-400">Real-Time Heatmap Latency</span>
        </div>

        <div className="relative rounded-2xl border border-white/[0.08] bg-slate-950/60 p-4 text-left backdrop-blur-xl shadow-lg hover:border-cyan-500/40 transition">
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="hud-corner hud-bl" />
          <div className="hud-corner hud-br" />
          <span className="font-mono text-[10px] uppercase text-purple-400 tracking-wider">Explainability</span>
          <p className="mt-1 font-mono text-2xl font-bold text-white">Grad-CAM</p>
          <span className="text-xs text-slate-400">conv5_block3 Salience Overlay</span>
        </div>

        <div className="relative rounded-2xl border border-white/[0.08] bg-slate-950/60 p-4 text-left backdrop-blur-xl shadow-lg hover:border-cyan-500/40 transition">
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="hud-corner hud-bl" />
          <div className="hud-corner hud-br" />
          <span className="font-mono text-[10px] uppercase text-emerald-400 tracking-wider">Autonomous Agent</span>
          <p className="mt-1 font-mono text-2xl font-bold text-white">SerpApi</p>
          <span className="text-xs text-slate-400">PubMed &amp; Geo-Referral Tools</span>
        </div>
      </div>
    </section>
  );
}