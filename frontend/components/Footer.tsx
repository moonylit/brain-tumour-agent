export default function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:px-8 py-8 text-xs font-mono text-slate-500 md:flex-row">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
          <span>© 2026 BrainTumourAI</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">Clinical Diagnostic Suite</span>
        </div>

        <p className="text-slate-500">
          Built with Next.js • FastAPI • TensorFlow • ResNet50
        </p>
      </div>
    </footer>
  );
}