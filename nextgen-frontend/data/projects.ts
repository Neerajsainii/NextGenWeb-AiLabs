export type ProjectItem = {
  id: number;
  title: string;
  category: "AI/ML" | "SaaS" | "Full Stack" | "Cloud" | "DevOps";
  description: string;
  tech: string[];
  tags: string[];
};

export const projects: ProjectItem[] = [
  {
    id: 1,
    title: "LegalMind AI",
    category: "AI/ML",
    tech: ["Python", "Django", "LangChain", "RAG", "PostgreSQL", "React", "Azure"],
    description:
      "AI legal document search and analysis platform with RAG and OCR for law firms.",
    tags: ["AI", "RAG", "LangChain", "Django", "Azure"]
  },
  {
    id: 2,
    title: "SaaS Analytics Hub",
    category: "SaaS",
    tech: ["React", "Node.js", "MongoDB", "Express", "AWS", "Chart.js"],
    description:
      "Multi-tenant analytics platform for Excel and CSV insights with real-time dashboards.",
    tags: ["SaaS", "MERN", "Analytics", "AWS"]
  },
  {
    id: 3,
    title: "CloudPulse Dashboard",
    category: "Cloud",
    tech: ["Next.js", "Django REST", "PostgreSQL", "Docker", "GitHub Actions", "GCloud"],
    description:
      "Infrastructure monitoring dashboard for deployment status and CI/CD health.",
    tags: ["DevOps", "GCloud", "Docker", "Next.js"]
  },
  {
    id: 4,
    title: "GateAdvisor",
    category: "Full Stack",
    tech: ["React", "Vite", "Django", "MongoDB", "Azure", "Razorpay"],
    description:
      "GATE preparation platform with predictors, study plans, mock tests, and subscriptions.",
    tags: ["Django", "MongoDB", "Azure", "Razorpay", "React"]
  },
  {
    id: 5,
    title: "SmartRetail AI",
    category: "AI/ML",
    tech: ["Python", "FastAPI", "LangChain", "OpenAI", "PostgreSQL", "React"],
    description:
      "AI recommendation and inventory platform for ecommerce with custom ML workflows.",
    tags: ["AI", "FastAPI", "OpenAI", "Ecommerce"]
  },
  {
    id: 6,
    title: "DeployStream CI/CD",
    category: "DevOps",
    tech: ["GitHub Actions", "Docker", "Kubernetes", "Azure", "Nginx"],
    description:
      "Automated CI/CD stack with zero-downtime deployments and rollback support.",
    tags: ["CI/CD", "GitHub Actions", "Kubernetes", "Azure"]
  }
];
