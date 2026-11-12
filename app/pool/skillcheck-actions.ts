"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { all, get, insertMany, update } from "@/lib/db";
import { jobGate } from "@/lib/rules";
import { currentPack } from "@/lib/live/packs";
import { scoreSkillCheck } from "@/lib/live/scorer";
import { recordScoredCheck } from "@/lib/live/record";

// Pool → select candidates → Send Skill Check. Only an employer-approved pack can be sent, and only for an
// open job (HR1). A candidate gets one Skill Check per job.
export async function sendSkillChecks(jobId: string, form: FormData) {
  const job = await get("jobs", jobId);
  const pack = await currentPack(jobId);
  if (!job || !jobGate(job).open || pack?.status !== "employer_approved") return;
  const chosen = form.getAll("candidate").map(String);
  const [candidates, checks] = await Promise.all([all("candidates"), all("skill_checks")]);
  const now = new Date().toISOString();
  await insertMany("skill_checks", candidates
    .filter((c) => chosen.includes(c.id) && !checks.some((k) => k.job_id === jobId && k.candidate_id === c.id))
    .map((c) => ({
      id: `chk_${crypto.randomUUID().slice(0, 8)}`, job_id: jobId, candidate_id: c.id, pack_id: pack.id, status: "sent" as const,
      answers: null, scored: null, sent_at: now, submitted_at: null,
    })));
  revalidatePath("/", "layout");
}

// The candidate submits once. Code scores the answers against the approved key (blind: no name goes in),
// then the result is recorded and sorted like any assessment.
export async function submitSkillCheck(checkId: string, form: FormData) {
  const check = await get("skill_checks", checkId);
  if (!check || check.status !== "sent") return;
  const pack = await get("assessment_packs", check.pack_id);
  if (!pack || pack.status !== "employer_approved") return;
  const answers: Record<string, string[]> = {};
  for (const it of pack.items) answers[String(it.n)] = form.getAll(`t${it.n}`).map(String);
  if (pack.items.some((it) => answers[String(it.n)].length === 0)) return; // every task needs an answer
  const scored = scoreSkillCheck(pack.items, answers);
  await update("skill_checks", checkId, { status: "submitted", answers, scored, submitted_at: new Date().toISOString() });
  await recordScoredCheck(check.job_id, check.candidate_id, scored.per_skill);
  revalidatePath("/", "layout");
  redirect(`/candidate/${check.candidate_id}`);
}
