export default function Features() {
  const features = [
    {
      title: "Fast Prediction",
      description:
        "Classify brain MRI scans within milliseconds using an optimized ResNet-50 deep learning model.",
      icon: (
        <svg
          className="h-5 w-5 text-sky-400"
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
          className="h-5 w-5 text-emerald-400"
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
          className="h-5 w-5 text-purple-400"
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
    <section id="features" className="mx-auto max-w-7xl px-6 sm:px-8 py-20">
      <div className="mb-14 text-center">
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
          Features &amp; Capabilities
        </h2>
        <p className="mt-3 text-lg sm:text-xl text-slate-600 max-w-xl mx-auto leading-relaxed">
          Accurate MRI classification paired with transparent model interpretability.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {features.map((feature, idx) => {
          const iconColors = [
            "bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25",
            "bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25",
            "bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25",
          ];
          return (
            <div
              key={feature.title}
              className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-blue-200/80 shadow-xl shadow-blue-900/5 p-10 sm:p-12 hover:shadow-2xl hover:border-blue-400 hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`mb-6 inline-flex p-4 rounded-2xl ${iconColors[idx] || iconColors[0]}`}>
                <div className="h-6 w-6 text-white [&>svg]:h-6 [&>svg]:w-6">
                  {feature.icon}
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {feature.title}
              </h3>

              <p className="mt-3 text-base text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}