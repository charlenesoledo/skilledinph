// Data model from spec Section 8. Status fields here are the only state the UI may use.
export type Employer = { id: string; name: string; contact_label: string; created_at: string };

export type TargetSkill = { skill: string; target: number; why?: string };
export type JobStatus = "draft" | "active" | "module_pending_approval" | "live" | "filled";
export type Job = {
  id: string; employer_id: string; title: string; workflow_step: string; why_human: string;
  tasks: string; target_skills: TargetSkill[]; rubric: string[];
  good_example: string; bad_example: string;
  reserved_slots: number; seats_taken: number;
  rate_band_demo: string | null; pay_confirmed: number | null; pay_status: "proposed" | "confirmed";
  deadline: string; tools_needed: string; status: JobStatus;
};

export type Candidate = {
  id: string; display_name: string; phone_label: string; location_label: string;
  foundational_level: string; created_at: string;
};

export type SkillProfile = {
  id: string; candidate_id: string; skill: string; level: number; updated_at: string;
  source: "assessment" | "job_rating" | "module";
};

export type KeyedItem = { skill: string; prompt: string; choices: string[]; correct_index: number };
export type Sorting = "ready" | "trainable" | "not_yet";
export type Assessment = {
  id: string; job_id: string; candidate_id: string; items: KeyedItem[];
  score_per_skill: Record<string, number>; total_gap_hours: number; sorting: Sorting; created_at: string;
};

export type ModuleSection = {
  id: string; skill: string; title: string; lesson_text: string; worked_example: string; practice_items: KeyedItem[];
};
export type Module = {
  id: string; job_id: string; version: number; sections: ModuleSection[];
  final_test: { items: KeyedItem[]; rubric: string[] };
  proposed_passing_score: number; passing_score: number;
  status: "generated" | "employer_approved" | "changes_requested"; employer_notes: string;
};

export type CandidatePlan = {
  id: string; candidate_id: string; module_id: string; assigned_sections: string[];
  personal_hours: number; progress: Record<string, boolean>;
  status: "not_started" | "in_progress" | "sections_complete" | "test_unlocked" | "passed" | "failed_once";
};

export type ScoredItem = { prompt: string; skill: string; answer: string; key: string; correct: boolean };
export type TestResult = {
  id: string; candidate_plan_id: string; answers: number[]; score: number; passed: boolean;
  scored_output: { items: ScoredItem[]; explanation: string | null };
  created_at: string;
};

export type Offer = {
  id: string; job_id: string; candidate_id: string; test_result_id: string | null;
  guaranteed: boolean; pay_confirmed: number; status: "offered" | "accepted" | "waitlisted"; created_at: string;
};

export type Rating = {
  id: string; job_id: string; candidate_id: string; employer_id: string; stars: number; note: string; created_at: string;
};

export type Run = {
  id: string; agent: string; ref_type: string; ref_id: string;
  started_at: string; finished_at: string; ok: boolean; error: string | null; mock: boolean;
};

export type Tables = {
  employers: Employer; jobs: Job; candidates: Candidate; skill_profiles: SkillProfile;
  assessments: Assessment; modules: Module; candidate_plans: CandidatePlan;
  test_results: TestResult; offers: Offer; ratings: Rating; runs: Run;
};
export type TableName = keyof Tables;
export const TABLE_NAMES: TableName[] = [
  "employers", "jobs", "candidates", "skill_profiles", "assessments", "modules",
  "candidate_plans", "test_results", "offers", "ratings", "runs",
];
