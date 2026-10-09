export default function Features() {
  const features = [
    {
      title: "Fast Prediction",
      description:
        "Classify brain MRI scans within milliseconds using an optimized ResNet-50 deep learning model.",
      icon: (
        <svg
          className="h-5 w-5 text-cyan-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
    {
      title: "Explainable AI",
      description:
        "Grad-CAM heatmaps highlight the specific anatomical regions of the MRI that informed each prediction.",
      icon: (
        <svg
          className="h-5 w-5 text-emerald-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
    {
      title: "Confidence Analysis",
      description:
        "Full softmax probability breakdown across glioma, meningioma, pituitary, and no-tumor classifications.",
      icon: (
        <svg
          className="h-5 w-5 text-violet-600"
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
      ),
    },
  ];

  return (
    <section id="features" className="w-full">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-mono font-bold text-cyan-800 mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-600" />
          <span>Clinical Architecture</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Features &amp; Capabilities
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed font-medium">
          Accurate MRI classification paired with transparent model interpretability.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {features.map((feature, idx) => {
          const gradients = [
            "from-cyan-500 to-sky-500",
            "from-emerald-500 to-teal-500",
            "from-violet-500 to-purple-500",
          ];
          const tags = ["< 180ms Latency", "Spatial Salience", "Multi-Class Softmax"];

          return (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-3xl p-7 bg-white/95 border border-slate-200/90 shadow-md shadow-slate-200/40 hover:shadow-xl hover:border-cyan-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[idx % 3]}`}
              />

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="inline-flex p-3 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm group-hover:scale-105 transition-transform">
                    {feature.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                    {tags[idx % 3]}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {feature.title}
                </h3>

                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 font-medium">
                  {feature.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Integrated Protocol</span>
                <span className="text-cyan-600 font-bold">WHO CNS-5</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}