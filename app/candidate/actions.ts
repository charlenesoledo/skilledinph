"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { all, get, insert, update } from "@/lib/db";
import { runAgent } from "@/lib/agents";
import { offerAfterPass, takeSeat, waitlist } from "@/lib/matcher";
import { currentModule } from "@/lib/modules";
import { MAX_TEST_ATTEMPTS, gapHours, moduleOpen, scoreTest, testUnlocked } from "@/lib/rules";

// Starting the module enrolls the candidate: it takes one training seat (HR5) and pins the plan to the
// module version that is current right now (HR6). Only possible on an employer-approved module (HR2).
export async function startPlan(candidateId: string, jobId: string) {
  const [job, mod, assessments, plans, modules, offers] = await Promise.all([
    get("jobs", jobId), currentModule(jobId), all("assessments"), all("candidate_plans"), all("modules"), all("offers"),
  ]);
  const a = assessments.find((x) => x.job_id === jobId && x.candidate_id === candidateId);
  if (!job || !a || a.sorting !== "trainable") return;
  if (!moduleOpen(mod)) return; // HR2
  if (offers.some((o) => o.job_id === jobId && o.candidate_id === candidateId)) return;
  const jobModuleIds = new Set(modules.filter((m) => m.job_id === jobId).map((m) => m.id));
  if (plans.some((p) => p.candidate_id === candidateId && jobModuleIds.has(p.module_id))) return;

  if (await takeSeat(jobId)) {
    const gap = gapHours(a.score_per_skill, job.target_skills);
    await insert("candidate_plans", {
      id: `plan_${crypto.randomUUID().slice(0, 8)}`, candidate_id: candidateId, module_id: mod.id,
      assigned_sections: mod.sections.filter((s) => s.skill in gap.per).map((s) => s.id), // gap skills only
      personal_hours: gap.total, progress: {}, status: "not_started",
    });
  } else {
    await waitlist(jobId, candidateId); // seats full: no training seat, NOT guaranteed
  }
  revalidatePath("/", "layout");
}

export async function completeSection(planId: string, sectionId: string) {
  const plan = await get("candidate_plans", planId);
  if (!plan || !plan.assigned_sections.includes(sectionId)) return;
  if (!moduleOpen(await get("modules", plan.module_id))) return; // HR2
  const progress = { ...plan.progress, [sectionId]: true };
  if (plan.status === "not_started" || plan.status === "in_progress")
    await update("candidate_plans", plan.id, { progress, status: testUnlocked({ ...plan, progress }) ? "test_unlocked" : "in_progress" });
  else if (plan.status === "failed_once") await update("candidate_plans", plan.id, { progress });
  revalidatePath("/", "layout");
  redirect(`/candidate/${plan.candidate_id}`);
}

export async function submitTest(planId: string, form: FormData) {
  const plan = await get("candidate_plans", planId);
  if (!plan) return;
  const home = `/candidate/${plan.candidate_id}`;
  const mod = await get("modules", plan.module_id); // the version this candidate started on (HR6)
  const attempts = (await all("test_results")).filter((r) => r.candidate_plan_id === plan.id).length;
  if (!moduleOpen(mod) || !testUnlocked(plan) /* HR3 */ || attempts >= MAX_TEST_ATTEMPTS ||
      (plan.status !== "test_unlocked" && plan.status !== "failed_once")) redirect(home);

  const items = mod.final_test.items;
  const raw = items.map((_, i) => form.get(`q${i}`));
  if (raw.some((v) => v === null)) redirect(home);
  const answers = raw.map(Number);

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
  revalidatePath("/", "layout");
  redirect(home);
}

export async function acceptOffer(offerId: string) {
  const offer = await get("offers", offerId);
  if (offer?.status === "offered") await update("offers", offer.id, { status: "accepted" });
  revalidatePath("/", "layout");
}
