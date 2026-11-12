"use client";

import { useEffect, useRef, useState } from "react";
import BoardColumns, { type BoardCard } from "./BoardColumns";
import BoardStats, { type BoardStatsData } from "./BoardStats";

// Present Mode (Demo Board): a staged walk through the same outcomes the data already holds.
// It only changes what is drawn; the data is untouched. Off by default: the Board shows the real data.
const STEPS = [
  "Step 0 · The employer secures a real job",
  "Step 1 · Three candidates take the Skill Check",
  "Step 2 · The module is built — waiting for the employer",
  "Step 3 · Sorted: Maria READY, Jomar trains, Rhea NOT YET",
  "Step 4 · Offers: Maria and Jomar GUARANTEED · accepted",
];
const AUTO_MS = 2000;

function staged(step: number, cards: BoardCard[], stats: BoardStatsData) {
  const job = cards.find((c) => c.column === "Job Secured")!;
  const person = (key: string) => cards.find((c) => c.key === key)!;
  const [maria, jomar, rhea] = [person("cand_maria"), person("cand_jomar"), person("cand_rhea")];
  const pay = job.pay ?? stats.payLow;
  const slots = job.seats?.slots ?? stats.seatsTotal;
  const filled = step >= 4 ? slots : 0;
  const jobCard: BoardCard = {
    ...job, seats: { taken: filled, slots },
    step: `Status: ${step >= 4 ? "filled" : "active"} · ₱${pay}/day · Seats ${filled}/${slots}`,
  };
  const out: BoardCard[] = [jobCard];
  if (step === 2)
    out.push({ key: "present_module", column: "Awaiting Employer Approval", title: "Module v1", sub: job.title, step: "Module built — waiting for employer", href: job.href });
  if (step >= 1 && step <= 2) {
    for (const c of [maria, jomar, rhea]) out.push({ ...c, column: "Assessing", step: "Skill Check answered · being sorted", tone: undefined });
  }
  if (step === 3) {
    out.push({ ...maria, column: "Assessing", step: "READY · no gap · offer is the next step", tone: undefined });
    out.push({ ...jomar, column: "Training", step: "TRAINABLE · module ~4 hours · in training", tone: undefined });
    out.push({ ...rhea, column: "Assessing", step: "NOT YET · Foundational Track", tone: undefined });
  }
  if (step >= 4) {
    out.push({ ...maria, column: "Offered", step: `GUARANTEED · accepted · ₱${pay}/day`, tone: "guaranteed" });
    out.push({ ...jomar, column: "Offered", step: `GUARANTEED · accepted · ₱${pay}/day`, tone: "guaranteed" });
    out.push({ ...rhea, column: "off" });
  }
  const s: BoardStatsData = {
    jobsSecured: 1, seatsTaken: filled, seatsTotal: slots, payLow: pay, payHigh: pay, guaranteedOffers: step >= 4 ? 2 : 0,
  };
  return { cards: out, stats: s, foundational: step >= 4 ? [rhea.title] : [] };
}

export default function PresentBoard({ cards, stats, foundational }: { cards: BoardCard[]; stats: BoardStatsData; foundational: string[] }) {
  const [step, setStep] = useState<number | null>(null);
  const [auto, setAuto] = useState(false);
  const ready = cards.some((c) => c.column === "Job Secured") && ["cand_maria", "cand_jomar", "cand_rhea"].every((k) => cards.some((c) => c.key === k));
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!auto) return;
    timer.current = setInterval(() => {
      setStep((s) => {
        const next = s === null ? 0 : Math.min(s + 1, STEPS.length - 1);
        if (next === STEPS.length - 1) setAuto(false);
        return next;
      });
    }, AUTO_MS);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [auto]);

  const view = step !== null && ready ? staged(step, cards, stats) : { cards, stats, foundational };
  const btn = "rounded-lg border border-line px-3 py-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold">Present Mode</span>
        <button type="button" className={btn} disabled={!ready || step === STEPS.length - 1}
          onClick={() => { setAuto(false); setStep((s) => (s === null ? 0 : Math.min(s + 1, STEPS.length - 1))); }}>
          Next step ▸
        </button>
        <button type="button" className={btn} disabled={!ready} aria-pressed={auto}
          onClick={() => { if (!auto && step === STEPS.length - 1) setStep(0); setAuto((a) => !a); }}>
          {auto ? "Pause" : "Auto-play"}
        </button>
        <button type="button" className={btn} disabled={step === null} onClick={() => { setAuto(false); setStep(null); }}>
          Reset
        </button>
        <span className="text-sm text-muted" aria-live="polite">
          {!ready ? "Run the full demo first to present it." : step === null ? "Showing the live data." : STEPS[step]}
        </span>
      </div>
      <BoardStats stats={view.stats} />
      <BoardColumns cards={view.cards} />
      {view.foundational.length > 0 && (
        <p className="text-sm text-muted">
          Routed to the foundational track for now: {view.foundational.join(", ")}. No offer on this job yet, and the door stays open.
        </p>
      )}
    </>
  );
}
