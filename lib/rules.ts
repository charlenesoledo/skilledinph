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

export const MAX_TRAINABLE_HOURS = 12;
export function sortByGap(totalGapHours: number): Sorting {
  if (totalGapHours === 0) return "ready";
  return totalGapHours <= MAX_TRAINABLE_HOURS ? "trainable" : "not_yet";
}
