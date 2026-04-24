"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { GlowButton } from "@/components/ui/GlowButton";

const HeroParticles = dynamic(
  () => import("@/components/three/HeroParticles").then((mod) => mod.HeroParticles),
  { ssr: false }
);

export function Hero() {
  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden pt-24 sm:min-h-screen">
      <HeroParticles />
      <div className="absolute inset-0 spotlight" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-b from-transparent via-[#050510]/70 to-[#050510]" />
      <div className="section-shell relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="mb-3 text-sm tracking-[0.2em] text-cyan-300">
            NEXTGEN WEB AI LABS
          </p>
          <h1 className="font-heading text-[clamp(2rem,9vw,3.75rem)] font-bold leading-[1.05]">
            We Build Intelligent Digital Products
          </h1>
          <p className="mx-auto mt-5 max-w-3xl px-2 text-[clamp(0.95rem,3.8vw,1.25rem)] text-textSecondary sm:px-0">
            Full-Stack Development. AI Integration. Cloud and DevOps for startups and
            enterprises that want to move fast.
          </p>
          <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a href="#projects">
              <GlowButton className="w-56 sm:w-auto">Explore Our Work</GlowButton>
            </a>
            <a href="#contact">
              <GlowButton className="w-56 border-violet-300/40 bg-violet-500/10 sm:w-auto">
                Let&apos;s Talk
              </GlowButton>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
