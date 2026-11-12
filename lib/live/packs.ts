import { all } from "../db";
import type { AssessmentPack } from "../types";

// The current (latest) Assessment Pack for a job, if any.
export async function currentPack(jobId: string): Promise<AssessmentPack | undefined> {
  return (await all("assessment_packs")).filter((p) => p.job_id === jobId).sort((a, b) => a.version - b.version).at(-1);
}
