import Link from "next/link";
import { all, get } from "@/lib/db";
import { gapHours, jobGate, moduleOpen } from "@/lib/rules";
import { currentModule } from "@/lib/modules";
import type { Module } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const candidate = await get("candidates", id);
  if (!candidate)
    return (
      <section className="mx-auto max-w-[480px] text-lg">
        <p>Walang candidate dito. <Link href="/samples" className="font-semibold underline">I-load ang sample data</Link>.</p>
      </section>
    );
  const [jobs, employers, assessments] = await Promise.all([all("jobs"), all("employers"), all("assessments")]);
  const current = new Map<string, Module | undefined>();
  for (const j of jobs) current.set(j.id, await currentModule(j.id));

  return (
    <section className="mx-auto grid max-w-[480px] gap-5 text-lg">
      <h1 className="text-2xl font-bold">Kumusta, {candidate.display_name}!</h1>
      {jobs.filter((j) => jobGate(j).open).length === 0 && <p className="text-stone-600">Wala pang bukas na job para sa'yo ngayon.</p>}
      {jobs.filter((j) => jobGate(j).open).map((job) => {
        const a = assessments.find((x) => x.job_id === job.id && x.candidate_id === candidate.id);
        const gap = a ? gapHours(a.score_per_skill, job.target_skills) : null;
        const mod = current.get(job.id);
        return (
          <div key={job.id} className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5">
            <div>
              <p className="text-sm text-stone-500">{employers.find((e) => e.id === job.employer_id)?.name}</p>
              <h2 className="text-xl font-bold">{job.title}</h2>
              <p className="mt-1">Sahod: <b>₱{job.pay_confirmed} kada araw</b></p>
            </div>

            {!a && <p className="text-stone-600">Wala ka pang assessment para sa job na ito. Maiikling task lang ito, hindi written exam.</p>}

            {a?.sorting === "ready" && (
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="font-bold text-emerald-900">Handa ka na!</p>
                <p className="mt-1 text-base">Naabot mo ang lahat ng target ng employer. Hindi mo na kailangan ng module.</p>
              </div>
            )}

            {a?.sorting === "trainable" && gap && (
              <>
                <div>
                  <h3 className="font-bold">Ang kulang mo</h3>
                  <ul className="mt-2 grid gap-3 text-base">
                    {Object.entries(gap.per).map(([skill, hours]) => {
                      const target = job.target_skills.find((s) => s.skill === skill)!.target;
                      const current = a.score_per_skill[skill] ?? 0;
                      return (
                        <li key={skill}>
                          <div className="flex justify-between gap-3">
                            <span>{skill}</span>
                            <span className="shrink-0 tabular-nums text-stone-600">{current} → {target} · {hours}h</span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded bg-stone-200">
                            <div className="h-full bg-emerald-700" style={{ width: `${current}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <p className="text-xl font-bold">Ang module mo: ~{gap.total} hours</p>
                {moduleOpen(mod) ? (
                  <div className="rounded-xl bg-emerald-50 p-4 text-base">
                    <p className="font-bold text-emerald-900">Bukas na ang module mo</p>
                    <ul className="mt-2 grid list-disc gap-1 pl-5">
                      {mod.sections.filter((s) => s.skill in gap.per).map((s) => <li key={s.id}>{s.title}</li>)}
                    </ul>
                  </div>
                ) : (
                  <div className="rounded-xl bg-amber-50 p-4 text-base">
                    <p className="font-bold text-amber-900">Naka-lock pa ang module</p>
                    <p className="mt-1">Hinihintay pa ang approval ng employer. Hindi pa ito mabubuksan hangga't hindi aprubado.</p>
                  </div>
                )}
              </>
            )}

            {a?.sorting === "not_yet" && gap && (
              <div className="rounded-xl bg-sky-50 p-4 text-base">
                <p className="text-lg font-bold text-sky-900">May daan para sa'yo</p>
                <p className="mt-1">
                  Sa ngayon, mga ~{gap.total} oras pa ang kailangang aralin para sa job na ito, kaya uunahin muna natin ang
                  {" "}<b>Foundational Track</b>: mga basic na aralin sa pagbasa at pag-check ng detalye.
                </p>
                <p className="mt-2">Pagkatapos noon, babalikan natin ang mga job na tulad nito. Naka-save ang resulta mo.</p>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
