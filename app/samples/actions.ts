"use server";

import { revalidatePath } from "next/cache";
import { all, clearAll, get, getFailNext, setFailNext } from "@/lib/db";
import { SAMPLE_JOB_ID, addFourthCandidate, loadSampleData } from "@/lib/sample-data";
import { currentModule } from "@/lib/modules";
import { completeSectionCore, submitTestCore } from "@/lib/training";
import { analyzeJob, approveModule, buildModule, confirmRate, proposeRate, rateCandidate } from "../employer/actions";
import { runAllAssessments } from "../pool/actions";
import { acceptOffer, startPlan } from "../candidate/actions";

export async function loadSamples() {
  await loadSampleData();
  revalidatePath("/", "layout");
}

export async function resetSamples() {
  await clearAll();
  await setFailNext(false);
  revalidatePath("/", "layout");
}

export async function addFourth() {
  await addFourthCandidate();
  revalidatePath("/", "layout");
}

export async function toggleFailNext() {
  await setFailNext(!(await getFailNext()));
  revalidatePath("/", "layout");
}

const form = (key: string, value: string) => {
  const f = new FormData();
  f.set(key, value);
  return f;
};

// Steps the sample job through the whole loop with no manual data entry, using the same actions
// and rules as the screens. An agent step that fails is retried once (HR7).
export async function runFullDemo() {
  await loadSampleData();
  const J = SAMPLE_JOB_ID;
  const job = async () => (await get("jobs", J))!;

  await analyzeJob(J);
  if ((await job()).target_skills.length === 0) await analyzeJob(J);
  await proposeRate(J);
  if (!(await job()).rate_band_demo) await proposeRate(J);
  await confirmRate(J, form("pay", "600"));

  await runAllAssessments(J);
  if ((await all("assessments")).length < (await all("candidates")).length) await runAllAssessments(J);

  await buildModule(J);
  if (!(await currentModule(J))) await buildModule(J);
  await approveModule(J, form("passing_score", "80"));

  await startPlan("cand_jomar", J);
  const plan = (await all("candidate_plans")).find((p) => p.candidate_id === "cand_jomar");
  const mod = plan && (await get("modules", plan.module_id));
  if (plan && mod) {
    for (const sectionId of plan.assigned_sections) await completeSectionCore(plan.id, sectionId);
    await submitTestCore(plan.id, mod.final_test.items.map((it) => it.correct_index));
  }

  for (const o of await all("offers")) if (o.status === "offered") await acceptOffer(o.id);
  await rateCandidate(J, "cand_jomar", form("stars", "5"));
  revalidatePath("/", "layout");
}
