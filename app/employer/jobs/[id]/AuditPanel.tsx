import { all } from "@/lib/db";
import { FIRST_TASK_SAMPLE } from "@/lib/sample-data";
import type { Job } from "@/lib/types";
import { rateCandidate } from "../../actions";

export default async function AuditPanel({ job }: { job: Job }) {
  const [offers, candidates, results, assessments, ratings, profiles, plans, modules] = await Promise.all([
    all("offers"), all("candidates"), all("test_results"), all("assessments"), all("ratings"), all("skill_profiles"),
    all("candidate_plans"), all("modules"),
  ]);
  const jobOffers = offers.filter((o) => o.job_id === job.id);

  // Feedback loop: an item that 3 or more candidates missed points at the module or test, not at the people.
  const jobModuleIds = new Set(modules.filter((m) => m.job_id === job.id).map((m) => m.id));
  const planOwner = new Map(plans.filter((p) => jobModuleIds.has(p.module_id)).map((p) => [p.id, p.candidate_id]));
  const missedBy = new Map<string, Set<string>>();
  for (const r of results) {
    const who = planOwner.get(r.candidate_plan_id);
    if (!who) continue;
    for (const it of r.scored_output.items)
      if (!it.correct) missedBy.set(it.prompt, (missedBy.get(it.prompt) ?? new Set()).add(who));
  }
  const flagged = [...missedBy].filter(([, who]) => who.size >= 3);

  return (
    <div className="card p-5">
      <h2 className="text-lg font-bold">Qualified candidates and audit</h2>
      <p className="mt-1 text-sm text-muted">Open a candidate to see the scored output that earned the offer.</p>

      {flagged.length > 0 && (
        <div className="mt-3 rounded-lg bg-accent/20 p-3 text-sm text-ink">
          <p className="font-semibold">Module/test may need fixing</p>
          <ul className="mt-1 list-disc pl-5">
            {flagged.map(([prompt, who]) => <li key={prompt}>{who.size} candidates missed: {prompt}</li>)}
          </ul>
        </div>
      )}

      {jobOffers.length === 0 && <p className="mt-3 text-sm text-muted">Nobody has qualified yet.</p>}

      <div className="mt-3 grid gap-2">
        {jobOffers.map((o) => {
          const c = candidates.find((x) => x.id === o.candidate_id);
          const result = results.find((r) => r.id === o.test_result_id);
          const a = assessments.find((x) => x.job_id === job.id && x.candidate_id === o.candidate_id);
          const rating = ratings.find((r) => r.job_id === job.id && r.candidate_id === o.candidate_id);
          const profile = profiles.filter((p) => p.candidate_id === o.candidate_id);
          return (
            <details key={o.id} className="rounded-lg border border-line p-3">
              <summary className="cursor-pointer">
                <span className="font-semibold">{c?.display_name}</span>
                <span className={`ml-2 rounded px-2 py-1 text-xs font-semibold ${o.guaranteed ? "bg-accent text-ink" : "bg-line text-muted"}`}>
                  {o.guaranteed ? `GUARANTEED · ${o.status}` : "WAITLIST · NOT GUARANTEED"}
                </span>
                <span className="ml-2 text-sm tabular-nums text-muted">
                  {result ? `Final test ${result.score}` : "Met every target at assessment"}
                </span>
              </summary>

              {result && (
                <p className="big-number mt-4">{result.score}<span className="ml-2 font-sans text-base font-normal text-muted">final test score</span></p>
              )}
              {result ? (
                <ol className="mt-3 grid list-decimal gap-2 pl-5 text-sm">
                  {result.scored_output.items.map((it, i) => (
                    <li key={i}>
                      {it.prompt}
                      <div>
                        Answered: {it.answer}{" "}
                        <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${it.correct ? "bg-primary/10 text-primary" : "bg-accent/30 text-ink"}`}>
                          {it.correct ? "Correct" : "Missed"}
                        </span>
                        {!it.correct && <span className="ml-2 text-primary">Key: {it.key}</span>}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-sm">
                  No module or final test was needed. Assessment scores:{" "}
                  {job.target_skills.map((s) => `${s.skill} ${a?.score_per_skill[s.skill] ?? 0}/${s.target}`).join(", ")}.
                </p>
              )}

              {o.status === "accepted" && (
                <div className="mt-4 border-t border-line pt-3 text-sm">
                  <p className="font-semibold">First task delivered (demo sample task)</p>
                  <p className="mt-1 text-muted">{FIRST_TASK_SAMPLE}</p>
                  {rating ? (
                    <p className="mt-3">
                      You rated this <b>{rating.stars} of 5</b>{rating.note ? `: “${rating.note}”` : ""}. Skill Profile now:{" "}
                      {profile.map((p) => `${p.skill} ${p.level}`).join(", ")}.
                    </p>
                  ) : (
                    <form action={rateCandidate.bind(null, job.id, o.candidate_id)} className="mt-3 grid gap-2">
                      <label className="font-medium">
                        Note (optional)
                        <input name="note" id={`note_${o.candidate_id}`} className="mt-1 block w-full card px-3 py-2" />
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">Rate the output:</span>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} name="stars" value={n} aria-label={`${n} of 5`}
                            className="h-9 w-9 rounded-lg border border-line font-semibold hover:border-muted">{n}</button>
                        ))}
                      </div>
                    </form>
                  )}
                </div>
              )}
            </details>
          );
        })}
      </div>
    </div>
  );
}
