import { all } from "@/lib/db";
import { currentModule } from "@/lib/modules";

// Pipeline + approval summary, computed from existing state only. Before anything is assessed it shows
// zeroes and "Not assessed yet"; it never fills in numbers that are not in the data.
export default async function PipelineStrip({ jobId, compact = false }: { jobId?: string; compact?: boolean }) {
  const [allJobs, employers, allAssessments, allOffers] = await Promise.all([
    all("jobs"), all("employers"), all("assessments"), all("offers"),
  ]);
  const jobs = jobId ? allJobs.filter((j) => j.id === jobId) : allJobs;
  const ids = new Set(jobs.map((j) => j.id));
  const assessments = allAssessments.filter((a) => ids.has(a.job_id));
  const count = (s: string) => assessments.filter((a) => a.sorting === s).length;
  const accepted = allOffers.filter((o) => ids.has(o.job_id) && o.status === "accepted").length;
  const slots = jobs.reduce((n, j) => n + j.reserved_slots, 0);
  const modules = await Promise.all(jobs.map(async (j) => ({ job: j, mod: await currentModule(j.id) })));

  const stats: [string, string | number][] = [
    ["Candidates assessed", assessments.length || "Not assessed yet"],
    ["Ready", count("ready")],
    ["Trainable", count("trainable")],
    ["Not yet", count("not_yet")],
    ["Offers accepted", `${accepted} of ${slots} slots`],
  ];

  const approval = modules.map(({ job, mod }) => {
    const employer = employers.find((e) => e.id === job.employer_id)?.name ?? "the employer";
    const line = !mod
      ? "Module not built yet"
      : mod.status === "employer_approved"
        ? `Module v${mod.version} · Approved by ${employer} · Passing score ${mod.passing_score} (employer-set)`
        : mod.status === "changes_requested"
          ? `Module v${mod.version} · Changes requested by ${employer}`
          : `Module v${mod.version} · Awaiting approval by ${employer} · Proposed passing score ${mod.proposed_passing_score}`;
    return { id: job.id, title: job.title, line };
  });

  return (
    <div className={`card ${compact ? "px-4 py-3" : "p-5"}`}>
      <dl className={`flex flex-wrap gap-x-6 gap-y-2 ${compact ? "text-sm" : ""}`}>
        {stats.map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-2">
            <dt className="text-muted">{k}</dt>
            <dd className={`font-semibold tabular-nums ${compact ? "" : "font-display text-lg"}`}>{v}</dd>
          </div>
        ))}
      </dl>
      {approval.length > 0 && (
        <ul className={`mt-2 grid gap-1 border-t border-line pt-2 ${compact ? "text-xs" : "text-sm"} text-muted`}>
          {approval.map((a) => (
            <li key={a.id}>{approval.length > 1 && <span className="font-semibold text-ink">{a.title}: </span>}{a.line}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
