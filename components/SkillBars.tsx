"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCountUp } from "./useCountUp";
import { DUR_PROGRESS, EASE_ENTER } from "@/lib/motion";

type Skill = { label: string; score: number; target: number };

// Assessment scores per skill. Bars grow from 0 to the score (scaleX, so only transform animates),
// the numbers count up, and a tick marks the employer's target.
export default function SkillBars({ skills, delay = 0 }: { skills: Skill[]; delay?: number }) {
  return (
    <div className="mt-3 grid min-w-[220px] gap-2">
      {skills.map((s, i) => (
        <Bar key={s.label} skill={s} delay={delay + i * 0.06} />
      ))}
    </div>
  );
}

function Bar({ skill, delay }: { skill: Skill; delay: number }) {
  const reduce = useReducedMotion();
  const shown = useCountUp(skill.score, DUR_PROGRESS * 1000, delay * 1000);
  const met = skill.score >= skill.target;
  return (
    <div className="grid grid-cols-[64px_minmax(0,1fr)_56px] items-center gap-2 text-xs">
      <span className="text-muted">{skill.label}</span>
      <span className="relative h-2 overflow-hidden rounded-full bg-line" aria-hidden>
        <motion.span
          className={`absolute inset-0 origin-left rounded-full ${met ? "bg-primary" : "bg-accent"}`}
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: skill.score / 100 }}
          transition={{ duration: DUR_PROGRESS, ease: EASE_ENTER, delay }}
        />
        <span className="absolute inset-y-[-2px] w-0.5 bg-ink" style={{ left: `${skill.target}%` }} />
      </span>
      <span className="text-right tabular-nums" aria-label={`${skill.score} of target ${skill.target}`}>
        <b className="font-display text-sm">{shown}</b>
        <span className="text-muted">/{skill.target}</span>
      </span>
    </div>
  );
}
