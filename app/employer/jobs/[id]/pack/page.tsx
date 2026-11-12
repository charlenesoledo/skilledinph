import Link from "next/link";
import { notFound } from "next/navigation";
import { all, get } from "@/lib/db";
import { currentPack } from "@/lib/live/packs";
import { PACK_INTRO_TL, packFor } from "@/lib/live/pack";
import { approvePack, generatePack } from "@/app/employer/pack-actions";
import PendingButton from "@/components/PendingButton";
import Markdown from "@/components/Markdown";

export const dynamic = "force-dynamic";

const primary = "rounded-lg bg-primary px-4 py-2 font-semibold text-white";

// The Assessment Pack for one job: the candidate view (no key anywhere) and the employer's key & rubric.
// Draft → Employer-approved. Skill Checks can be sent from the Pool only once it is approved.
export default async function Page({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const tab = (await searchParams).tab === "key" ? "key" : "candidate";
  const job = await get("jobs", id);
  if (!job) notFound();
  const [pack, kbs] = await Promise.all([currentPack(job.id), all("knowledge_bases")]);
  const kb = kbs.find((k) => k.employer_id === job.employer_id);
  const analyzed = job.target_skills.length > 0;
  const canGenerate = analyzed && !!kb && !!packFor(job.target_skills.map((s) => s.skill));
  const base = `/employer/jobs/${job.id}/pack`;

  return (
    <section className="grid gap-6">
      <div>
        <Link href={`/employer/jobs/${job.id}`} className="text-sm font-semibold underline underline-offset-4">← Job Review</Link>
        <p className="mt-3 text-sm text-muted">Assessment Pack</p>
        <h1 className="text-2xl font-bold">{job.title}</h1>
      </div>

      {!pack ? (
        <div className="card max-w-2xl p-5">
          <h2 className="text-lg font-bold">Generate the Assessment Pack</h2>
          <p className="mt-2 text-sm text-muted">
            The Assessment Builder drafts 6 work-sample tasks (2 per skill) from this job and your Knowledge Base, with an answer key,
            points, partial-credit rules and the KB source of every item. You review it, then approve it.
          </p>
          <ul className="mt-3 grid gap-1 text-sm">
            <li>{analyzed ? "✓" : "✗"} Job analyzed into skills and targets{analyzed ? "" : " (run the Job Analyzer on Job Review)"}</li>
            <li>{kb ? "✓" : "✗"} Knowledge Base attached{kb ? ` (${kb.file_name})` : ""}</li>
          </ul>
          <form action={generatePack.bind(null, job.id)} className="mt-4">
            <PendingButton label="Generate Assessment Pack" pendingLabel="Generating…" className={primary} disabled={!canGenerate} />
          </form>
        </div>
      ) : (
        <>
          <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm">
                Version {pack.version} · Status{" "}
                <span className={`rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${pack.status === "employer_approved" ? "bg-primary/10 text-primary" : "bg-accent text-ink"}`}>
                  {pack.status === "employer_approved" ? "Employer-approved" : "Draft"}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted">Generated from {pack.sources}</p>
              <p className="mt-1 text-xs text-muted">
                Skills &amp; targets: {job.target_skills.map((s) => `${s.skill} ${s.target}`).join(" · ")} · 6 tasks · 2 per skill · ~15 minutes · each skill out of 100
              </p>
            </div>
            {pack.status === "draft" ? (
              <form action={approvePack.bind(null, pack.id)}>
                <PendingButton label="Approve Assessment Pack" pendingLabel="Approving…" className={primary} />
              </form>
            ) : (
              <p className="text-sm font-semibold text-primary">Approved {pack.approved_at?.slice(0, 10)}. Skill Checks can now be sent from the Pool.</p>
            )}
          </div>

          <nav className="flex gap-2 border-b border-line" aria-label="Assessment Pack views">
            {[["candidate", "Candidate view"], ["key", "Employer key & rubric"]].map(([t, label]) => (
              <Link key={t} href={`${base}?tab=${t}`} aria-current={tab === t ? "page" : undefined}
                className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold ${tab === t ? "border-primary text-ink" : "border-transparent text-muted hover:text-ink"}`}>
                {label}
              </Link>
            ))}
          </nav>

          {tab === "candidate" ? (
            <div className="mx-auto grid w-full max-w-[480px] gap-4">
              <div className="card p-5">
                <p className="font-bold">Skill Check — {job.title}</p>
                <p className="mt-2 text-sm">{PACK_INTRO_TL}</p>
              </div>
              {pack.items.map((it) => (
                <div key={it.n} className="card grid gap-2 p-5">
                  <p className="text-xs text-muted">Task {it.n} · {it.skill}</p>
                  <Markdown source={it.prompt} />
                  {it.quote && <blockquote className="border-l-2 border-line pl-3 text-sm">{it.quote}</blockquote>}
                  <ul className="grid gap-2">
                    {it.choices.map((c) => (
                      <li key={c.key} className="rounded-xl border border-line px-4 py-3 text-sm"><b>{c.key}.</b> {c.text}</li>
                    ))}
                  </ul>
                  {it.kind === "multi" && <p className="text-xs text-muted">Piliin ang lahat ng tama.</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="card overflow-x-auto p-5">
              <table className="w-full text-left text-sm">
                <thead className="text-muted">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Task</th><th className="py-2 pr-3 font-medium">Skill</th>
                    <th className="py-2 pr-3 font-medium">Correct</th><th className="py-2 pr-3 font-medium">Points &amp; partial credit</th>
                    <th className="py-2 font-medium">Built from</th>
                  </tr>
                </thead>
                <tbody>
                  {pack.items.map((it) => (
                    <tr key={it.n} className="border-t border-line align-top">
                      <td className="py-2 pr-3 tabular-nums">{it.n}</td>
                      <td className="py-2 pr-3">{it.skill}</td>
                      <td className="py-2 pr-3 font-semibold">{it.kind === "multi" ? it.correct.join(", ") : it.answer}</td>
                      <td className="py-2 pr-3">50 — {it.rule}</td>
                      <td className="py-2">{it.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-sm text-muted">
                Scoring rules (code, not LLM): per-skill score = sum of its 2 tasks. Blind: the scorer receives answers only, never a name.
                Sorting against the targets above with the standing gap-hours formula.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
