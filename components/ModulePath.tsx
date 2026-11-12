"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";
import { DUR_PROGRESS, EASE_ENTER } from "@/lib/motion";
import { useT } from "./Locale";

export type PathSection = { id: string; skill: string; title: string; done: boolean; hours: number | null; href: string };

// Shared progress header: "Step X of Y" in words and numbers, and a bar that animates (350ms) when it changes.
// It sticks to the top of the screen while the candidate scrolls.
export function PathProgress({ planId, step, total, done, sectionsDone, sectionsTotal, record = true }: {
  planId: string; step: number; total: number; done: number; sectionsDone: number; sectionsTotal: number;
  record?: boolean; // false on a section page, so the path page still sees the change and animates it
}) {
  const reduce = useReducedMotion();
  const t = useT();
  const target = total ? done / total : 0;
  const bar = useRef<HTMLSpanElement>(null);
  // Where the bar starts for the current target. Kept in a ref so a repeated effect run (React dev mode
  // runs effects twice) animates from the same starting point instead of skipping the animation.
  const span = useRef<{ target: number; from: number } | null>(null);
  // Animate only when progress changed since this candidate last saw it (remembered per plan in this tab).
  useLayoutEffect(() => {
    const key = `orchestrator:path-progress:${planId}`;
    if (!span.current || span.current.target !== target) {
      let from = span.current ? span.current.target : target;
      try {
        const saved = sessionStorage.getItem(key);
        if (!span.current && saved !== null) from = Number(saved);
        if (record) sessionStorage.setItem(key, String(target));
      } catch {}
      span.current = { target, from };
    }
    const before = span.current.from;
    const el = bar.current;
    if (!el) return;
    if (!record || reduce || before === target) {
      el.style.transform = `scaleX(${target})`;
      return;
    }
    const controls = animate(el, { scaleX: [before, target] }, { duration: DUR_PROGRESS, ease: EASE_ENTER });
    return () => controls.stop();
  }, [planId, target, record, reduce]);
  return (
    <div className="sticky top-0 z-10 -mx-5 border-b border-line bg-card/95 px-5 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-lg font-bold tabular-nums">{t("step", { x: step, y: total })}</p>
        <p className="text-sm text-muted tabular-nums">{t("sectionsDone", { done: sectionsDone, total: sectionsTotal })}</p>
      </div>
      <span className="mt-2 block h-2 overflow-hidden rounded-full bg-line" aria-hidden>
        <span ref={bar} className="block h-full origin-left rounded-full bg-primary" style={{ transform: `scaleX(${target})` }} />
      </span>
    </div>
  );
}

// The module as one vertical path: finished steps ticked, exactly one "Next" step, later steps locked
// and named by the job task they teach. The final test is the last step.
export default function ModulePath({
  sections, retry, testUnlocked, testHref, retake,
}: {
  sections: PathSection[]; retry: boolean; testUnlocked: boolean; testHref: string; retake: boolean;
}) {
  const t = useT();
  const nextIndex = sections.findIndex((s) => !s.done); // -1: all sections done, so the test is next
  const doneCount = sections.filter((s) => s.done).length;
  return (
    <div className="grid gap-4">
      <ol className="grid">
        {sections.map((s, i) => {
          const state = s.done ? "done" : i === nextIndex ? "next" : "locked";
          return (
            <Node key={s.id} state={state} last={false}>
              {state === "locked" ? (
                <div className="rounded-xl border border-line p-4 text-muted">
                  <p className="font-semibold">{s.skill}</p>
                  <p className="mt-1 text-base">{t("locked")}</p>
                </div>
              ) : (
                <Link
                  href={s.href}
                  className={`card card-hover block p-4 ${state === "next" ? "border-2 border-primary" : "hover:border-muted"}`}
                >
                  {state === "next" && (
                    <span className="mb-2 inline-block rounded-full bg-primary px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                      {t("next")}
                    </span>
                  )}
                  <p className="text-sm text-muted">{s.skill}</p>
                  <p className="font-semibold">{s.title}</p>
                  <p className="mt-1 text-base text-muted">
                    {s.hours ? `${t("hours", { hours: s.hours })} · ` : `${t("practice")} · `}
                    {s.done ? t("done") : retry ? t("practiceAgain") : t("open")}
                  </p>
                </Link>
              )}
            </Node>
          );
        })}
        <Node state={testUnlocked ? "next" : "locked"} last>
          {testUnlocked ? (
            <Link href={testHref} className="block w-full rounded-xl bg-primary px-4 py-4 text-center text-lg font-semibold text-white">
              {retake ? t("retakeTest") : t("startTest")}
            </Link>
          ) : (
            <button disabled className="block w-full cursor-not-allowed rounded-xl bg-line px-4 py-4 text-center text-lg font-semibold text-muted">
              {t("testLocked", { left: sections.length - doneCount })}
            </button>
          )}
        </Node>
      </ol>
    </div>
  );
}

function Node({ state, last, children }: { state: "done" | "next" | "locked"; last: boolean; children: React.ReactNode }) {
  return (
    <li className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-3 pb-4">
      {!last && <span aria-hidden className={`absolute left-[13px] top-8 bottom-0 w-0.5 ${state === "done" ? "bg-primary" : "bg-line"}`} />}
      <span
        aria-hidden
        className={`relative z-10 mt-3 grid h-7 w-7 place-items-center rounded-full ${
          state === "done" ? "bg-primary text-white" : state === "next" ? "border-2 border-primary bg-card" : "border-2 border-line bg-card text-muted"
        }`}
      >
        {state === "done" ? (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 8.5l3 3 6-7" />
          </svg>
        ) : state === "next" ? (
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
        ) : (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3.5" y="7" width="9" height="6.5" rx="1" />
            <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
          </svg>
        )}
      </span>
      <div className="min-w-0">{children}</div>
    </li>
  );
}
