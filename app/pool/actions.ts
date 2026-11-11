"use server";

import { revalidatePath } from "next/cache";
import { all, get, insert, update } from "@/lib/db";
import { runAgent } from "@/lib/agents";
import { gapHours, jobGate, sortByGap } from "@/lib/rules";
import { SAMPLE_SCORES } from "@/lib/sample-data";

async function assessOne(jobId: string, candidateId: string) {
  const [job, candidate] = await Promise.all([get("jobs", jobId), get("candidates", candidateId)]);
  if (!job || !candidate) return;
  if (!jobGate(job).open) return; // HR1, enforced server-side
  const existing = (await all("assessments")).find((a) => a.job_id === jobId && a.candidate_id === candidateId);
  if (existing) return;
  // Demo: candidates' per-skill scores are the seeded values from spec Section 9.
  const scores = SAMPLE_SCORES[candidateId];
  if (!scores) return;

  const res = await runAgent("assessor", { skills: job.target_skills }, { type: "candidate", id: candidateId });
  if (!res.ok) return; // the failed run is logged; no assessment is stored

  const { total } = gapHours(scores, job.target_skills);
  const now = new Date().toISOString();
  await insert("assessments", {
    id: `asm_${crypto.randomUUID().slice(0, 8)}`, job_id: jobId, candidate_id: candidateId, items: res.output.items,
    score_per_skill: scores, total_gap_hours: total, sorting: sortByGap(total), created_at: now,
  });

  const profiles = await all("skill_profiles");
  for (const [skill, level] of Object.entries(scores)) {
    const row = profiles.find((p) => p.candidate_id === candidateId && p.skill === skill);
    if (row) await update("skill_profiles", row.id, { level, updated_at: now, source: "assessment" });
    else await insert("skill_profiles", {
      id: `sp_${crypto.randomUUID().slice(0, 8)}`, candidate_id: candidateId, skill, level, updated_at: now, source: "assessment",
    });
  }
}

export async function runAssessment(jobId: string, candidateId: string) {
  await assessOne(jobId, candidateId);
  revalidatePath("/", "layout");
}

export async function runAllAssessments(jobId: string) {
  for (const c of await all("candidates")) await assessOne(jobId, c.id);
  revalidatePath("/", "layout");
}
