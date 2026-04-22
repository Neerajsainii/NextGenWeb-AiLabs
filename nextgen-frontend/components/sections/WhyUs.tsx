import { SectionTitle } from "@/components/ui/SectionTitle";

const items = [
  {
    title: "Fast Delivery",
    description: "Agile sprints and MVP launches in weeks, not months."
  },
  {
    title: "Production-Grade",
    description: "Secure, scalable architecture from day one."
  },
  {
    title: "AI-First Thinking",
    description: "AI is architected into the product core, not bolted on."
  },
  {
    title: "End-to-End Service",
    description: "Design, development, deployment, and maintenance in one flow."
  }
];

export function WhyUs() {
  return (
    <section className="section-shell">
      <SectionTitle title="Why Choose Us" />
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.title} className="glass-card p-6">
            <h3 className="font-heading text-lg">{item.title}</h3>
            <p className="mt-2 text-sm text-textSecondary">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
