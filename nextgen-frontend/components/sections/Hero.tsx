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
    <section className="relative flex min-h-screen items-center overflow-hidden pt-24">
      <HeroParticles />
      <div className="absolute inset-0 spotlight" />
      <div className="section-shell relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="mb-3 text-sm tracking-[0.2em] text-cyan-300">
            NEXTGEN WEB & AI LABS
          </p>
          <h1 className="font-heading text-4xl font-bold leading-tight sm:text-6xl">
            We Build Intelligent Digital Products
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base text-textSecondary sm:text-xl">
            Full-Stack Development. AI Integration. Cloud and DevOps for startups and
            enterprises that want to move fast.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a href="#projects">
              <GlowButton>Explore Our Work</GlowButton>
            </a>
            <a href="#contact">
              <GlowButton className="border-violet-300/40 bg-violet-500/10">
                Let&apos;s Talk
              </GlowButton>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
