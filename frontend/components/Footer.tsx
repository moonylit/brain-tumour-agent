export default function Footer() {
  return (
    <footer className="mt-16 w-full border-t border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1536px] flex-col items-center justify-between gap-4 px-6 sm:px-10 py-8 text-xs font-mono text-slate-600 md:flex-row">
        <div className="flex items-center gap-2 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-600" />
          <span>© 2026 BrainTumourAI</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 font-semibold">Clinical Diagnostic Suite</span>
        </div>

        <p className="text-slate-600 font-medium">
          Built with Next.js • FastAPI • TensorFlow • ResNet50
        </p>
      </div>
    </footer>
  );
}