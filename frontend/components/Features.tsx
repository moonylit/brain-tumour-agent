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
      <div className="mb-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800">
          Features &amp; Capabilities
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Accurate MRI classification paired with transparent model interpretability.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-7 hover:shadow-md transition-shadow duration-300"
          >
            <div className="mb-5 inline-flex p-3 rounded-xl border border-slate-200 bg-slate-50">
              {feature.icon}
            </div>

            <h3 className="text-lg font-semibold text-slate-800 tracking-tight">
              {feature.title}
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}