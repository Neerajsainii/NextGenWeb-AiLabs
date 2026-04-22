"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  Cloud,
  Database,
  Layers,
  Mail,
  PlugZap,
  Rocket,
  Sparkles
} from "lucide-react";
import { services } from "@/data/services";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const iconMap = {
  brain: BrainCircuit,
  rocket: Rocket,
  layers: Layers,
  cloud: Cloud,
  database: Database,
  mail: Mail,
  sparkles: Sparkles,
  plug: PlugZap
};

export function Services() {
  return (
    <section id="services" className="section-shell">
      <SectionTitle
        title="Services"
        subtitle="End-to-end engineering for AI products, SaaS platforms, and cloud systems."
      />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {services.map((service) => {
          const Icon = iconMap[service.icon as keyof typeof iconMap] ?? Sparkles;
          return (
            <motion.article
              key={service.id}
              variants={fadeInUp}
              className="glass-card group p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/50"
            >
              <Icon className="h-6 w-6 text-cyan-300 transition group-hover:rotate-6" />
              <h3 className="mt-4 font-heading text-lg">{service.title}</h3>
              <p className="mt-3 text-sm text-textSecondary">{service.description}</p>
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
}
