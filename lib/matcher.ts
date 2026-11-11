// The Matcher's offer and seat logic (spec Section 6 step 10, HR5). Plain code, never an LLM call.
// seats_taken counts seats held on a job: guaranteed offers plus enrolled training plans that have no offer yet.
// It can never exceed reserved_slots, so every enrolled trainee who passes has a slot waiting.
import { all, get, insert, update } from "./db";
import type { Offer } from "./types";

async function insertOffer(jobId: string, candidateId: string, testResultId: string | null, guaranteed: boolean) {
  const job = (await get("jobs", jobId))!;
  const offer: Offer = {
    id: `off_${crypto.randomUUID().slice(0, 8)}`, job_id: jobId, candidate_id: candidateId, test_result_id: testResultId,
    guaranteed, pay_confirmed: job.pay_confirmed ?? 0, status: guaranteed ? "offered" : "waitlisted", created_at: new Date().toISOString(),
  };
  await insert("offers", offer);
  const guaranteedCount = (await all("offers")).filter((o) => o.job_id === jobId && o.guaranteed).length;
  if (guaranteedCount >= job.reserved_slots) await update("jobs", jobId, { status: "filled" });
  return offer;
}

const hasOffer = async (jobId: string, candidateId: string) =>
  (await all("offers")).some((o) => o.job_id === jobId && o.candidate_id === candidateId);

// Takes one seat if a reserved slot is still open. Returns false when the job is full.
export async function takeSeat(jobId: string): Promise<boolean> {
  const job = await get("jobs", jobId);
  if (!job || job.seats_taken >= job.reserved_slots) return false;
  await update("jobs", jobId, { seats_taken: job.seats_taken + 1 });
  return true;
}

// A candidate who needs no training (READY): guaranteed offer if a slot is open, otherwise waitlist.
export async function offerWithoutTraining(jobId: string, candidateId: string) {
  if (await hasOffer(jobId, candidateId)) return;
  await insertOffer(jobId, candidateId, null, await takeSeat(jobId));
}

// A trainee who passed the final test. Their seat was taken at enrollment, so the offer is guaranteed.
export async function offerAfterPass(jobId: string, candidateId: string, testResultId: string) {
  if (await hasOffer(jobId, candidateId)) return;
  await insertOffer(jobId, candidateId, testResultId, true);
}

// A trainable candidate who could not enroll because every seat is held: waitlist, NOT guaranteed.
export async function waitlist(jobId: string, candidateId: string) {
  if (await hasOffer(jobId, candidateId)) return;
  await insertOffer(jobId, candidateId, null, false);
}
