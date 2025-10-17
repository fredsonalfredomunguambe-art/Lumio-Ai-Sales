"use client";

import React from "react";
import {
  LumioNavbar,
  LumioHero,
  LumioSolutions,
  LumioFeatures,
  LumioTestimonials,
  MarvinAI,
  LumioFooter,
} from "@/components";

export default function Home() {
  return (
    <main className="min-h-screen">
      <LumioNavbar />
      <LumioHero />
      <LumioFeatures />
      <LumioSolutions />
      <LumioTestimonials />
      <MarvinAI />
      <LumioFooter />
    </main>
  );
}
