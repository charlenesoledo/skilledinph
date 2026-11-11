import { notFound } from "next/navigation";
import { all, get } from "@/lib/db";
import { analyzeJob } from "../../actions";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await get("jobs", id);
  if (!job) notFound();
  const employer = await get("employers", job.employer_id);
  const runs = (await all("runs")).filter((r) => r.ref_type === "job" && r.ref_id === job.id);
  const lastAnalyzer = runs.filter((r) => r.agent === "job_analyzer").at(-1);

  const card: [string, string][] = [
    ["Employer", employer?.name ?? ""], ["Workflow step", job.workflow_step], ["Why a human", job.why_human],
    ["Tasks", job.tasks], ["Good output", job.good_example], ["Bad output", job.bad_example],
    ["Reserved slots", `${job.reserved_slots} (${job.seats_taken} taken)`], ["Deadline", job.deadline], ["Tools needed", job.tools_needed],
  ];

  return (
    <section className="grid gap-8">
      <div>
        <p className="text-sm text-stone-500">Job Review</p>
        <h1 className="text-2xl font-bold">{job.title}</h1>
        <p className="mt-1 text-sm"><span className="rounded bg-stone-200 px-2 py-1 font-mono text-xs uppercase">{job.status}</span></p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="text-lg font-bold">Human Job Card</h2>
          <dl className="mt-3 grid grid-cols-[minmax(100px,150px)_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
            {card.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-stone-500">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="text-lg font-bold">Skill breakdown</h2>
          {job.target_skills.length > 0 ? (
            <>
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-300 text-left text-xs uppercase tracking-wide text-stone-500">
                    <th className="py-2 pr-3">Skill</th><th className="py-2 pr-3">Target</th><th className="py-2">Why</th>
                  </tr>
                </thead>
                <tbody>
                  {job.target_skills.map((s) => (
                    <tr key={s.skill} className="border-b border-stone-200 align-top">
                      <td className="py-2 pr-3 font-semibold">{s.skill}</td>
                      <td className="py-2 pr-3 tabular-nums">{s.target}</td>
                      <td className="py-2 text-stone-600">{s.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3 className="mt-4 text-sm font-semibold">Draft quality rubric</h3>
              <ul className="mt-1 list-disc pl-5 text-sm text-stone-700">
                {job.rubric.map((r) => <li key={r}>{r}</li>)}
              </ul>
              {lastAnalyzer?.mock && <p className="mt-3 text-xs text-amber-800">Mock Mode: built-in sample output.</p>}
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-stone-600">The Job Analyzer breaks this Job Card into skills with target levels and a draft rubric.</p>
              {lastAnalyzer && !lastAnalyzer.ok && (
                <p className="mt-2 text-sm text-red-700">Last run failed: {lastAnalyzer.error}</p>
              )}
              <form action={analyzeJob.bind(null, job.id)} className="mt-3">
                <button className="rounded-lg bg-emerald-800 px-4 py-2 font-semibold text-white">
                  {lastAnalyzer && !lastAnalyzer.ok ? "Retry Job Analyzer" : "Run Job Analyzer"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
