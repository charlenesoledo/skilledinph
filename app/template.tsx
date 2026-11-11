"use client";

import { MotionConfig, motion, useReducedMotion } from "motion/react";

// Each page fades and rises in on route change. MotionConfig makes every Motion animation in the app
// follow the viewer's reduced-motion setting.
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
