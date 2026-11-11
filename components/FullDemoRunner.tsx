"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { rememberPlacement } from "./BoardColumns";

// The agent runs the full demo makes, in order. The stepper paces them about 600ms apart so the
// audience can follow. Pacing is visual only: the server runs the loop once, and the last step
// is only marked done after the server has finished.
const STEPS = [
  "Job Analyzer",
  "Rate Research",
  "Assessor · Maria",
  "Assessor · Jomar",
  "Assessor · Rhea",
  "Module Builder",
  "QA Explainer",
];
const STEP_MS = 600;
const EASE = [0.16, 1, 0.3, 1] as const;

export default function FullDemoRunner({
  action, startPlacement, className,
}: {
  action: () => Promise<void>;
  startPlacement: Record<string, "Job Secured" | "Assessing">;
  className: string;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [, startTransition] = useTransition();
  const [active, setActive] = useState(-1); // index of the running step; STEPS.length = all done
  const [serverDone, setServerDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const running = active >= 0 && active < STEPS.length && !error;
  const navigated = useRef(false);

  // Advance one step at a time. Hold on the last step until the server has finished.
  useEffect(() => {
    if (active < 0 || active >= STEPS.length || error) return;
    if (active === STEPS.length - 1 && !serverDone) return;
    const t = setTimeout(() => setActive((i) => i + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [active, serverDone, error]);

  // All steps done: open the Board, starting its cards from the freshly loaded layout so they glide.
  // The page re-renders when the server action finishes, so the timer reads the latest values from
  // refs and is not cancelled by those re-renders.
  const latest = useRef({ router, startPlacement });
  latest.current = { router, startPlacement };
  useEffect(() => {
    if (active !== STEPS.length || navigated.current) return;
    navigated.current = true;
    setTimeout(() => {
      rememberPlacement(latest.current.startPlacement);
      latest.current.router.push("/");
    }, 500);
  }, [active]);

  function start() {
    setError(null);
    setServerDone(false);
    setActive(0);
    navigated.current = false;
    startTransition(async () => {
      try {
        await action();
        setServerDone(true);
      } catch {
        setError("The full demo stopped before it finished. Load the sample data and try again.");
      }
    });
  }

  return (
    <div className="grid gap-4">
      <div>
        <button type="button" onClick={start} disabled={running} className={`${className} disabled:cursor-wait disabled:opacity-60`}>
          {running ? "Running the full loop…" : "Run full demo"}
        </button>
      </div>
      <AnimatePresence>
        {active >= 0 && (
          <motion.ol
            aria-label="Agent runs in the full demo"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="card grid max-w-sm gap-0 p-5"
          >
            {STEPS.map((label, i) => {
              const state = error && i >= active ? "pending" : i < active ? "done" : i === active ? "running" : "pending";
              return (
                <li key={label} className="relative flex items-center gap-3 py-2">
                  {i < STEPS.length - 1 && (
                    <span aria-hidden className={`absolute left-[11px] top-[30px] h-[calc(100%-20px)] w-0.5 ${i < active ? "bg-primary" : "bg-line"}`} />
                  )}
                  <StepIcon state={state} reduce={!!reduce} />
                  <span className={state === "pending" ? "text-muted" : "font-medium text-ink"}>{label}</span>
                  <span className="sr-only">{state === "done" ? "done" : state === "running" ? "running" : "waiting"}</span>
                </li>
              );
            })}
            {active === STEPS.length && <li className="pt-2 text-sm font-semibold text-primary">All 7 runs done. Opening the Board…</li>}
            {error && <li className="pt-2 text-sm font-semibold text-ink">{error}</li>}
          </motion.ol>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepIcon({ state, reduce }: { state: "pending" | "running" | "done"; reduce: boolean }) {
  if (state === "done")
    return (
      <motion.span
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25, ease: EASE }}
        className="relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3.5 8.5l3 3 6-7" />
        </svg>
      </motion.span>
    );
  if (state === "running")
    return (
      <span className="relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-primary bg-card">
        <motion.span
          className="h-2.5 w-2.5 rounded-full bg-primary"
          animate={reduce ? undefined : { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut" }}
        />
      </span>
    );
  return <span className="relative z-10 h-6 w-6 shrink-0 rounded-full border-2 border-line bg-card" />;
}
