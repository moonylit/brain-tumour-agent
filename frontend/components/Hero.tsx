export default function Hero() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
      {/* Subtle Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span>AI Powered MRI Classification</span>
        <span className="text-slate-400">•</span>
        <span className="font-mono text-[11px] text-slate-500">ResNet-50</span>
      </div>

      {/* Main Heading */}
      <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-4 leading-tight">
        Brain Tumour Detector
      </h1>

      {/* Subtitle */}
      <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Upload an MRI scan to detect brain tumours and view Grad-CAM explainability heatmaps.
      </p>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <a
          href="#upload"
          className="btn-primary inline-flex items-center justify-center gap-2.5 px-8 py-4 text-lg font-semibold rounded-xl transition-all hover:scale-105 shadow-md hover:shadow-lg text-white"
        >
          <svg
            className="h-5 w-5 text-sky-200"
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
          className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl transition-all hover:scale-105 shadow-md hover:shadow-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
        >
          <svg
            className="h-5 w-5 text-slate-500"
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