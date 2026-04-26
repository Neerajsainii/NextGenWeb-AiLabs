// "use client";

// import { motion } from "framer-motion";
// import { Star } from "lucide-react";
// // import { testimonials } from "@/data/testimonials";
// import { SectionTitle } from "@/components/ui/SectionTitle";

// export function Testimonials() {
//   return (
//     <section className="section-shell">
//       <SectionTitle title="Client Reviews" subtitle="What clients say about working with us." />
//       <motion.div
//         className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
//         drag="x"
//         dragConstraints={{ left: -320, right: 0 }}
//       >
//         {testimonials.map((item) => (
//           <article
//             key={item.id}
//             className="glass-card min-w-[85vw] max-w-[85vw] snap-center p-5 sm:min-w-[340px] sm:max-w-[340px]"
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="font-semibold">{item.name}</p>
//                 <p className="text-sm text-textSecondary">{item.company}</p>
//               </div>
//               <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-300/15 text-sm text-cyan-200">
//                 {item.initials}
//               </div>
//             </div>
//             <p className="mt-4 text-sm text-textSecondary">{item.review}</p>
//             <div className="mt-4 flex items-center gap-1 text-yellow-300">
//               {Array.from({ length: item.rating }).map((_, idx) => (
//                 <Star key={idx} className="h-4 w-4 fill-current" />
//               ))}
//             </div>
//           </article>
//         ))}
//       </motion.div>
//     </section>
//   );
// }
