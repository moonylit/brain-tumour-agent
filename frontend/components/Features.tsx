export default function Features() {
  const features = [
    {
      title: "Fast Prediction",
      description:
        "Classify brain MRI scans within milliseconds using an optimized ResNet-50 deep learning model.",
      icon: (
        <svg
          className="h-6 w-6 text-blue-600"
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
          className="h-6 w-6 text-emerald-600"
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
          className="h-6 w-6 text-indigo-600"
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
    <section id="features" className="w-full py-12">
      <div className="mb-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Features &amp; Capabilities
        </h2>
        <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
          Accurate MRI classification paired with transparent model interpretability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto mt-12 px-4">
        {features.map((feature, idx) => {
          const iconColors = [
            "bg-blue-50 border border-blue-200 text-blue-600",
            "bg-emerald-50 border border-emerald-200 text-emerald-600",
            "bg-indigo-50 border border-indigo-200 text-indigo-600",
          ];
          return (
            <div
              key={feature.title}
              className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 hover:shadow-xl transition-all"
            >
              <div className={`mb-5 inline-flex p-3.5 rounded-xl ${iconColors[idx] || iconColors[0]}`}>
                {feature.icon}
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}