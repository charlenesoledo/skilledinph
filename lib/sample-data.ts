// Spec Section 9 sample data. Everything here is fictional.
import { clearAll, insert } from "./db";
import type { Candidate, Employer, Job } from "./types";

export const SAMPLE_EMPLOYER_ID = "emp_tidynest";
export const SAMPLE_JOB_ID = "job_listing_checker";

// Seed assessment scores per candidate, used by the assessment step so sorting is deterministic.
export const SAMPLE_SCORES: Record<string, Record<string, number>> = {
  cand_maria: { "Price & Detail Accuracy": 90, "Taglish Tone Judgment": 85, "Reading Comprehension": 90 },
  cand_jomar: { "Price & Detail Accuracy": 55, "Taglish Tone Judgment": 50, "Reading Comprehension": 80 },
  cand_rhea: { "Price & Detail Accuracy": 20, "Taglish Tone Judgment": 25, "Reading Comprehension": 40 },
};

export async function loadSampleData() {
  await clearAll();
  const now = new Date().toISOString();

  const employer: Employer = {
    id: SAMPLE_EMPLOYER_ID, name: "TidyNest Online", contact_label: "Operations lead (fictional)", created_at: now,
  };
  await insert("employers", employer);

  // The Job Card as the employer submits it. Target skills are filled by the Job Analyzer (Step 3)
  // and pay by the rate step (Step 4), so the job starts as a draft.
  const job: Job = {
    id: SAMPLE_JOB_ID, employer_id: SAMPLE_EMPLOYER_ID, title: "Listing & Reply Checker",
    workflow_step: "Before any AI-drafted listing or chat reply is posted/sent",
    why_human: "The agent writes fast but makes price errors and uses stiff, foreign-sounding Taglish. A local human catches both.",
    tasks: "Check each AI-drafted product listing for price and detail errors. Check each AI-drafted chat reply for natural Taglish tone and that it answers the customer.",
    target_skills: [], rubric: [],
    good_example: "A listing with matching price, natural Taglish, correct product name",
    bad_example: "A listing priced ₱499 in the title but ₱449 in the body, stiff English reply",
    reserved_slots: 2, seats_taken: 0,
    rate_band_demo: null, pay_confirmed: null, pay_status: "proposed",
    deadline: "2026-12-01", tools_needed: "Smartphone with internet", status: "draft",
  };
  await insert("jobs", job);

  const people: [string, string, string][] = [
    ["cand_maria", "Maria", "Metro Manila"],
    ["cand_jomar", "Jomar", "Central Luzon"],
    ["cand_rhea", "Rhea", "Western Visayas"],
  ];
  for (const [id, display_name, location_label] of people) {
    const c: Candidate = {
      id, display_name, phone_label: "Android phone (fictional)", location_label,
      foundational_level: "Basic literacy, Taglish fluent", created_at: now,
    };
    await insert("candidates", c);
  }
}
