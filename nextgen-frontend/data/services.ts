export type ServiceItem = {
  id: number;
  title: string;
  description: string;
  icon: string;
};

export const services: ServiceItem[] = [
  {
    id: 1,
    title: "AI & ML Integration",
    description:
      "Integrate LLMs, RAG pipelines, chatbots, recommendation engines, and AI agents.",
    icon: "brain"
  },
  {
    id: 2,
    title: "SaaS Application Development",
    description:
      "Build SaaS platforms with multi-tenancy, billing, user management, and dashboards.",
    icon: "rocket"
  },
  {
    id: 3,
    title: "Full Stack Web Development",
    description:
      "Modern web applications with React, Next.js, Django, Node.js, and FastAPI.",
    icon: "layers"
  },
  {
    id: 4,
    title: "Cloud & DevOps",
    description:
      "CI/CD, containerization, and cloud deployment across AWS, Azure, and GCloud.",
    icon: "cloud"
  },
  {
    id: 5,
    title: "Database Architecture",
    description:
      "Design and optimize PostgreSQL, MySQL, MongoDB, and Redis systems for scale.",
    icon: "database"
  },
  {
    id: 6,
    title: "Email & Notification Integration",
    description:
      "Transactional emails, push notifications, and SMS alerts integrated cleanly.",
    icon: "mail"
  },
  {
    id: 7,
    title: "UI/UX Design & Frontend",
    description:
      "Accessible, fast, and polished interfaces from wireframes to production.",
    icon: "sparkles"
  },
  {
    id: 8,
    title: "API Development & Integration",
    description:
      "REST and GraphQL APIs with third-party integrations for payments and analytics.",
    icon: "plug"
  }
];
