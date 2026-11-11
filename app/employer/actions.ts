"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { all, get, insert, update } from "@/lib/db";
import { runAgent } from "@/lib/agents";
import type { Job } from "@/lib/types";
import { DEFAULT_RATE, RATE_TABLE, bandLabel } from "@/lib/rate-table";

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
