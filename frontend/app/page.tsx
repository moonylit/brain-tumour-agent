import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import UploadCard from "@/components/UploadCard";
import EvaluationCard from "@/components/EvaluationCard";
import Features from "@/components/Features";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#07090e] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Ambient background micro-grid */}
      <div
        className="pointer-events-none fixed inset-0 bg-grid-pattern opacity-60 z-0"
        aria-hidden="true"
      />

      {/* Atmospheric radial gradient spotlight */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] bg-radial-glow z-0"
        aria-hidden="true"
      />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col">
        <Navbar />
        <Hero />
        <UploadCard />
        <EvaluationCard />
        <Features />
        <Stats />
        <Footer />
      </div>
    </main>
  );
}