import Link from "next/link";
import { redirect } from "next/navigation";
import { all, get } from "@/lib/db";
import { gapHours, jobGate, moduleOpen, testUnlocked } from "@/lib/rules";
import { currentModule } from "@/lib/modules";
import type { Module } from "@/lib/types";
import Practice from "@/components/Practice";
import { completeSection, startPlan } from "../actions";

export const dynamic = "force-dynamic";

const big = "block w-full rounded-xl px-4 py-4 text-center text-lg font-semibold";

export default async function Page({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ plan?: string; section?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const candidate = await get("candidates", id);
  if (!candidate)
    return (
      <section className="mx-auto max-w-[480px] text-lg">
        <p>Walang candidate dito. <Link href="/samples" className="font-semibold underline">I-load ang sample data</Link>.</p>
      </section>
    );
  const [jobs, employers, assessments, modules, allPlans] = await Promise.all([
    all("jobs"), all("employers"), all("assessments"), all("modules"), all("candidate_plans"),
  ]);
  const plans = allPlans.filter((p) => p.candidate_id === candidate.id);

  // ---- One module section, opened from the plan ----
  if (query.plan && query.section) {
    const plan = plans.find((p) => p.id === query.plan);
    const mod = modules.find((m) => m.id === plan?.module_id);
    const section = mod?.sections.find((s) => s.id === query.section);
    // HR2 and plan scope: only an assigned section of an employer-approved module can be opened.
    if (!plan || !section || !plan.assigned_sections.includes(section.id) || !moduleOpen(mod)) redirect(`/candidate/${candidate.id}`);
    return (
      <section className="mx-auto grid max-w-[480px] gap-5 text-lg">
        <Link href={`/candidate/${candidate.id}`} className="text-base font-semibold underline">← Bumalik sa module</Link>
        <div>
          <p className="text-sm text-stone-500">{section.skill}</p>
          <h1 className="text-2xl font-bold">{section.title}</h1>
        </div>
        <p>{section.lesson_text}</p>
        <div className="rounded-xl bg-stone-100 p-4">
          <p className="font-bold">Halimbawa</p>
          <p className="mt-1">{section.worked_example}</p>
        </div>
        <Practice items={section.practice_items} />
        {plan.progress[section.id] ? (
          <p className="rounded-xl bg-emerald-50 p-4 font-semibold text-emerald-900">Tapos mo na ang section na ito.</p>
        ) : (
          <form action={completeSection.bind(null, plan.id, section.id)}>
            <button className={`${big} bg-emerald-800 text-white`}>Tapos na ako dito</button>
          </form>
        )}
      </section>
    );
  }

  // ---- Candidate home ----
  const current = new Map<string, Module | undefined>();
  for (const j of jobs) current.set(j.id, await currentModule(j.id));
  const openJobs = jobs.filter((j) => jobGate(j).open);

  return (
    <section className="mx-auto grid max-w-[480px] gap-5 text-lg">
      <h1 className="text-2xl font-bold">Kumusta, {candidate.display_name}!</h1>
      {openJobs.length === 0 && <p className="text-stone-600">Wala pang bukas na job para sa'yo ngayon.</p>}
      {openJobs.map((job) => {
        const a = assessments.find((x) => x.job_id === job.id && x.candidate_id === candidate.id);
        const gap = a ? gapHours(a.score_per_skill, job.target_skills) : null;
        const mod = current.get(job.id);
        const plan = plans.find((p) => modules.find((m) => m.id === p.module_id)?.job_id === job.id);
        const planModule = modules.find((m) => m.id === plan?.module_id);
        const sections = plan && planModule ? planModule.sections.filter((s) => plan.assigned_sections.includes(s.id)) : [];
        const done = plan ? sections.filter((s) => plan.progress[s.id]).length : 0;
        const unlocked = plan ? testUnlocked(plan) : false;
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
                      const level = a.score_per_skill[skill] ?? 0;
                      return (
                        <li key={skill}>
                          <div className="flex justify-between gap-3">
                            <span>{skill}</span>
                            <span className="shrink-0 tabular-nums text-stone-600">{level} → {target} · {hours}h</span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded bg-stone-200">
                            <div className="h-full bg-emerald-700" style={{ width: `${level}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <p className="text-xl font-bold">Ang module mo: ~{plan ? plan.personal_hours : gap.total} hours</p>

                {!plan && !moduleOpen(mod) && (
                  <div className="rounded-xl bg-amber-50 p-4 text-base">
                    <p className="font-bold text-amber-900">Naka-lock pa ang module</p>
                    <p className="mt-1">Hinihintay pa ang approval ng employer. Hindi pa ito mabubuksan hangga't hindi aprubado.</p>
                  </div>
                )}

                {!plan && moduleOpen(mod) && (
                  <>
                    <p className="text-base text-stone-600">
                      Aprubado na ng employer ang module. {mod.sections.filter((s) => s.skill in gap.per).length} section lang ang para sa'yo.
                    </p>
                    <form action={startPlan.bind(null, candidate.id, job.id)}>
                      <button className={`${big} bg-emerald-800 text-white`}>Simulan ang module</button>
                    </form>
                  </>
                )}

                {plan && (
                  <>
                    <div className="grid gap-3">
                      {sections.map((s) => (
                        <Link key={s.id} href={`/candidate/${candidate.id}?plan=${plan.id}&section=${s.id}`}
                          className="rounded-xl border border-stone-300 p-4 hover:border-stone-500">
                          <div className="font-semibold">{s.title}</div>
                          <div className="mt-1 text-base text-stone-600">
                            {gap.per[s.skill]} hours · {plan.progress[s.id] ? "Tapos na ✓" : "Buksan"}
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div>
                      <div className="h-2 overflow-hidden rounded bg-stone-200">
                        <div className="h-full bg-emerald-700" style={{ width: `${sections.length ? (done / sections.length) * 100 : 0}%` }} />
                      </div>
                      <p className="mt-1 text-base text-stone-600">{done} sa {sections.length} section ang tapos</p>
                    </div>
                    {unlocked ? (
                      <Link href={`/candidate/${candidate.id}?plan=${plan.id}&test=1`} className={`${big} bg-emerald-800 text-white`}>
                        Simulan ang final test
                      </Link>
                    ) : (
                      <button disabled className={`${big} cursor-not-allowed bg-stone-200 text-stone-500`}>
                        Final test: tapusin muna ang {sections.length - done} section
                      </button>
                    )}
                  </>
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
