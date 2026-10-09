import { Zap, Cpu } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative mx-auto flex max-w-5xl flex-col items-center justify-center px-4 sm:px-6 pt-10 pb-12 text-center">
      {/* Clinical Telemetry Pill */}
      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3.5 py-1 text-xs font-semibold text-cyan-800">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 animate-pulse" />
        <span>AI Powered MRI Classification</span>
        <span className="text-cyan-300">•</span>
        <span className="text-slate-600">ResNet-50</span>
        <span className="text-cyan-300">•</span>
        <span className="text-emerald-700 font-bold">98.09% Precision</span>
      </div>

      {/* Main Heading */}
      <h1 className="mt-5 max-w-4xl text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
        <span>Brain Tumour</span>{" "}
        <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-violet-600 bg-clip-text text-transparent">
          Detector &amp; Agent
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mt-4 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
        Upload an MRI scan to detect brain tumours and view Grad-CAM explainability heatmaps with autonomous SerpApi medical literature and regional surgical center discovery.
      </p>

      {/* Action Buttons */}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
        <a
          href="#upload"
          className="tactile-button inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:from-cyan-500 hover:to-violet-500 transition"
        >
          <Zap className="h-4 w-4" />
          <span>Analyze MRI Scan</span>
        </a>

        <a
          href="#evaluation"
          className="tactile-button inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition shadow-sm"
        >
          <Cpu className="h-4 w-4 text-cyan-600" />
          <span>Model Benchmarks</span>
        </a>
      </div>

      {/* 4 Clean Metric Blocks */}
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3.5 w-full">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Accuracy</span>
          <p className="mt-1 font-mono text-2xl font-black text-slate-900">98.09%</p>
          <span className="text-xs text-slate-500">ResNet-50 v2</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Speed</span>
          <p className="mt-1 font-mono text-2xl font-black text-slate-900">&lt; 180ms</p>
          <span className="text-xs text-slate-500">Inference Latency</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Explainability</span>
          <p className="mt-1 font-mono text-2xl font-black text-slate-900">Grad-CAM</p>
          <span className="text-xs text-slate-500">conv5_block3 Heatmap</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Agent</span>
          <p className="mt-1 font-mono text-2xl font-black text-slate-900">SerpApi</p>
          <span className="text-xs text-slate-500">PubMed &amp; Maps Referrals</span>
        </div>
      </div>
    </section>
  );
}