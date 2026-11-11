"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { all, get, insert, update } from "@/lib/db";
import { runAgent } from "@/lib/agents";
import type { Job } from "@/lib/types";
import { DEFAULT_RATE, RATE_TABLE, bandLabel } from "@/lib/rate-table";
import { currentModule, moduleVersions } from "@/lib/modules";
import { jobGate } from "@/lib/rules";

const text = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function createJob(form: FormData) {
  const employer = (await all("employers"))[0];
  if (!employer) throw new Error("No employer exists. Load the sample data first.");
  const slots = Math.floor(Number(form.get("reserved_slots")));
  if (!text(form, "title") || !(slots >= 1)) throw new Error("A job needs a title and at least 1 reserved slot.");

  const job: Job = {
    id: `job_${crypto.randomUUID().slice(0, 8)}`, employer_id: employer.id,
    title: text(form, "title"), workflow_step: text(form, "workflow_step"), why_human: text(form, "why_human"),
    tasks: text(form, "tasks"), target_skills: [], rubric: [],
    good_example: text(form, "good_example"), bad_example: text(form, "bad_example"),
    reserved_slots: slots, seats_taken: 0, rate_band_demo: null, pay_confirmed: null, pay_status: "proposed",
    deadline: text(form, "deadline"), tools_needed: text(form, "tools_needed"), status: "draft",
  };
  await insert("jobs", job);
  revalidatePath("/", "layout");
  redirect(`/employer/jobs/${job.id}`);
}

export async function analyzeJob(jobId: string) {
  const job = await get("jobs", jobId);
  if (!job || job.status !== "draft") return;
  const res = await runAgent(
    "job_analyzer",
    { tasks: job.tasks, why_human: job.why_human, good_example: job.good_example, bad_example: job.bad_example },
    { type: "job", id: job.id },
  );
  if (res.ok) await update("jobs", job.id, { target_skills: res.output.skills, rubric: res.output.rubric });
  revalidatePath("/", "layout");
}

export async function proposeRate(jobId: string) {
  const job = await get("jobs", jobId);
  if (!job || job.status !== "draft" || job.target_skills.length === 0) return;
  const res = await runAgent(
    "rate_research",
    { job_type: `${job.title}. ${job.tasks}`, reference_table: RATE_TABLE, default_row: DEFAULT_RATE },
    { type: "job", id: job.id },
  );
  if (res.ok) await update("jobs", job.id, { rate_band_demo: bandLabel(res.output.band_low, res.output.band_high), pay_status: "proposed" });
  revalidatePath("/", "layout");
}

// The employer confirms the final rate. Only this makes the job ACTIVE (HR1).
export async function confirmRate(jobId: string, form: FormData) {
  const job = await get("jobs", jobId);
  const pay = Math.round(Number(form.get("pay")));
  if (!job || job.status !== "draft" || !job.rate_band_demo || !(pay > 0)) return;
  await update("jobs", job.id, { pay_confirmed: pay, pay_status: "confirmed", status: "active" });
  revalidatePath("/", "layout");
}

// ---- Module Builder and the Employer Approval Gate (spec Section 6, steps 6 and 7) ----
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const scoreFrom = (form: FormData, fallback: number) => {
  const n = Math.round(Number(form.get("passing_score")));
  return form.get("passing_score") !== null && n >= 0 && n <= 100 ? n : fallback;
};

async function generateModule(job: Job, version: number, employer_notes: string) {
  const res = await runAgent(
    "module_builder",
    { title: job.title, skills: job.target_skills, rubric: job.rubric, good_example: job.good_example, bad_example: job.bad_example, employer_notes },
    { type: "job", id: job.id },
  );
  if (!res.ok) return false;
  await insert("modules", {
    id: `mod_${crypto.randomUUID().slice(0, 8)}`, job_id: job.id, version,
    sections: res.output.sections.map((s) => ({ ...s, id: `sec_${slug(s.skill)}` })),
    final_test: res.output.final_test,
    proposed_passing_score: res.output.proposed_passing_score, passing_score: res.output.proposed_passing_score,
    status: "generated", employer_notes,
  });
  return true;
}

export async function buildModule(jobId: string) {
  const job = await get("jobs", jobId);
  if (!job || !jobGate(job).open) return; // HR1: needs reserved slots and confirmed pay
  if (await currentModule(jobId)) return;
  if (await generateModule(job, 1, "")) await update("jobs", job.id, { status: "module_pending_approval" });
  revalidatePath("/", "layout");
}

export async function approveModule(jobId: string, form: FormData) {
  const [job, mod] = await Promise.all([get("jobs", jobId), currentModule(jobId)]);
  if (!job || !mod || mod.status !== "generated") return;
  await update("modules", mod.id, { passing_score: scoreFrom(form, mod.passing_score), status: "employer_approved" });
  if (job.status === "module_pending_approval") await update("jobs", job.id, { status: "live" });
  revalidatePath("/", "layout");
}

// The agent regenerates once with the employer's notes, then it is back at the gate.
export async function requestChanges(jobId: string, form: FormData) {
  const [job, versions] = await Promise.all([get("jobs", jobId), moduleVersions(jobId)]);
  const mod = versions.at(-1);
  if (!job || !mod || mod.status === "employer_approved") return;
  const alreadyRegenerated = versions.some((v) => v.status === "changes_requested" && v.id !== mod.id);
  if (alreadyRegenerated) return;
  const notes = mod.status === "changes_requested" ? mod.employer_notes : text(form, "employer_notes");
  if (!notes) return;
  if (mod.status === "generated") await update("modules", mod.id, { status: "changes_requested", employer_notes: notes });
  await generateModule(job, mod.version + 1, notes);
  revalidatePath("/", "layout");
}

// HR6: an edit after approval creates a new version. Candidates who already started keep theirs.
export async function editPassingScore(jobId: string, form: FormData) {
  const mod = await currentModule(jobId);
  if (!mod || mod.status !== "employer_approved") return;
  const passing_score = scoreFrom(form, mod.passing_score);
  if (passing_score === mod.passing_score) return;
  await insert("modules", { ...mod, id: `mod_${crypto.randomUUID().slice(0, 8)}`, version: mod.version + 1, passing_score });
  revalidatePath("/", "layout");
}

// ---- Feedback loop (spec Section 6, step 11): the employer's rating updates the Skill Profile ----
// Rule: each of the job's skills moves by (stars - 3) * 2 points, kept within 0-100.
export async function rateCandidate(jobId: string, candidateId: string, form: FormData) {
  const stars = Math.round(Number(form.get("stars")));
  const [job, offers, ratings, profiles] = await Promise.all([get("jobs", jobId), all("offers"), all("ratings"), all("skill_profiles")]);
  if (!job || !(stars >= 1 && stars <= 5)) return;
  if (!offers.some((o) => o.job_id === jobId && o.candidate_id === candidateId && o.status === "accepted")) return;
  if (ratings.some((r) => r.job_id === jobId && r.candidate_id === candidateId)) return;
  const now = new Date().toISOString();
  const skills = new Set(job.target_skills.map((s) => s.skill));
  await Promise.all([
    insert("ratings", {
      id: `rate_${crypto.randomUUID().slice(0, 8)}`, job_id: jobId, candidate_id: candidateId, employer_id: job.employer_id,
      stars, note: text(form, "note"), created_at: now,
    }),
    ...profiles
      .filter((p) => p.candidate_id === candidateId && skills.has(p.skill))
      .map((p) => update("skill_profiles", p.id, { level: Math.max(0, Math.min(100, p.level + (stars - 3) * 2)), updated_at: now, source: "job_rating" })),
  ]);
  revalidatePath("/", "layout");
}
