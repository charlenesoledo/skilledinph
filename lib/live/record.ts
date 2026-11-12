// Records a scored Skill Check the same way the assessment step does (app/pool/actions.ts): an assessment
// with the per-skill scores, the standing gap-hours sorting, the READY offer, and the Skill Profile.
// The scores come only from the scorer (lib/live/scorer.ts); nothing here is typed in or seeded.
import { all, get, insert, insertMany, update } from "../db";
import { gapHours, sortByGap } from "../rules";
import { offerWithoutTraining } from "../matcher";

export async function recordScoredCheck(jobId: string, candidateId: string, scores: Record<string, number>) {
  const [job, assessments, profiles] = await Promise.all([get("jobs", jobId), all("assessments"), all("skill_profiles")]);
  if (!job) return;
  if (assessments.some((a) => a.job_id === jobId && a.candidate_id === candidateId)) return;
  const { total } = gapHours(scores, job.target_skills);
  const sorting = sortByGap(total);
  const now = new Date().toISOString();
  await insert("assessments", {
    id: `asm_${crypto.randomUUID().slice(0, 8)}`, job_id: jobId, candidate_id: candidateId, items: [],
    score_per_skill: scores, total_gap_hours: total, sorting, created_at: now,
  });
  if (sorting === "ready") await offerWithoutTraining(jobId, candidateId);
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
