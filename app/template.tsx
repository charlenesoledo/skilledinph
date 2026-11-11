"use client";

import { usePathname } from "next/navigation";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { DUR_MED, EASE_ENTER } from "@/lib/motion";

// Pages fade and rise in on route change, except the Board, whose only motion is the stage glide.
// MotionConfig makes every Motion animation follow the viewer's reduced-motion setting
// (transforms and layout moves are dropped; fades remain).
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const board = usePathname() === "/";
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={reduce || board ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR_MED, ease: EASE_ENTER }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
