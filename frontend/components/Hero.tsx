import { Zap, Cpu, ShieldCheck, Layers, Compass, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-4 sm:px-6 pt-6 pb-6 text-center">
      {/* Clinical Telemetry Pill */}
      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-xs font-semibold text-cyan-800 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-cyan-600 animate-pulse" />
        <span>AI Powered MRI Classification</span>
        <span className="text-cyan-300">•</span>
        <span className="text-slate-600 font-medium">ResNet-50</span>
        <span className="text-cyan-300">•</span>
        <span className="text-emerald-700 font-bold">98.09% Precision</span>
      </div>

      {/* Main Heading */}
      <h1 className="mt-6 max-w-4xl text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
        <span>Brain Tumour</span>{" "}
        <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-violet-600 bg-clip-text text-transparent">
          Detector &amp; Agent
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mt-4 max-w-3xl text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
        Upload an MRI scan to detect brain tumours and view Grad-CAM explainability heatmaps with autonomous SerpApi medical literature and regional surgical center discovery.
      </p>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <a
          href="#upload"
          className="tactile-button inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-violet-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-600/25 hover:shadow-xl hover:shadow-cyan-600/35 transition"
        >
          <Zap className="h-4 w-4" />
          <span>Analyze MRI Scan</span>
          <ArrowRight className="h-4 w-4" />
        </a>

        <a
          href="#evaluation"
          className="tactile-button inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition shadow-sm"
        >
          <Cpu className="h-4 w-4 text-cyan-600" />
          <span>Model Benchmarks</span>
        </a>
      </div>

      {/* 4 Sleek High-Tech Metric Cards */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full">
        {/* Block 1: Accuracy */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-5 text-left shadow-md shadow-slate-200/40 hover:shadow-xl hover:border-cyan-300 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-sky-500" />
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100/70 border border-cyan-200 px-2.5 py-0.5 text-[10px] font-mono font-bold text-cyan-800">
              Validated
            </span>
          </div>
          <span className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Accuracy
          </span>
          <p className="mt-1 font-mono text-3xl font-black tracking-tight text-slate-900">
            98.09%
          </p>
          <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
            <span>ResNet-50 v2</span>
            <span className="font-mono text-[11px] text-cyan-700 font-bold">25.6M Params</span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 w-[98%]" />
          </div>
        </div>

        {/* Block 2: Speed */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-5 text-left shadow-md shadow-slate-200/40 hover:shadow-xl hover:border-amber-300 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-emerald-500" />
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-600 shadow-sm">
              <Zap className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/70 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-800">
              Real-Time
            </span>
          </div>
          <span className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Speed
          </span>
          <p className="mt-1 font-mono text-3xl font-black tracking-tight text-slate-900">
            &lt; 180ms
          </p>
          <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
            <span>Inference Latency</span>
            <span className="font-mono text-[11px] text-emerald-700 font-bold">Edge Optimized</span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 w-[92%]" />
          </div>
        </div>

        {/* Block 3: Explainability */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-5 text-left shadow-md shadow-slate-200/40 hover:shadow-xl hover:border-violet-300 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500" />
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 border border-violet-200 text-violet-600 shadow-sm">
              <Layers className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100/70 border border-violet-200 px-2.5 py-0.5 text-[10px] font-mono font-bold text-violet-800">
              Salience
            </span>
          </div>
          <span className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Explainability
          </span>
          <p className="mt-1 font-mono text-3xl font-black tracking-tight text-slate-900">
            Grad-CAM
          </p>
          <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
            <span>conv5_block3 Heatmap</span>
            <span className="font-mono text-[11px] text-violet-700 font-bold">Jet Colormap</span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 w-[95%]" />
          </div>
        </div>

        {/* Block 4: Autonomous Agent */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-5 text-left shadow-md shadow-slate-200/40 hover:shadow-xl hover:border-sky-300 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-cyan-500" />
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 border border-sky-200 text-sky-600 shadow-sm">
              <Compass className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100/70 border border-sky-200 px-2.5 py-0.5 text-[10px] font-mono font-bold text-sky-800">
              Grounded
            </span>
          </div>
          <span className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Agent
          </span>
          <p className="mt-1 font-mono text-3xl font-black tracking-tight text-slate-900">
            SerpApi
          </p>
          <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
            <span>PubMed &amp; Maps Referrals</span>
            <span className="font-mono text-[11px] text-sky-700 font-bold">Geo-Referral</span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 w-[88%]" />
          </div>
        </div>
      </div>
    </section>
  );
}