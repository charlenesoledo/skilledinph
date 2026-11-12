import { notFound } from "next/navigation";
import { all, get } from "@/lib/db";
import { analyzeJob, confirmRate, proposeRate } from "../../actions";
import ModulePanel from "./ModulePanel";
import AuditPanel from "./AuditPanel";
import SourcesPanel from "@/components/SourcesPanel";
import PipelineStrip from "@/components/PipelineStrip";
import KnowledgeBaseCard from "@/components/KnowledgeBaseCard";
import { currentWorkspace } from "@/lib/workspace";
import TargetBar from "@/components/TargetBar";
import SkillBars from "@/components/SkillBars";
import AgentRunButton from "@/components/AgentRunButton";
import { runState } from "@/lib/runs";
import { CircleCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await get("jobs", id);
  if (!job) notFound();
  const employer = await get("employers", job.employer_id);
  const runs = (await all("runs")).filter((r) => r.ref_type === "job" && r.ref_id === job.id);
  const [assessments, candidates] = await Promise.all([all("assessments"), all("candidates")]);
  const assessed = assessments
    .filter((a) => a.job_id === job.id)
    .map((a) => ({ name: candidates.find((c) => c.id === a.candidate_id)?.display_name ?? a.candidate_id, scores: a.score_per_skill }));
  const lastAnalyzer = runs.filter((r) => r.agent === "job_analyzer").at(-1);
  const band = job.rate_band_demo?.match(/₱(\d+)–₱(\d+)/);
  const suggested = band ? Math.round((Number(band[1]) + Number(band[2])) / 2 / 50) * 50 : undefined;

  const card: [string, string][] = [
    ["Employer", employer?.name ?? ""], ["Workflow step", job.workflow_step], ["Why a human", job.why_human],
    ["Tasks", job.tasks], ["Good output", job.good_example], ["Bad output", job.bad_example],
    ["Reserved slots", `${job.reserved_slots} (${job.seats_taken} taken)`], ["Deadline", job.deadline], ["Tools needed", job.tools_needed],
  ];

  return (
    <section className="grid gap-8">
      <div>
        <p className="text-sm text-muted">Job Review</p>
        <h1 className="text-2xl font-bold">{job.title}</h1>
        <p className="mt-1 text-sm"><span className="rounded bg-line px-2 py-1 font-mono text-xs uppercase">{job.status}</span></p>
      </div>
      <PipelineStrip jobId={job.id} compact />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-lg font-bold">Human Job Card</h2>
          <dl className="mt-3 grid grid-cols-[minmax(100px,150px)_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
            {card.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-bold">Skill breakdown</h2>
          {job.target_skills.length > 0 ? (
            <>
              <p className="mt-1 text-sm text-muted">Your scorecard: each skill against the target you set.</p>
              <div className="mt-4 grid gap-4">
                {job.target_skills.map((s) => (
                  <TargetBar key={s.skill} label={s.skill} target={s.target} note={s.why} />
                ))}
              </div>
              {assessed.length > 0 && (
                <div className="mt-6 border-t border-line pt-4">
                  <h3 className="text-sm font-semibold">Candidate results against your targets</h3>
                  <div className="mt-2 grid gap-4">
                    {assessed.map(({ name, scores }) => (
                      <div key={name}>
                        <p className="text-sm font-medium">{name}</p>
                        <SkillBars skills={job.target_skills.map((s) => ({ label: s.skill.split(" ")[0], score: scores[s.skill] ?? 0, target: s.target }))} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <h3 className="mt-4 text-sm font-semibold">Draft quality rubric</h3>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted">
                {job.rubric.map((r) => <li key={r}>{r}</li>)}
              </ul>
              {lastAnalyzer?.mock && <p className="mt-3 text-xs text-ink">Mock Mode: built-in sample output.</p>}
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted">The Job Analyzer breaks this Job Card into skills with target levels and a draft rubric.</p>
              <div className="mt-3">
                <AgentRunButton action={analyzeJob.bind(null, job.id)} label="Run Job Analyzer" retryLabel="Retry Job Analyzer"
                  state={runState(runs, "job_analyzer", job.id)} />
              </div>
            </>
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-bold">Pay rate</h2>
          {job.target_skills.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Run the Job Analyzer first. Rate Research uses the analyzed job.</p>
          ) : !job.rate_band_demo ? (
            <>
              <p className="mt-2 text-sm text-muted">Rate Research proposes a pay band for this job type from the built-in reference table.</p>
              <div className="mt-3">
                <AgentRunButton action={proposeRate.bind(null, job.id)} label="Run Rate Research" retryLabel="Retry Rate Research"
                  state={runState(runs, "rate_research", job.id)} />
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted">Proposed band</p>
              {(() => {
                const m = job.rate_band_demo.match(/₱(\d+)–₱(\d+)\/day\s*(.*)$/);
                return m ? (
                  <div className="mt-1">
                    <p className="big-number">₱{m[1]}–₱{m[2]}<span className="ml-1 font-sans text-base font-normal text-muted">/day</span></p>
                    <p className="mt-2 w-fit rounded-md bg-accent px-2 py-1 text-xs font-semibold uppercase tracking-wide text-ink">{m[3].replace(/[()]/g, "")}</p>
                  </div>
                ) : <p>{job.rate_band_demo}</p>;
              })()}
              {job.pay_status === "confirmed" ? (
                <div className="mt-5 border-t border-line pt-4">
                  <p className="text-sm text-muted">Confirmed rate</p>
                  <p className="big-number mt-1 text-primary">₱{job.pay_confirmed}<span className="ml-1 font-sans text-base font-normal text-muted">/day</span></p>
                  <p className="mt-2 text-sm">Confirmed at ₱{job.pay_confirmed}/day. Candidates see this rate before they start training.</p>
                  {/* Display only: no computation, nothing is blocked in the demo flow. */}
                  <p className="mt-3 flex gap-2 text-sm">
                    <CircleCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      <b>Wage Floor Check ✓</b> — This role is online and output-based, so its rate comes from market listings. For
                      employment-type roles, the agent checks the regional minimum wage (for example, NCR ₱718–₱755/day) and blocks any
                      confirmed rate below that floor before training starts.
                    </span>
                  </p>
                </div>
              ) : (
                <>
                  <form action={confirmRate.bind(null, job.id)} className="mt-3 flex flex-wrap items-end gap-3">
                    <label className="text-sm font-medium">
                      Final rate (₱/day)
                      <input name="pay" id="pay" type="number" min={1} required defaultValue={suggested}
                        className="mt-1 block w-32 card px-3 py-2" />
                    </label>
                    <button className="rounded-lg bg-primary px-4 py-2 font-semibold text-white">Confirm rate</button>
                  </form>
                  <p className="mt-2 text-xs text-ink">
                    HR1: this job stays a draft, with assessments and the module locked, until you confirm the rate.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {(await currentWorkspace()) === "live" && <KnowledgeBaseCard employerId={job.employer_id} />}
      <SourcesPanel job={job} />
      <ModulePanel job={job} />
      <AuditPanel job={job} />
    </section>
  );
}
