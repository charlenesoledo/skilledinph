// Deterministic rules (spec Section 12). No LLM output is ever used here.
import type { Job } from "./types";

// HR1: nothing downstream of the Job Card (assessment, module) exists for a job
// that has no reserved slots or no confirmed pay.
export function jobGate(job: Job): { open: boolean; reason: string } {
  if (job.reserved_slots < 1) return { open: false, reason: "Locked (HR1): no reserved slots" };
  if (job.pay_status !== "confirmed" || !job.pay_confirmed || job.status === "draft")
    return { open: false, reason: "Locked (HR1): pay rate not confirmed by the employer" };
  return { open: true, reason: `Open: ₱${job.pay_confirmed}/day confirmed, ${job.reserved_slots} reserved slots` };
}

// ---- The Matcher: sorting (spec Section 6, step 5). Rule-based, never an LLM call. ----
import type { Sorting, TargetSkill } from "./types";

// Gap hours, exactly as the spec gives it: per skill below target, hours = ceil((target - current) / 25) * 2.
export function gapHours(scores: Record<string, number>, targets: TargetSkill[]) {
  const per: Record<string, number> = {};
  let total = 0;
  for (const t of targets) {
    const current = scores[t.skill] ?? 0;
    if (current < t.target) {
      per[t.skill] = Math.ceil((t.target - current) / 25) * 2;
      total += per[t.skill];
    }
  }
  return { per, total };
}

export const MAX_TRAINABLE_HOURS = 8;
export function sortByGap(totalGapHours: number): Sorting {
  if (totalGapHours === 0) return "ready";
  return totalGapHours <= MAX_TRAINABLE_HOURS ? "trainable" : "not_yet";
}

// HR2: a candidate can only start a module whose status is EMPLOYER-APPROVED.
import type { Module } from "./types";
export function moduleOpen(module: Module | undefined): module is Module {
  return module?.status === "employer_approved";
}

// HR3: the final test unlocks only when every assigned section is complete.
import type { CandidatePlan } from "./types";
export function testUnlocked(plan: CandidatePlan): boolean {
  return plan.assigned_sections.length > 0 && plan.assigned_sections.every((id) => plan.progress[id] === true);
}

// HR4: final-test scoring is deterministic, against the employer-approved answer key stored with the module.
import type { KeyedItem, ScoredItem } from "./types";
export function scoreTest(items: KeyedItem[], answers: number[]): { score: number; items: ScoredItem[] } {
  const scored = items.map((it, i) => ({
    prompt: it.prompt, skill: it.skill, answer: it.choices[answers[i]] ?? "(no answer)",
    key: it.choices[it.correct_index], correct: answers[i] === it.correct_index,
  }));
  const right = scored.filter((s) => s.correct).length;
  return { score: items.length ? Math.round((right / items.length) * 100) : 0, items: scored };
}
export const MAX_TEST_ATTEMPTS = 2; // the first try plus one retake
