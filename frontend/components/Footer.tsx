export default function Footer() {
  return (
    <footer className="mt-28 border-t-2 border-blue-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1720px] flex-col items-center justify-between gap-4 px-6 sm:px-10 py-10 text-sm font-mono text-slate-600 md:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shadow-sm shadow-blue-500/50" />
          <span className="font-bold text-slate-800">© 2026 CerebrAI</span>
          <span className="text-blue-300">•</span>
          <span className="text-slate-500 font-medium">Clinical Diagnostic Suite</span>
        </div>

        <p className="text-slate-500 font-medium">
          Built with Next.js • FastAPI • TensorFlow • ResNet50
        </p>
      </div>
    </footer>
  );
}