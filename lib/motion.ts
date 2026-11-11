// The app's only motion tokens, mirrored from app/globals.css for Motion (JS) animations.
// Only transform and opacity animate. Under prefers-reduced-motion, MotionConfig (app/template.tsx)
// drops transform and layout animation, and components show final values at once; fades remain.
export const EASE_STANDARD = [0.2, 0, 0, 1] as const;
export const EASE_ENTER = [0.05, 0.7, 0.1, 1] as const;
export const DUR_FAST = 0.15;
export const DUR_MED = 0.3;
export const DUR_PROGRESS = 0.35;
// Two count-ups the design allows outside the tokens: a Board number changing while the page is open,
// and the one-time offer reveal.
export const COUNT_CHANGE_MS = 250;
export const COUNT_REVEAL_MS = 700;
