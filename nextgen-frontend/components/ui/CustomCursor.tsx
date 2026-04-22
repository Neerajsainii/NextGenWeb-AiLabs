"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { damping: 30, stiffness: 250 });
  const sy = useSpring(y, { damping: 30, stiffness: 250 });

  useEffect(() => {
    const move = (event: MouseEvent) => {
      x.set(event.clientX - 10);
      y.set(event.clientY - 10);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      className="pointer-events-none fixed z-50 hidden h-5 w-5 rounded-full border border-cyan-300/70 bg-cyan-300/30 blur-[1px] md:block"
      style={{ x: sx, y: sy }}
    />
  );
}
