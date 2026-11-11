import { all } from "./db";
import type { Module } from "./types";

// A job's module history is one row per version (HR6). The current module is the highest version.
export async function moduleVersions(jobId: string): Promise<Module[]> {
  return (await all("modules")).filter((m) => m.job_id === jobId).sort((a, b) => a.version - b.version);
}
export async function currentModule(jobId: string): Promise<Module | undefined> {
  return (await moduleVersions(jobId)).at(-1);
}
