"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { all, get, insert, update } from "@/lib/db";
import { takeSeat, waitlist } from "@/lib/matcher";
import { completeSectionCore, submitTestCore } from "@/lib/training";
import { currentModule } from "@/lib/modules";
import { gapHours, moduleOpen } from "@/lib/rules";

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
  const candidateId = await completeSectionCore(planId, sectionId);
  revalidatePath("/", "layout");
  if (candidateId) redirect(`/candidate/${candidateId}`);
}

export async function submitTest(planId: string, form: FormData) {
  const plan = await get("candidate_plans", planId);
  const count = (await get("modules", plan?.module_id ?? ""))?.final_test.items.length ?? 0;
  const raw = Array.from({ length: count }, (_, i) => (form.get(`q${i}`) === null ? null : Number(form.get(`q${i}`))));
  const candidateId = await submitTestCore(planId, raw);
  revalidatePath("/", "layout");
  if (candidateId) redirect(`/candidate/${candidateId}`);
}

export async function acceptOffer(offerId: string) {
  const offer = await get("offers", offerId);
  if (offer?.status === "offered") await update("offers", offer.id, { status: "accepted" });
  revalidatePath("/", "layout");
}
