// Which Board stage each candidate is in, plus the facts their card shows. Shared by the Board and
// the Pool so both always agree. Pure reads of existing data; nothing here changes state.
import type { Assessment, Candidate, CandidatePlan, Employer, Job, Module, Offer, SkillProfile } from "./types";
import { moduleOpen, testUnlocked } from "./rules";

export type StageColumn = "Assessing" | "Training" | "Awaiting Employer Approval" | "Offered" | "off";
export type CandidateStage = {
  column: StageColumn;
  step: string;
  tone?: "guaranteed" | "waitlist";
  since: string; // when the candidate entered this stage, as best the data records it
};

export type CandidateCardData = {
  id: string;
  name: string;
  initials: string;
  location: string;
  jobTitle: string | null;
  employerName: string | null;
  pay: number | null; // confirmed ₱ per day
  skillsMet: number | null; // null = not assessed yet
  skillsTotal: number;
  day: number; // day in the current stage, starting at 1
};

type Tables = {
  assessments: Assessment[];
  plans: CandidatePlan[];
  offers: Offer[];
  currentModule: Map<string, Module | undefined>;
};

// Same rules the Board has always used, in the same order.
export function candidateStage(c: Candidate, t: Tables): CandidateStage {
  const a = t.assessments.find((x) => x.candidate_id === c.id);
  const o = t.offers.find((x) => x.candidate_id === c.id);
  if (o)
    return o.guaranteed
      ? { column: "Offered", step: `GUARANTEED · ${o.status} · ₱${o.pay_confirmed}/day`, tone: "guaranteed", since: o.created_at }
      : { column: "Offered", step: "WAITLIST · NOT GUARANTEED", tone: "waitlist", since: o.created_at };
  if (!a) return { column: "Assessing", step: "Not assessed yet", since: c.created_at };
  if (a.sorting === "ready") return { column: "Assessing", step: "READY · no gap · offer is the next step", since: a.created_at };
  if (a.sorting === "trainable") {
    // The data has no timestamp for starting a module, so training days count from the assessment.
    const plan = t.plans.find((p) => p.candidate_id === c.id);
    const doneCount = plan ? plan.assigned_sections.filter((s) => plan.progress[s]).length : 0;
    if (plan)
      return {
        column: "Training",
        step: testUnlocked(plan) ? "Sections complete · final test unlocked" : `Training · ${doneCount}/${plan.assigned_sections.length} sections · ~${plan.personal_hours} hours`,
        since: a.created_at,
      };
    if (moduleOpen(t.currentModule.get(a.job_id)))
      return { column: "Training", step: `TRAINABLE · module ~${a.total_gap_hours} hours · module open, not started`, since: a.created_at };
    return { column: "Awaiting Employer Approval", step: `TRAINABLE · gap ~${a.total_gap_hours} hours · waiting for an approved module`, since: a.created_at };
  }
  return { column: "off", step: "Foundational track", since: a.created_at };
}

const DAY_MS = 24 * 60 * 60 * 1000;
export const dayInStage = (since: string, now = Date.now()) => Math.max(1, Math.floor((now - Date.parse(since)) / DAY_MS) + 1);

const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";

export function candidateCard(
  c: Candidate,
  since: string,
  d: { jobs: Job[]; employers: Employer[]; assessments: Assessment[]; profiles: SkillProfile[] },
): CandidateCardData {
  const a = d.assessments.find((x) => x.candidate_id === c.id);
  // The job the card talks about: the one the candidate was assessed for, else the first open job.
  const job = d.jobs.find((j) => j.id === a?.job_id) ?? d.jobs.find((j) => j.pay_status === "confirmed") ?? d.jobs[0];
  const employer = job ? d.employers.find((e) => e.id === job.employer_id) : undefined;
  const targets = job?.target_skills ?? [];
  let skillsMet: number | null = null;
  if (a && targets.length) {
    // Current Skill Profile levels (updated by employer ratings), falling back to the assessment scores.
    const level = (skill: string) =>
      d.profiles.find((p) => p.candidate_id === c.id && p.skill === skill)?.level ?? a.score_per_skill[skill] ?? 0;
    skillsMet = targets.filter((s) => level(s.skill) >= s.target).length;
  }
  return {
    id: c.id,
    name: c.display_name,
    initials: initialsOf(c.display_name),
    location: c.location_label,
    jobTitle: job?.title ?? null,
    employerName: employer?.name ?? null,
    pay: job?.pay_status === "confirmed" ? job.pay_confirmed : null,
    skillsMet,
    skillsTotal: targets.length,
    day: dayInStage(since),
  };
}
