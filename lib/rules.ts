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
