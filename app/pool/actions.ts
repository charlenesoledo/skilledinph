"use server";

import { revalidatePath } from "next/cache";
import { all, get, insert, insertMany, update } from "@/lib/db";
import { runAgent } from "@/lib/agents";
import { gapHours, jobGate, sortByGap } from "@/lib/rules";
import { SAMPLE_SCORES } from "@/lib/sample-data";
import { offerWithoutTraining } from "@/lib/matcher";

async function assessOne(jobId: string, candidateId: string) {
  const [job, candidate, assessments] = await Promise.all([get("jobs", jobId), get("candidates", candidateId), all("assessments")]);
  if (!job || !candidate) return;
  if (!jobGate(job).open) return; // HR1, enforced server-side
  const existing = assessments.find((a) => a.job_id === jobId && a.candidate_id === candidateId);
  if (existing) return;
  // Demo: candidates' per-skill scores are the seeded values from spec Section 9.
  const scores = SAMPLE_SCORES[candidateId];
  if (!scores) return;

  const res = await runAgent("assessor", { skills: job.target_skills }, { type: "candidate", id: candidateId });
  if (!res.ok) return; // the failed run is logged; no assessment is stored

  const { total } = gapHours(scores, job.target_skills);
  const now = new Date().toISOString();
  const [, profiles] = await Promise.all([
    insert("assessments", {
      id: `asm_${crypto.randomUUID().slice(0, 8)}`, job_id: jobId, candidate_id: candidateId, items: res.output.items,
      score_per_skill: scores, total_gap_hours: total, sorting: sortByGap(total), created_at: now,
    }),
    all("skill_profiles"),
  ]);

  // READY skips training and goes straight to the offer (spec Section 6, step 5).
  if (sortByGap(total) === "ready") await offerWithoutTraining(jobId, candidateId);

  // Skill Profile: update rows that exist, add the rest in one insert.
  const mine = profiles.filter((p) => p.candidate_id === candidateId);
  const entries = Object.entries(scores);
  await Promise.all([
    ...entries.flatMap(([skill, level]) => {
      const row = mine.find((p) => p.skill === skill);
      return row ? [update("skill_profiles", row.id, { level, updated_at: now, source: "assessment" })] : [];
    }),
    insertMany("skill_profiles", entries.filter(([skill]) => !mine.some((p) => p.skill === skill)).map(([skill, level]) => ({
      id: `sp_${crypto.randomUUID().slice(0, 8)}`, candidate_id: candidateId, skill, level, updated_at: now, source: "assessment" as const,
    }))),
  ]);
}

export async function runAssessment(jobId: string, candidateId: string) {
  await assessOne(jobId, candidateId);
  revalidatePath("/", "layout");
}

export async function runAllAssessments(jobId: string) {
  for (const c of await all("candidates")) await assessOne(jobId, c.id);
  revalidatePath("/", "layout");
}
