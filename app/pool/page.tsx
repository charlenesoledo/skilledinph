import Link from "next/link";
import SkillBars from "@/components/SkillBars";
import PendingButton, { RUNNING_STYLE } from "@/components/PendingButton";
import { all } from "@/lib/db";
import { jobGate } from "@/lib/rules";
import { runAllAssessments, runAssessment } from "./actions";
import { runState } from "@/lib/runs";
import AgentRunButton from "@/components/AgentRunButton";
import CandidateCardBody from "@/components/CandidateCard";
import { candidateCard, candidateStage } from "@/lib/stages";
import { currentModule } from "@/lib/modules";
import type { Module } from "@/lib/types";

export const dynamic = "force-dynamic";

const SORT_LABEL = { ready: "READY", trainable: "TRAINABLE", not_yet: "NOT YET" } as const;
const SORT_STYLE = { ready: "bg-primary/10 text-primary", trainable: "bg-accent/30 text-ink", not_yet: "bg-line text-ink" } as const;
const btn = "rounded-lg border border-line px-3 py-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40";

export default async function Page() {
  const [candidates, jobs, assessments, runs, offers, employers, plans, profiles] = await Promise.all([
    all("candidates"), all("jobs"), all("assessments"), all("runs"), all("offers"), all("employers"), all("candidate_plans"), all("skill_profiles"),
  ]);
  const current = new Map<string, Module | undefined>();
  for (const j of jobs) current.set(j.id, await currentModule(j.id));
  return (
    <section>
      <h1 className="text-2xl font-bold">Candidate Pool</h1>
      <p className="mt-2 text-muted">All candidates are fictional demo people. Demo scores are seeded from the sample data.</p>
      {candidates.length === 0 ? (
        <p className="mt-4 text-muted">
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
                    <span className={g.open ? "text-primary" : "font-medium text-ink"}>{g.reason}</span>
                  </span>
                  <form action={runAllAssessments.bind(null, j.id)}>
                    <PendingButton disabled={!g.open} className={btn} label="Run all assessments" pendingLabel="Running…" pendingClassName={RUNNING_STYLE} />
                  </form>
                </li>
              );
            })}
          </ul>
          <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {candidates.map((c) => {
              const stage = candidateStage(c, { assessments, plans, offers, currentModule: current });
              return (
                <li key={c.id} className="card grid content-start gap-4 p-5">
                  <CandidateCardBody data={candidateCard(c, stage.since, { jobs, employers, assessments, profiles })} />
                  {jobs.map((j) => {
                    const a = assessments.find((x) => x.job_id === j.id && x.candidate_id === c.id);
                    const open = jobGate(j).open;
                    const o = offers.find((x) => x.job_id === j.id && x.candidate_id === c.id);
                    return (
                      <div key={j.id} className="border-t border-line pt-4 text-sm">
                        {jobs.length > 1 && <p className="mb-2 font-medium">{j.title}</p>}
                        {a ? (
                          <>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`rounded px-2 py-1 text-xs font-semibold ${SORT_STYLE[a.sorting]}`}>{SORT_LABEL[a.sorting]}</span>
                              <span className="tabular-nums text-muted">
                                {a.total_gap_hours === 0 ? "no gap" : `gap ~${a.total_gap_hours} hours`}
                              </span>
                              {o && (
                                <span className={`rounded px-2 py-1 text-xs font-semibold ${o.guaranteed ? "bg-accent text-ink" : "bg-line text-muted"}`}>
                                  {o.guaranteed ? `GUARANTEED · ${o.status}` : "WAITLIST · NOT GUARANTEED"}
                                </span>
                              )}
                            </div>
                            <SkillBars
                              skills={j.target_skills.map((s) => ({ label: s.skill.split(" ")[0], score: a.score_per_skill[s.skill] ?? 0, target: s.target }))}
                            />
                          </>
                        ) : (
                          <>
                            <AgentRunButton action={runAssessment.bind(null, j.id, c.id)} label="Run assessment" retryLabel="Retry assessment"
                              state={runState(runs, "assessor", c.id)} disabled={!open} variant="secondary" pendingLabel="Running…" />
                            {!open && <div className="mt-1 text-xs text-ink">Assessment locked (HR1)</div>}
                          </>
                        )}
                      </div>
                    );
                  })}
                  <Link href={`/candidate/${c.id}`} className="text-sm font-semibold underline underline-offset-4">Open candidate view</Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-muted">
            Sorting rule: per skill below target, hours = ceil((target − current) / 25) × 2. No gap is READY, up to 12 hours is
            TRAINABLE, more than 12 is NOT YET for this job and is routed to the foundational track.
          </p>
        </>
      )}
    </section>
  );
}
