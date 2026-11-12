"use server";

import { revalidatePath } from "next/cache";
import { all, get, insert, update } from "@/lib/db";
import { PACK_SOURCES, packFor } from "@/lib/live/pack";

// Assessment Builder: drafts the Assessment Pack from the analyzed job and the employer's Knowledge Base.
// It needs both. The draft is logged as an agent run (HR7) and stays a draft until the employer approves it.
export async function generatePack(jobId: string) {
  const job = await get("jobs", jobId);
  if (!job || job.target_skills.length === 0) return;
  const kb = (await all("knowledge_bases")).find((k) => k.employer_id === job.employer_id);
  if (!kb) return;
  const items = packFor(job.target_skills.map((s) => s.skill));
  const now = new Date().toISOString();
  await insert("runs", {
    id: `run_${crypto.randomUUID().slice(0, 8)}`, agent: "assessment_builder", ref_type: "job", ref_id: jobId,
    started_at: now, finished_at: now, ok: !!items, error: items ? null : "No Knowledge Base template covers this job's skills yet.", mock: true,
  });
  if (!items) return;
  const versions = (await all("assessment_packs")).filter((p) => p.job_id === jobId);
  await insert("assessment_packs", {
    id: `pack_${crypto.randomUUID().slice(0, 8)}`, job_id: jobId, version: versions.length + 1, status: "draft",
    items, sources: `${PACK_SOURCES} · ${kb.file_name} v${kb.version}`, created_at: now, approved_at: null,
  });
  revalidatePath("/", "layout");
}

// Only the employer's approval lets the pack be sent to the pool.
export async function approvePack(packId: string) {
  const pack = await get("assessment_packs", packId);
  if (!pack || pack.status === "employer_approved") return;
  await update("assessment_packs", packId, { status: "employer_approved", approved_at: new Date().toISOString() });
  revalidatePath("/", "layout");
}
