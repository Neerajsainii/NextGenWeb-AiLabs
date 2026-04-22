export type TestimonialItem = {
  id: number;
  name: string;
  company: string;
  review: string;
  initials: string;
  rating: number;
};

export const testimonials: TestimonialItem[] = [
  {
    id: 1,
    name: "Arjun Mehta",
    company: "LexAI Ventures",
    review:
      "NextGen Web & AI Labs transformed our legal workflow with their AI search tool.",
    initials: "AM",
    rating: 5
  },
  {
    id: 2,
    name: "Sarah Johnson",
    company: "DataFlow Inc.",
    review: "Delivered our SaaS MVP in 6 weeks with zero compromises on quality.",
    initials: "SJ",
    rating: 5
  },
  {
    id: 3,
    name: "Rohan Kapoor",
    company: "FinSphere",
    review: "Their cloud migration saved us 40% in infrastructure costs.",
    initials: "RK",
    rating: 5
  },
  {
    id: 4,
    name: "Emily Zhang",
    company: "RetailSoft",
    review:
      "Incredible UI/UX and blazing fast performance. Our users noticed the difference.",
    initials: "EZ",
    rating: 5
  },
  {
    id: 5,
    name: "Daniel Osei",
    company: "KnowledgeBase AI",
    review:
      "Best AI integration team we have worked with. Their RAG implementation was perfect.",
    initials: "DO",
    rating: 5
  }
];
