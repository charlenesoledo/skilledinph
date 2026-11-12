// Learning layer (display only). Layer A is the job module itself; Layer B is optional growth units
// built from the same Knowledge Base. Nothing here affects a gap, a score, sorting, or the final-test lock.

// Which part of the employer's Knowledge Base each job skill's section is built from.
export const SKILL_SOURCE: Record<string, string> = {
  "Price & Detail Accuracy": "Product catalog",
  "Taglish Tone Judgment": "Tone guide",
  "Prompt Judgment": "AI instructions",
};

export const GROWTH_UNITS = [
  { key: "ecommerce", title_en: "E-commerce basics", title_tl: "Basics ng e-commerce", minutes: 45, source: "Workflow SOPs" },
  { key: "care", title_en: "Customer care: handling unhappy buyers", title_tl: "Customer care: pag-aasikaso sa buyer na hindi masaya", minutes: 40, source: "Tone guide" },
  { key: "ai", title_en: "Working with AI: giving clear instructions", title_tl: "Pagtatrabaho kasama ang AI: malinaw na utos", minutes: 30, source: "AI instructions" },
] as const;

// The learning layer is written for the TidyNest Listing & Reply Checker job, in either workspace.
// (Ids written out here, not imported, because client components import this file.)
export const hasLearningLayer = (jobId: string) => jobId === "job_listing_checker" || jobId === "live_job_listing_checker";

export const SKILL_PATH = ["Listing Checker", "Senior Checker", "Online Store Assistant", "Virtual Assistant"] as const;
