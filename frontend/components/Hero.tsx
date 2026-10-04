export default function Hero() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
      {/* Subtle Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1 text-xs font-medium text-slate-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span>AI Powered MRI Classification</span>
        <span className="text-slate-600">•</span>
        <span className="font-mono text-[11px] text-slate-400">ResNet-50</span>
      </div>

      {/* Main Heading */}
      <h1 className="mt-6 max-w-3xl text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
        Brain Tumour Detector
      </h1>

      {/* Subtitle */}
      <p className="mt-4 max-w-xl text-base sm:text-lg text-slate-400 leading-relaxed">
        Upload an MRI scan to detect brain tumours and view Grad-CAM explainability heatmaps.
      </p>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <a
          href="#upload"
          className="btn-primary inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-semibold text-white"
        >
          <svg
            className="h-4 w-4 text-sky-200"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Analyze MRI Scan</span>
        </a>

        <a
          href="#evaluation"
          className="btn-secondary inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-medium text-slate-300"
        >
          <svg
            className="h-4 w-4 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <span>Model Benchmarks</span>
        </a>
      </div>
    </section>
  );
}