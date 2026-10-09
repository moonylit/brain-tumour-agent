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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/50 text-slate-900">
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
      <div className="relative z-10 flex flex-col max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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