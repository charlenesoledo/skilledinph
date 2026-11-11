import Link from "next/link";
import { all } from "@/lib/db";
import { jobGate } from "@/lib/rules";
import { runAllAssessments, runAssessment } from "./actions";
import { runState } from "@/lib/runs";
import AgentRunButton from "@/components/AgentRunButton";

export const dynamic = "force-dynamic";

const SORT_LABEL = { ready: "READY", trainable: "TRAINABLE", not_yet: "NOT YET" } as const;
const SORT_STYLE = { ready: "bg-emerald-100 text-emerald-900", trainable: "bg-amber-100 text-amber-900", not_yet: "bg-sky-100 text-sky-900" } as const;
const btn = "rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40";

export default async function Page() {
  const [candidates, jobs, assessments, runs, offers] = await Promise.all([
    all("candidates"), all("jobs"), all("assessments"), all("runs"), all("offers"),
  ]);
  return (
    <section>
      <h1 className="text-2xl font-bold">Candidate Pool</h1>
      <p className="mt-2 text-stone-600">All candidates are fictional demo people. Demo scores are seeded from the sample data.</p>
      {candidates.length === 0 ? (
        <p className="mt-4 text-stone-600">
          No candidates yet. <Link href="/samples" className="font-semibold underline">Load the sample data</Link>.
        </p>
      ) : (
        <>
          <ul className="mt-4 grid gap-2 text-sm">
            {jobs.map((j) => {
              const g = jobGate(j);
              return (
                <li key={j.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>
                    <Link href={`/employer/jobs/${j.id}`} className="font-semibold underline-offset-4 hover:underline">{j.title}</Link>
                    {": "}
                    <span className={g.open ? "text-emerald-800" : "font-medium text-amber-800"}>{g.reason}</span>
                  </span>
                  <form action={runAllAssessments.bind(null, j.id)}>
                    <button disabled={!g.open} className={btn}>Run all assessments</button>
                  </form>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-300 text-left text-xs uppercase tracking-wide text-stone-500">
                  <th className="py-2 pr-4">Candidate</th>
                  <th className="py-2 pr-4">Location</th>
                  {jobs.map((j) => <th key={j.id} className="py-2 pr-4">{j.title}</th>)}
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.id} className="border-b border-stone-200 align-top">
                    <td className="py-2 pr-4 font-semibold">
                      <Link href={`/candidate/${c.id}`} className="underline-offset-4 hover:underline">{c.display_name}</Link>
                    </td>
                    <td className="py-2 pr-4">{c.location_label}</td>
                    {jobs.map((j) => {
                      const a = assessments.find((x) => x.job_id === j.id && x.candidate_id === c.id);
                      const open = jobGate(j).open;
                      if (a)
                        return (
                          <td key={j.id} className="py-2 pr-4">
                            <span className={`rounded px-2 py-1 text-xs font-semibold ${SORT_STYLE[a.sorting]}`}>{SORT_LABEL[a.sorting]}</span>
                            <span className="ml-2 tabular-nums text-stone-600">
                              {a.total_gap_hours === 0 ? "no gap" : `gap ~${a.total_gap_hours} hours`}
                            </span>
                            {(() => {
                              const o = offers.find((x) => x.job_id === j.id && x.candidate_id === c.id);
                              if (!o) return null;
                              return (
                                <span className={`ml-2 rounded px-2 py-1 text-xs font-semibold ${o.guaranteed ? "bg-amber-300 text-amber-950" : "bg-stone-200 text-stone-700"}`}>
                                  {o.guaranteed ? `GUARANTEED · ${o.status}` : "WAITLIST · NOT GUARANTEED"}
                                </span>
                              );
                            })()}
                            <div className="mt-1 text-xs text-stone-500">
                              {j.target_skills.map((s) => `${s.skill.split(" ")[0]} ${a.score_per_skill[s.skill] ?? 0}/${s.target}`).join(" · ")}
                            </div>
                          </td>
                        );
                      return (
                        <td key={j.id} className="py-2 pr-4">
                          <AgentRunButton action={runAssessment.bind(null, j.id, c.id)} label="Run assessment" retryLabel="Retry assessment"
                            state={runState(runs, "assessor", c.id)} disabled={!open} variant="secondary" />
                          {!open && <div className="mt-1 text-xs text-amber-800">Assessment locked (HR1)</div>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-stone-500">
            Sorting rule: per skill below target, hours = ceil((target − current) / 25) × 2. No gap is READY, up to 12 hours is
            TRAINABLE, more than 12 is NOT YET for this job and is routed to the foundational track.
          </p>
        </>
      )}
    </section>
  );
}
