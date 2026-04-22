export type ProjectItem = {
  id: number;
  title: string;
  category: "AI/ML" | "SaaS" | "Full Stack" | "Cloud" | "DevOps";
  description: string;
  tech: string[];
  tags: string[];
  githubUrl?: string;
};

export const projects: ProjectItem[] = [
  {
    id: 1,
    title: "LegalMind AI",
    category: "AI/ML",
    tech: ["Python", "Django", "LangChain", "RAG", "PostgreSQL", "React", "Azure"],
    description:
      "AI legal document search and analysis platform with RAG and OCR for law firms.",
    tags: ["AI", "RAG", "LangChain", "Django", "Azure"],
    githubUrl: "https://github.com/Neerajsainii/JobSwipe-AI"
  },
  {
    id: 2,
    title: "SaaS Analytics Hub",
    category: "SaaS",
    tech: ["React", "Node.js", "MongoDB", "Express", "AWS", "Chart.js"],
    description:
      "Multi-tenant analytics platform for Excel and CSV insights with real-time dashboards.",
    tags: ["SaaS", "MERN", "Analytics", "AWS"],
    githubUrl: "https://github.com/Neerajsainii/BlogWebApp"
  },
  {
    id: 3,
    title: "CloudPulse Dashboard",
    category: "Cloud",
    tech: ["Next.js", "Django REST", "PostgreSQL", "Docker", "GitHub Actions", "GCloud"],
    description:
      "Infrastructure monitoring dashboard for deployment status and CI/CD health.",
    tags: ["DevOps", "GCloud", "Docker", "Next.js"],
    githubUrl: "https://github.com/Neerajsainii/live_polling_backend"
  },
  {
    id: 4,
    title: "GateAdvisor",
    category: "Full Stack",
    tech: ["React", "Vite", "Django", "MongoDB", "Azure", "Razorpay"],
    description:
      "GATE preparation platform with predictors, study plans, mock tests, and subscriptions.",
    tags: ["Django", "MongoDB", "Azure", "Razorpay", "React"],
    githubUrl: "https://github.com/Neerajsainii/Telecaller_frontend"
  },
  {
    id: 5,
    title: "SmartRetail AI",
    category: "AI/ML",
    tech: ["Python", "FastAPI", "LangChain", "OpenAI", "PostgreSQL", "React"],
    description:
      "AI recommendation and inventory platform for ecommerce with custom ML workflows.",
    tags: ["AI", "FastAPI", "OpenAI", "Ecommerce"],
    githubUrl: "https://github.com/Neerajsainii/Image-Anomaly-Detection-and-Localization"
  },
  {
    id: 6,
    title: "DeployStream CI/CD",
    category: "DevOps",
    tech: ["GitHub Actions", "Docker", "Kubernetes", "Azure", "Nginx"],
    description:
      "Automated CI/CD stack with zero-downtime deployments and rollback support.",
    tags: ["CI/CD", "GitHub Actions", "Kubernetes", "Azure"],
    githubUrl: "https://github.com/Neerajsainii/starter-gunicorn"
  },
  {
    id: 7,
    title: "JobSwipe AI",
    category: "AI/ML",
    tech: ["Python", "LLM", "Prompt Engineering", "React", "API Integrations"],
    description:
      "AI-assisted job discovery and matching platform focused on improving shortlisting accuracy and speed.",
    tags: ["AI", "Jobs", "Matching", "LLM"],
    githubUrl: "https://github.com/Neerajsainii/JobSwipe-AI"
  },
  {
    id: 8,
    title: "RealTime Chat",
    category: "Full Stack",
    tech: ["Node.js", "Express", "Socket.IO", "React", "MongoDB"],
    description:
      "Real-time chat application with live messaging, session handling, and scalable socket-based architecture.",
    tags: ["Full Stack", "Realtime", "Socket.IO", "Chat"],
    githubUrl: "https://github.com/Neerajsainii/REALTIME-CHAT"
  },
  {
    id: 9,
    title: "BlogWebApp",
    category: "SaaS",
    tech: ["React", "Node.js", "MongoDB", "Authentication"],
    description:
      "Content publishing platform for article authoring, account-based access, and manageable post workflows.",
    tags: ["SaaS", "Blog", "Content", "Auth"],
    githubUrl: "https://github.com/Neerajsainii/BlogWebApp"
  },
  {
    id: 10,
    title: "Live Polling Backend",
    category: "Cloud",
    tech: ["Node.js", "Express", "WebSockets", "REST API"],
    description:
      "Polling backend supporting near real-time updates and scalable API endpoints for interactive applications.",
    tags: ["Backend", "Realtime", "API", "Polling"],
    githubUrl: "https://github.com/Neerajsainii/live_polling_backend"
  },
  {
    id: 11,
    title: "Bank Management System",
    category: "Full Stack",
    tech: ["Java", "SQL", "Desktop UI", "Transaction Logic"],
    description:
      "Banking operations system with account management, transaction tracking, and secure data workflows.",
    tags: ["Banking", "Finance", "Full Stack", "SQL"],
    githubUrl: "https://github.com/Neerajsainii/bank_management_system"
  },
  {
    id: 12,
    title: "Hackstreet Coders Platform",
    category: "SaaS",
    tech: ["MERN", "Role-based Access", "Dashboards", "Deployments"],
    description:
      "Community-driven engineering platform with collaboration modules, user management, and workflow dashboards.",
    tags: ["SaaS", "Community", "MERN", "Dashboard"],
    githubUrl: "https://github.com/Neerajsainii/Hackstreet_coders"
  }
];
