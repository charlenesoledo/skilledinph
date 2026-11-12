"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";
import { DUR_PROGRESS, EASE_ENTER } from "@/lib/motion";
import { useLocale, useT } from "./Locale";
import { SECTION_EN } from "@/lib/i18n/sections";
import { BookOpen, Check, FileCheck, Lock } from "lucide-react";
import { SkillLabel } from "./CandidateIcons";

export type PathSection = {
  id: string; skill: string; title: string; done: boolean; hours: number | null; href: string;
  summary: string; practiceCount: number; minutes: number | null;
};

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
    <div className="sticky top-0 z-20 -mx-6 border-b border-line bg-card/95 px-6 py-3">
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

// The module as a course: a header with total hours, section count and progress, then one row per section
// (number, title, one-line summary, what it contains, minutes, status). Finished rows are ticked, exactly one
// is "Next", later ones are locked. The final test is the last row and unlocks exactly as before.
export default function ModulePath({
  sections, retry, testUnlocked, testHref, retake, totalHours, finished = false,
}: {
  sections: PathSection[]; retry: boolean; testUnlocked: boolean; testHref: string; retake: boolean;
  totalHours: number; finished?: boolean; // finished: the final test is passed and the offer is made
}) {
  const t = useT();
  const { locale } = useLocale();
  const tr = (text: string) => (locale === "en" ? SECTION_EN[text] ?? text : text);
  const nextIndex = sections.findIndex((s) => !s.done); // -1: all sections done, so the test is next
  const doneCount = sections.filter((s) => s.done).length;
  return (
    <div className="grid gap-4 rounded-xl border border-line p-5">
      <div className="grid gap-2">
        <h3 className="flex items-center gap-2 text-lg font-bold"><BookOpen aria-hidden className="h-5 w-5 shrink-0 text-primary" />{t("courseTitle")}</h3>
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm text-muted tabular-nums">
          <span>{t("courseMeta", { hours: totalHours, count: sections.length })}</span>
          <span>{t("courseProgress", { done: doneCount, total: sections.length })}</span>
        </div>
        <span className="block h-2 overflow-hidden rounded-full bg-line" aria-hidden>
          <span className="block h-full rounded-full bg-primary" style={{ width: `${sections.length ? (doneCount / sections.length) * 100 : 0}%` }} />
        </span>
      </div>
      <ol className="grid">
        {sections.map((s, i) => {
          const state = s.done ? "done" : i === nextIndex ? "next" : "locked";
          const body = (
            <>
              {state === "next" && (
                <span className="mb-2 inline-block rounded-full bg-primary px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                  {t("next")}
                </span>
              )}
              <p className="text-sm text-muted"><SkillLabel skill={s.skill} /></p>
              <p className="font-semibold">{i + 1}. {tr(s.title)}</p>
              <p className="mt-1 text-sm">{tr(s.summary)}</p>
              <p className="mt-2 text-sm text-muted tabular-nums">
                {t("courseParts", { n: s.practiceCount })}
                {s.minutes ? ` · ${t("courseMinutes", { min: s.minutes })}` : ""}
              </p>
            </>
          );
          return (
            <Node key={s.id} state={state} last={false}>
              {state === "locked" ? (
                <div className="rounded-xl border border-line p-5 text-muted">
                  {body}
                  <p className="mt-1 flex items-center gap-1.5 text-base"><Lock aria-hidden className="h-4 w-4 shrink-0" />{t("locked")}</p>
                </div>
              ) : (
                <Link
                  href={s.href}
                  className={`card card-hover block p-5 ${state === "next" ? "border-2 border-primary" : "hover:border-muted"}`}
                >
                  {body}
                  <p className="mt-1 text-base text-muted">
                    {s.minutes ? "" : `${t("practice")} · `}
                    {s.done ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-primary"><Check aria-hidden className="h-4 w-4" strokeWidth={2.5} />{t("done").replace(/\s*✓$/, "")}</span>
                    ) : retry ? t("practiceAgain") : t("open")}
                  </p>
                </Link>
              )}
            </Node>
          );
        })}
        <Node state={finished ? "done" : testUnlocked ? "next" : "locked"} last>
          {finished ? (
            <p className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-4 text-lg font-semibold text-primary">
              <FileCheck aria-hidden className="h-5 w-5 shrink-0" />{t("courseTestPassed")}
            </p>
          ) : testUnlocked ? (
            <Link href={testHref} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-center text-lg font-semibold text-white">
              <FileCheck aria-hidden className="h-5 w-5 shrink-0" />{retake ? t("retakeTest") : t("startTest")}
            </Link>
          ) : (
            <button disabled className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-line px-4 py-4 text-center text-lg font-semibold text-muted">
              <Lock aria-hidden className="h-5 w-5 shrink-0" />{t("testLocked", { left: sections.length - doneCount })}
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
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        ) : state === "next" ? (
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
        ) : (
          <Lock className="h-3.5 w-3.5" strokeWidth={2} />
        )}
      </span>
      <div className="min-w-0">{children}</div>
    </li>
  );
}
