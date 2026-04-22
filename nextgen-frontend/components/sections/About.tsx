"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

const FloatingOrb = dynamic(
  () => import("@/components/three/FloatingOrb").then((mod) => mod.FloatingOrb),
  { ssr: false }
);

const stats = [
  { label: "Projects Delivered", value: 50, suffix: "+" },
  { label: "Happy Clients", value: 20, suffix: "+" },
  { label: "Years Experience", value: 5, suffix: "+" },
  { label: "On-Time Delivery", value: 100, suffix: "%" }
];

export function About() {
  return (
    <section id="about" className="section-shell">
      <SectionTitle title="Who We Are" />
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          className="glass-card p-6 sm:p-8"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <p className="text-textSecondary">
            NextGen Web & AI Labs is a forward-thinking software company specializing in
            AI-powered SaaS platforms, full-stack web applications, and cloud-native
            solutions. We partner with startups, SMEs, and enterprises to ship fast and
            scale smart.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 p-4">
                <p className="font-heading text-2xl text-cyan-300">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-xs text-textSecondary sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          className="glass-card p-4"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <FloatingOrb />
        </motion.div>
      </div>
    </section>
  );
}
