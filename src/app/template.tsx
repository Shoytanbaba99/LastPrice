"use client";

import { motion } from "framer-motion";

/**
 * template.tsx is a Next.js App Router convention that wraps its children
 * and re-mounts on every navigation (unlike layout.tsx).
 * This makes it the perfect place for page-level entry animations.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1], // Cinematic easing curve
      }}
      className="flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}
