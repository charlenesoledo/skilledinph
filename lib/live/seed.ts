// Starting records for the Live workspace, from the files in live-build/ (all fictitious).
// The employer with its Knowledge Base, the TidyNest job as a draft, and the 6 pool records.
// Pool records hold background and goals only: nobody has taken a Skill Check yet, so there are no scores.
import { all, clearAll, insert, insertMany } from "../db";
import type { Candidate, CandidateProfile, Job } from "../types";
import { KB_TIDYNEST, KB_TIDYNEST_FILE } from "./kb-tidynest";

export const LIVE_EMPLOYER_ID = "live_emp_tidynest";
export const LIVE_JOB_ID = "live_job_listing_checker";

const POOL: { id: string; name: string; location: string; profile: CandidateProfile }[] = [
  { id: "live_cand_maria", name: "Maria Santos", location: "Metro Manila", profile: {
    background: "41, solo parent of two. Eight years as a public-market vendor; sells via Facebook on the side.",
    education: "High school graduate.",
    strengths: "Mental math with prices, talks to customers all day, very careful with sukli.",
    device: "Android phone, home Wi-Fi + mobile data.",
    availability: "6–8 hours/day, mornings preferred.",
    goal: "Steady online work she can do from home → Senior Checker → Online Store Assistant.",
  } },
  { id: "live_cand_jomar", name: "Jomar Reyes", location: "Central Luzon", profile: {
    background: "26, former warehouse picker. Left school to work.",
    education: "Finished Grade 10.",
    strengths: "Fast reader of labels and lists, careful with quantities, shy in chat but writes clearly.",
    device: "Android phone, prepaid data.",
    availability: "Full-time, any shift.",
    goal: "First regular online job → Listing Checker → Virtual Assistant.",
  } },
  { id: "live_cand_rhea", name: "Rhea Villanueva", location: "Western Visayas", profile: {
    background: "23, young solo mom. Helps in a sari-sari store.",
    education: "—",
    strengths: "Warm with customers, patient; numbers and written instructions are still hard.",
    device: "Shared Android phone (evenings), sari-sari store Wi-Fi.",
    availability: "Part-time, evenings.",
    goal: "Foundational Track first → Listing Checker later, at her pace.",
  } },
  { id: "live_cand_paolo", name: "Paolo Aquino", location: "CALABARZON", profile: {
    background: "31, former delivery rider.",
    education: "Senior high school graduate.",
    strengths: "Knows addresses and routes, careful with delivery fees and COD totals.",
    device: "Android phone, stable data.",
    availability: "Full-time.",
    goal: "Listing Checker → Senior Checker.",
  } },
  { id: "live_cand_liza", name: "Liza Gomez", location: "Metro Manila", profile: {
    background: "35, former factory worker; runs a small online ukay page.",
    education: "—",
    strengths: "Writes product posts daily; prices carefully; replies can sound rushed when busy.",
    device: "Android phone + borrowed laptop on weekends.",
    availability: "4–6 hours/day.",
    goal: "Listing Checker → Online Store Assistant.",
  } },
  { id: "live_cand_carlo", name: "Carlo Dizon", location: "Central Visayas", profile: {
    background: "29, former construction helper. Reads slowly but works hard.",
    education: "Elementary graduate.",
    strengths: "Follows step-by-step instructions well when they are visual; honest about what he doesn't understand.",
    device: "Android phone, mobile data.",
    availability: "Full-time.",
    goal: "Foundational Track → warehouse/dispatch support roles later.",
  } },
];

// Call only while the current workspace is "live" (see app/workspace-actions.ts).
export async function loadLiveRecords() {
  await clearAll();
  const now = new Date().toISOString();
  const job: Job = {
    id: LIVE_JOB_ID, employer_id: LIVE_EMPLOYER_ID, title: "Listing & Reply Checker",
    workflow_step: "Before any AI-drafted listing or chat reply is posted/sent",
    why_human: "The agent writes fast but makes price errors and uses stiff, foreign-sounding Taglish. A local human catches both.",
    tasks: "Check each AI-drafted product listing for price and detail errors. Check each AI-drafted chat reply for natural Taglish tone and that it answers the customer.",
    target_skills: [], rubric: [],
    good_example: "Storage Box 45L | 45×32×28 cm | TidyNest — ₱499. Stackable, with lid. Colors: white, gray, beige.",
    bad_example: "Storage Box SALE ₱449!!! 6 pcs available, glass material (old price, wrong claim, shouting)",
    reserved_slots: 2, seats_taken: 0,
    rate_band_demo: null, pay_confirmed: null, pay_status: "proposed",
    deadline: "2026-12-01", tools_needed: "Smartphone with internet", status: "draft",
  };
  await Promise.all([
    insert("employers", { id: LIVE_EMPLOYER_ID, name: "TidyNest Online", contact_label: "Owner (fictional)", created_at: now }),
    insert("jobs", job),
    insert("knowledge_bases", {
      id: "live_kb_tidynest", employer_id: LIVE_EMPLOYER_ID, file_name: KB_TIDYNEST_FILE, kind: "md", body: KB_TIDYNEST,
      version: 1, updated_at: now,
    }),
    insertMany("candidates", POOL.map(({ id, name, location, profile }): Candidate => ({
      id, display_name: name, phone_label: profile.device, location_label: location,
      foundational_level: profile.education, created_at: now, profile,
    }))),
  ]);
}

export async function liveIsEmpty() {
  return (await all("employers")).length === 0;
}
