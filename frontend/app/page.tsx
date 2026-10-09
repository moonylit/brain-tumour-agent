"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import UploadCard from "@/components/UploadCard";
import EvaluationCard from "@/components/EvaluationCard";
import Features from "@/components/Features";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";

export default function Home() {
  const [region, setRegion] = useState("Jaipur");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/40 text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Ambient background micro-grid */}
      <div
        className="hidden"
        aria-hidden="true"
      />

      {/* Atmospheric radial gradient spotlight */}
      <div
        className="hidden"
        aria-hidden="true"
      />

      {/* Widescreen Content wrapper */}
      <div className="relative z-10 flex flex-col max-w-[1720px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-12">
        <Navbar />
        <Hero />
        <UploadCard region={region} onRegionChange={setRegion} />
        <EvaluationCard />
        <Features />
        <Stats />
        <Footer />
      </div>
    </main>
  );
}