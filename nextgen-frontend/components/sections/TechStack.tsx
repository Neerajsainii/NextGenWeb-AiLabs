import { SectionTitle } from "@/components/ui/SectionTitle";

const rowOne = [
  "React",
  "Next.js",
  "Vue.js",
  "Vite",
  "Svelte",
  "Tailwind CSS",
  "Framer Motion",
  "Django",
  "FastAPI",
  "Node.js"
];

const rowTwo = [
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "LangChain",
  "OpenAI",
  "Pinecone",
  "AWS",
  "Azure",
  "GCloud",
  "Docker",
  "Kubernetes"
];

const groups = [
  "Frontend",
  "Backend",
  "Databases",
  "AI/ML",
  "Cloud",
  "DevOps",
  "Languages"
];

function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const duplicated = [...items, ...items];
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 py-3">
      <div className={`flex w-max gap-6 px-6 ${reverse ? "animate-marqueeRight" : "animate-marqueeLeft"}`}>
        {duplicated.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TechStack() {
  return (
    <section className="section-shell">
      <SectionTitle title="Tech Stack" subtitle="Technologies we ship with every day." />
      <div className="space-y-3">
        <Marquee items={rowOne} />
        <Marquee items={rowTwo} reverse />
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {groups.map((group) => (
          <span
            key={group}
            className="glass-card rounded-full px-4 py-2 text-xs text-textSecondary sm:text-sm"
          >
            {group}
          </span>
        ))}
      </div>
    </section>
  );
}
