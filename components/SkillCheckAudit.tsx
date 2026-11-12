import { all } from "@/lib/db";
import type { Job } from "@/lib/types";

// Job Review (Live): every submitted Skill Check, item by item: the answer, the points the scorer gave
// under the approved key, and the per-skill totals that fed the sorting.
export default async function SkillCheckAudit({ job }: { job: Job }) {
  const [checks, candidates, packs, assessments] = await Promise.all([
    all("skill_checks"), all("candidates"), all("assessment_packs"), all("assessments"),
  ]);
  const done = checks.filter((k) => k.job_id === job.id && k.status === "submitted" && k.scored);
  const sent = checks.filter((k) => k.job_id === job.id && k.status === "sent").length;
  return (
    <div className="card p-5">
      <h2 className="text-lg font-bold">Skill Check results (item by item)</h2>
      <p className="mt-1 text-sm text-muted">
        Scored by code against the approved key. {done.length} answered{sent ? ` · ${sent} sent, waiting for answers` : ""}.
      </p>
      {done.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No Skill Check answered yet.</p>
      ) : (
        <div className="mt-4 grid gap-5">
          {done.map((k) => {
            const name = candidates.find((c) => c.id === k.candidate_id)?.display_name ?? k.candidate_id;
            const pack = packs.find((p) => p.id === k.pack_id);
            const a = assessments.find((x) => x.job_id === job.id && x.candidate_id === k.candidate_id);
            return (
              <div key={k.id} className="grid gap-2 border-t border-line pt-4 first:border-t-0 first:pt-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">{name}</p>
                  {a && (
                    <p className="text-sm">
                      <span className="font-semibold uppercase">{a.sorting.replace("_", " ")}</span>
                      <span className="text-muted"> · gap ~{a.total_gap_hours} hours</span>
                    </p>
                  )}
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="text-muted">
                    <tr>
                      <th className="py-1 pr-2 font-medium">Task</th><th className="py-1 pr-2 font-medium">Skill</th>
                      <th className="py-1 pr-2 font-medium">Answer</th><th className="py-1 pr-2 font-medium">Key</th>
                      <th className="py-1 pr-2 font-medium">Result</th><th className="py-1 text-right font-medium">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {k.scored!.tasks.map((t) => {
                      const it = pack?.items.find((x) => x.n === t.n);
                      return (
                        <tr key={t.n} className="border-t border-line align-top">
                          <td className="py-1.5 pr-2 tabular-nums">{t.n}</td>
                          <td className="py-1.5 pr-2">{t.skill}</td>
                          <td className="py-1.5 pr-2 font-semibold">{t.answer.join(", ") || "—"}</td>
                          <td className="py-1.5 pr-2">{it ? (it.kind === "multi" ? it.correct.join(", ") : it.answer) : ""}</td>
                          <td className="py-1.5 pr-2">{t.note}</td>
                          <td className="py-1.5 text-right tabular-nums">{t.points}/{t.max}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="text-sm">
                  {Object.entries(k.scored!.per_skill).map(([skill, v]) => {
                    const target = job.target_skills.find((s) => s.skill === skill)?.target;
                    return `${skill} ${v}${target !== undefined ? `/${target}` : ""}`;
                  }).join(" · ")}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
