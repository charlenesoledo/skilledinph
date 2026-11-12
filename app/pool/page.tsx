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
import { OFFER_ICONS, SORT_ICONS } from "@/components/CandidateIcons";
import { currentWorkspace } from "@/lib/workspace";
import { currentPack } from "@/lib/live/packs";
import { sendSkillChecks } from "./skillcheck-actions";
import type { CandidateProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

const SORT_LABEL = { ready: "READY", trainable: "TRAINABLE", not_yet: "NOT YET" } as const;
const SORT_STYLE = { ready: "bg-primary/10 text-primary", trainable: "bg-accent/30 text-ink", not_yet: "bg-line text-ink" } as const;
const btn = "rounded-lg border border-line px-3 py-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40";

// A Live pool record: background and goals, never scores.
function PoolProfile({ profile }: { profile: CandidateProfile }) {
  const rows: [string, string][] = [
    ["Background", profile.background], ["Strengths", profile.strengths], ["Device", profile.device],
    ["Availability", profile.availability], ["Goal", profile.goal],
  ];
  return (
    <dl className="grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function Page() {
  const [candidates, jobs, assessments, runs, offers, employers, plans, profiles, workspace] = await Promise.all([
    all("candidates"), all("jobs"), all("assessments"), all("runs"), all("offers"), all("employers"), all("candidate_plans"), all("skill_profiles"),
    currentWorkspace(),
  ]);
  const live = workspace === "live";
  const current = new Map<string, Module | undefined>();
  for (const j of jobs) current.set(j.id, await currentModule(j.id));
  const checks = live ? await all("skill_checks") : [];
  const packs = new Map(live ? await Promise.all(jobs.map(async (j) => [j.id, await currentPack(j.id)] as const)) : []);
  return (
    <section>
      <h1 className="text-2xl font-bold">Candidate Pool</h1>
      <p className="mt-2 text-muted">
        {live
          ? "All pool records are fictional. A record holds background and goals only: scores exist only after the person answers a Skill Check."
          : "All candidates are fictional demo people. Demo scores are seeded from the sample data."}
      </p>
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
                  {!live && (
                    <form action={runAllAssessments.bind(null, j.id)}>
                      <PendingButton disabled={!g.open} className={btn} label="Run all assessments" pendingLabel="Running…" pendingClassName={RUNNING_STYLE} />
                    </form>
                  )}
                  {live && (() => {
                    // Send Skill Check: only once the employer has approved the Assessment Pack, and only for an open job.
                    const pack = packs.get(j.id);
                    const approved = pack?.status === "employer_approved";
                    const eligible = candidates.filter((c) => !checks.some((k) => k.job_id === j.id && k.candidate_id === c.id));
                    const reason = !g.open ? "Open the job first (confirm the pay rate)."
                      : !pack ? "Generate the Assessment Pack first."
                      : !approved ? "The employer must approve the Assessment Pack first."
                      : eligible.length === 0 ? "Every pool record has a Skill Check for this job." : null;
                    return (
                      <form action={sendSkillChecks.bind(null, j.id)} className="mt-2 grid w-full gap-2 rounded-xl border border-line p-3">
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                          {eligible.map((c) => (
                            <label key={c.id} className="flex items-center gap-2">
                              <input type="checkbox" name="candidate" value={c.id} disabled={!!reason} className="h-4 w-4 accent-primary" />
                              {c.display_name}
                            </label>
                          ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <PendingButton disabled={!!reason} className={btn} label="Send Skill Check" pendingLabel="Sending…" pendingClassName={RUNNING_STYLE} />
                          {reason && <span className="text-xs text-muted">{reason}</span>}
                          {pack && (
                            <Link href={`/employer/jobs/${j.id}/pack`} className="text-xs font-semibold underline underline-offset-4">
                              Assessment Pack v{pack.version} · {approved ? "Employer-approved" : "Draft"}
                            </Link>
                          )}
                        </div>
                      </form>
                    );
                  })()}
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
                  {c.profile && <PoolProfile profile={c.profile} />}
                  {jobs.map((j) => {
                    const a = assessments.find((x) => x.job_id === j.id && x.candidate_id === c.id);
                    const open = jobGate(j).open;
                    const o = offers.find((x) => x.job_id === j.id && x.candidate_id === c.id);
                    return (
                      <div key={j.id} className="border-t border-line pt-4 text-sm">
                        {jobs.length > 1 && <p className="mb-2 font-medium">{j.title}</p>}
                        {a ? (
                          <>
                            {/* The offer badge has its own row, so it sits in the same place on every card. */}
                            {o && (() => {
                              const Icon = o.guaranteed ? OFFER_ICONS.guaranteed : OFFER_ICONS.waitlist;
                              return (
                                <p className="mb-2">
                                  <span className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold ${o.guaranteed ? "bg-accent text-ink" : "bg-line text-muted"}`}>
                                    <Icon aria-hidden className="h-3.5 w-3.5" strokeWidth={2.25} />
                                    {o.guaranteed ? `GUARANTEED · ${o.status}` : "WAITLIST · NOT GUARANTEED"}
                                  </span>
                                </p>
                              );
                            })()}
                            <div className="flex flex-wrap items-center gap-2">
                              {(() => {
                                const Icon = SORT_ICONS[a.sorting];
                                return (
                                  <span className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold ${SORT_STYLE[a.sorting]}`}>
                                    <Icon aria-hidden className="h-3.5 w-3.5" strokeWidth={2.25} />
                                    {SORT_LABEL[a.sorting]}
                                  </span>
                                );
                              })()}
                              <span className="tabular-nums text-muted">
                                {a.total_gap_hours === 0 ? "no gap" : `gap ~${a.total_gap_hours} hours`}
                              </span>
                            </div>
                            <SkillBars
                              skills={j.target_skills.map((s) => ({ label: s.skill.split(" ")[0], score: a.score_per_skill[s.skill] ?? 0, target: s.target }))}
                            />
                          </>
                        ) : live ? (
                          <p className="text-muted">
                            {checks.some((k) => k.job_id === j.id && k.candidate_id === c.id)
                              ? "Skill Check sent · waiting for the answers."
                              : "No Skill Check sent yet."}
                          </p>
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
            Sorting rule: per skill below target, hours = ceil((target − current) / 25) × 2. No gap is READY, up to 8 hours is
            TRAINABLE, more than 8 is NOT YET for this job and is routed to the foundational track.
          </p>
        </>
      )}
    </section>
  );
}
