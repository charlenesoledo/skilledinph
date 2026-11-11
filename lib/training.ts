// Training and the Qualification Gate, as plain functions so both the candidate screens and the
// full-demo runner use exactly the same rules. Each returns the candidate id, or null if blocked.
import { all, get, insert, update } from "./db";
import { runAgent } from "./agents";
import { offerAfterPass } from "./matcher";
import { MAX_TEST_ATTEMPTS, moduleOpen, scoreTest, testUnlocked } from "./rules";

export async function completeSectionCore(planId: string, sectionId: string): Promise<string | null> {
  const plan = await get("candidate_plans", planId);
  if (!plan || !plan.assigned_sections.includes(sectionId)) return null;
  if (!moduleOpen(await get("modules", plan.module_id))) return plan.candidate_id; // HR2
  const progress = { ...plan.progress, [sectionId]: true };
  if (plan.status === "not_started" || plan.status === "in_progress")
    await update("candidate_plans", plan.id, { progress, status: testUnlocked({ ...plan, progress }) ? "test_unlocked" : "in_progress" });
  else if (plan.status === "failed_once") await update("candidate_plans", plan.id, { progress });
  return plan.candidate_id;
}

export async function submitTestCore(planId: string, raw: (number | null)[]): Promise<string | null> {
  const plan = await get("candidate_plans", planId);
  if (!plan) return null;
  const mod = await get("modules", plan.module_id); // the version this candidate started on (HR6)
  const attempts = (await all("test_results")).filter((r) => r.candidate_plan_id === plan.id).length;
  if (!moduleOpen(mod) || !testUnlocked(plan) /* HR3 */ || attempts >= MAX_TEST_ATTEMPTS ||
      (plan.status !== "test_unlocked" && plan.status !== "failed_once")) return plan.candidate_id;

  const items = mod.final_test.items;
  if (raw.length !== items.length || raw.some((v) => v === null || Number.isNaN(v))) return plan.candidate_id;
  const answers = raw as number[];

  // HR4: plain code decides the score and pass/fail, against the employer's key and passing score.
  const { score, items: scored } = scoreTest(items, answers);
  const passed = score >= mod.passing_score;
  const missedSkills = [...new Set(scored.filter((s) => !s.correct).map((s) => s.skill))];
  const retakeLeft = !passed && attempts + 1 < MAX_TEST_ATTEMPTS;

  // The LLM may only explain the result. If the run fails, the score stands without an explanation.
  const explained = await runAgent(
    "qa_explainer",
    { score, passing_score: mod.passing_score, passed, correct_count: scored.filter((s) => s.correct).length, total: scored.length, missed_skills: missedSkills, retake_left: retakeLeft },
    { type: "candidate", id: plan.candidate_id },
  );

  const result = await insert("test_results", {
    id: `res_${crypto.randomUUID().slice(0, 8)}`, candidate_plan_id: plan.id, answers, score, passed,
    scored_output: { items: scored, explanation: explained.ok ? explained.output.message : null },
    created_at: new Date().toISOString(),
  });

  if (passed) {
    await update("candidate_plans", plan.id, { status: "passed" });
    await offerAfterPass(mod.job_id, plan.candidate_id, result.id); // HR5: automatic, guaranteed
  } else if (retakeLeft) {
    // Targeted practice: the sections for the missed skills must be done again before the one retake.
    const practice = mod.sections.filter((s) => missedSkills.includes(s.skill)).map((s) => s.id);
    const progress = { ...plan.progress };
    for (const id of practice) progress[id] = false;
    await update("candidate_plans", plan.id, {
      status: "failed_once", progress, assigned_sections: [...new Set([...plan.assigned_sections, ...practice])],
    });
  }
  return plan.candidate_id;
}
