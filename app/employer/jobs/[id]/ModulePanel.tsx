import { all } from "@/lib/db";
import { moduleVersions } from "@/lib/modules";
import { jobGate } from "@/lib/rules";
import { runState } from "@/lib/runs";
import AgentRunButton from "@/components/AgentRunButton";
import type { Job, KeyedItem } from "@/lib/types";
import { approveModule, buildModule, editPassingScore, requestChanges } from "../../actions";

const primary = "rounded-lg bg-primary px-4 py-2 font-semibold text-white";
const secondary = "rounded-lg border border-line px-4 py-2 font-semibold";
const field = "mt-1 block card px-3 py-2";

function Items({ items }: { items: KeyedItem[] }) {
  return (
    <ol className="mt-2 grid list-decimal gap-2 pl-5 text-sm">
      {items.map((it, i) => (
        <li key={i}>
          {it.prompt}
          <div className="text-primary">Key: {it.choices[it.correct_index]}</div>
        </li>
      ))}
    </ol>
  );
}

export default async function ModulePanel({ job }: { job: Job }) {
  const versions = await moduleVersions(job.id);
  const mod = versions.at(-1);
  const gate = jobGate(job);
  const runs = await all("runs");
  const lastRun = runs.filter((r) => r.agent === "module_builder" && r.ref_id === job.id).at(-1);
  const failed = lastRun && !lastRun.ok;
  const regenerated = versions.some((v) => v.status === "changes_requested" && v.id !== mod?.id);

  return (
    <div className="card p-5">
      <h2 className="text-lg font-bold">Module and final test</h2>

      {!mod && !gate.open && <p className="mt-2 text-sm font-medium text-ink">{gate.reason}. A module cannot be built yet.</p>}

      {!mod && gate.open && (
        <>
          <p className="mt-2 text-sm text-muted">
            The Module Builder writes one module for this job from your rubric and examples. Nobody can train on it until you approve it.
          </p>
          <div className="mt-3">
            <AgentRunButton action={buildModule.bind(null, job.id)} label="Build module" retryLabel="Retry Module Builder"
              state={runState(runs, "module_builder", job.id)} />
          </div>
        </>
      )}

      {mod && (
        <>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded bg-line px-2 py-1 font-mono text-xs">v{mod.version}</span>
            <span className={`rounded px-2 py-1 text-xs font-semibold uppercase ${mod.status === "employer_approved" ? "bg-primary/10 text-primary" : "bg-accent/30 text-ink"}`}>
              {mod.status === "employer_approved" ? "Employer approved" : mod.status === "generated" ? "Awaiting your approval" : "Changes requested"}
            </span>
            {lastRun?.mock && <span className="text-xs text-ink">Mock Mode: built-in sample output</span>}
          </p>
          {mod.employer_notes && <p className="mt-2 text-sm text-muted">Your notes to the agent: “{mod.employer_notes}”</p>}

          <div className="mt-4 grid gap-2">
            {mod.sections.map((s) => (
              <details key={s.id} className="rounded-lg border border-line p-3">
                <summary className="cursor-pointer font-semibold">{s.skill}: {s.title}</summary>
                <p className="mt-2 max-w-prose text-sm">{s.lesson_text}</p>
                <p className="mt-2 max-w-prose text-sm text-muted"><b>Worked example.</b> {s.worked_example}</p>
                <Items items={s.practice_items} />
              </details>
            ))}
            <details className="rounded-lg border border-line p-3">
              <summary className="cursor-pointer font-semibold">Final test: {mod.final_test.items.length} keyed items</summary>
              <Items items={mod.final_test.items} />
            </details>
          </div>

          {mod.status === "generated" && (
            <div className="mt-5 grid gap-5 border-t border-line pt-4">
              <form action={approveModule.bind(null, job.id)} className="flex flex-wrap items-end gap-3">
                <label className="text-sm font-medium">
                  Passing score (agent proposed {mod.proposed_passing_score})
                  <input name="passing_score" id="passing_score" type="number" min={0} max={100} required defaultValue={mod.passing_score} className={`${field} w-28`} />
                </label>
                <button className={primary}>Approve module</button>
              </form>
              {regenerated ? (
                <p className="text-sm text-muted">The agent has already regenerated this module once from your notes.</p>
              ) : (
                <form action={requestChanges.bind(null, job.id)} className="grid gap-2">
                  <label className="text-sm font-medium">
                    Notes for the agent
                    <textarea name="employer_notes" id="employer_notes" required rows={2} placeholder="What should change?" className={`${field} w-full`} />
                  </label>
                  <div><button className={secondary}>Request changes</button></div>
                </form>
              )}
            </div>
          )}

          {mod.status === "changes_requested" && (
            <div className="mt-5 border-t border-line pt-4">
              {failed && <p className="text-sm text-ink">Regeneration failed: {lastRun.error}</p>}
              <form action={requestChanges.bind(null, job.id)} className="mt-2">
                <button className={secondary}>Retry regeneration</button>
              </form>
            </div>
          )}

          {mod.status === "employer_approved" && (
            <form action={editPassingScore.bind(null, job.id)} className="mt-5 flex flex-wrap items-end gap-3 border-t border-line pt-4">
              <label className="text-sm font-medium">
                Passing score
                <input name="passing_score" id="passing_score" type="number" min={0} max={100} required defaultValue={mod.passing_score} className={`${field} w-28`} />
              </label>
              <button className={secondary}>Save new score</button>
              <p className="basis-full text-xs text-muted">
                Saving a different score creates v{mod.version + 1}. Candidates who already started keep the version they started on.
              </p>
            </form>
          )}
        </>
      )}
    </div>
  );
}
