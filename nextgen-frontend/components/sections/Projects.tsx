"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { projects, type ProjectItem } from "@/data/projects";
import { SectionTitle } from "@/components/ui/SectionTitle";

const filters = ["All", "AI/ML", "SaaS", "Full Stack", "Cloud", "DevOps"] as const;

export function Projects() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All");
  const [selected, setSelected] = useState<ProjectItem | null>(null);

  const filteredProjects = useMemo(() => {
    if (activeFilter === "All") return projects;
    return projects.filter((project) => project.category === activeFilter);
  }, [activeFilter]);

  return (
    <section id="projects" className="section-shell">
      <SectionTitle title="Projects" subtitle="Selected work across AI, SaaS, and cloud." />
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              activeFilter === filter
                ? "bg-cyan-300/20 text-cyan-200"
                : "bg-white/5 text-textSecondary hover:bg-white/10"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <motion.div layout className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => (
            <motion.article
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card cursor-pointer p-5 transition hover:-translate-y-1"
              onClick={() => setSelected(project)}
            >
              <p className="text-xs text-cyan-300">{project.category}</p>
              <h3 className="mt-2 font-heading text-lg">{project.title}</h3>
              <p className="mt-3 text-sm text-textSecondary">{project.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-textSecondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selected ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="glass-card max-h-[80vh] w-full max-w-2xl overflow-auto p-6"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(event) => event.stopPropagation()}
            >
              <h3 className="font-heading text-2xl">{selected.title}</h3>
              <p className="mt-3 text-textSecondary">{selected.description}</p>
              <h4 className="mt-5 text-sm font-semibold text-cyan-300">Tech Stack</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {selected.tech.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-xs text-cyan-100"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <button
                className="mt-6 rounded-md border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
