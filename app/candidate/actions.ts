"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { all, get, insert, update } from "@/lib/db";
import { currentModule } from "@/lib/modules";
import { gapHours, moduleOpen, testUnlocked } from "@/lib/rules";

// Starting the module creates the candidate's plan and pins it to the module version
// that is current right now (HR6). Only possible on an employer-approved module (HR2).
export async function startPlan(candidateId: string, jobId: string) {
  const [job, mod, assessments, plans, modules] = await Promise.all([
    get("jobs", jobId), currentModule(jobId), all("assessments"), all("candidate_plans"), all("modules"),
  ]);
  const a = assessments.find((x) => x.job_id === jobId && x.candidate_id === candidateId);
  if (!job || !a || a.sorting !== "trainable") return;
  if (!moduleOpen(mod)) return; // HR2
  const jobModuleIds = new Set(modules.filter((m) => m.job_id === jobId).map((m) => m.id));
  if (plans.some((p) => p.candidate_id === candidateId && jobModuleIds.has(p.module_id))) return;

  const gap = gapHours(a.score_per_skill, job.target_skills);
  await insert("candidate_plans", {
    id: `plan_${crypto.randomUUID().slice(0, 8)}`, candidate_id: candidateId, module_id: mod.id,
    assigned_sections: mod.sections.filter((s) => s.skill in gap.per).map((s) => s.id), // gap skills only
    personal_hours: gap.total, progress: {}, status: "not_started",
  });
  revalidatePath("/", "layout");
}

export async function completeSection(planId: string, sectionId: string) {
  const plan = await get("candidate_plans", planId);
  if (!plan || !plan.assigned_sections.includes(sectionId)) return;
  if (!moduleOpen(await get("modules", plan.module_id))) return; // HR2
  if (plan.status === "not_started" || plan.status === "in_progress") {
    const next = { ...plan, progress: { ...plan.progress, [sectionId]: true } };
    await update("candidate_plans", plan.id, { progress: next.progress, status: testUnlocked(next) ? "test_unlocked" : "in_progress" });
  }
  revalidatePath("/", "layout");
  redirect(`/candidate/${plan.candidate_id}`);
}
