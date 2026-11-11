import Link from "next/link";
import { redirect } from "next/navigation";
import { all, get } from "@/lib/db";
import { MAX_TEST_ATTEMPTS, gapHours, jobGate, moduleOpen, testUnlocked } from "@/lib/rules";
import { currentModule } from "@/lib/modules";
import type { Module } from "@/lib/types";
import Practice from "@/components/Practice";
import { acceptOffer, completeSection, startPlan, submitTest } from "../actions";

export const dynamic = "force-dynamic";

const big = "block w-full rounded-xl px-4 py-4 text-center text-lg font-semibold";

export default async function Page({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ plan?: string; section?: string; test?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const candidate = await get("candidates", id);
  if (!candidate)
    return (
      <section className="mx-auto max-w-[480px] text-lg">
        <p>Walang candidate dito. <Link href="/samples" className="font-semibold underline">I-load ang sample data</Link>.</p>
      </section>
    );
  const home = `/candidate/${candidate.id}`;
  const [jobs, employers, assessments, modules, allPlans, results, offers] = await Promise.all([
    all("jobs"), all("employers"), all("assessments"), all("modules"), all("candidate_plans"), all("test_results"), all("offers"),
  ]);
  const plans = allPlans.filter((p) => p.candidate_id === candidate.id);
  const attemptsFor = (planId: string) => results.filter((r) => r.candidate_plan_id === planId);

  // ---- One module section, opened from the plan ----
  if (query.plan && query.section) {
    const plan = plans.find((p) => p.id === query.plan);
    const mod = modules.find((m) => m.id === plan?.module_id);
    const section = mod?.sections.find((s) => s.id === query.section);
    // HR2 and plan scope: only an assigned section of an employer-approved module can be opened.
    if (!plan || !section || !plan.assigned_sections.includes(section.id) || !moduleOpen(mod)) redirect(home);
    return (
      <section className="mx-auto grid max-w-[480px] gap-5 text-lg">
        <Link href={home} className="text-base font-semibold underline">← Bumalik sa module</Link>
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

  // ---- The final test ----
  if (query.plan && query.test) {
    const plan = plans.find((p) => p.id === query.plan);
    const mod = modules.find((m) => m.id === plan?.module_id);
    // HR3: no test before every assigned section is complete. One retake at most.
    if (!plan || !moduleOpen(mod) || !testUnlocked(plan) || attemptsFor(plan.id).length >= MAX_TEST_ATTEMPTS ||
        (plan.status !== "test_unlocked" && plan.status !== "failed_once")) redirect(home);
    return (
      <section className="mx-auto grid max-w-[480px] gap-5 text-lg">
        <Link href={home} className="text-base font-semibold underline">← Bumalik</Link>
        <div>
          <h1 className="text-2xl font-bold">Final test</h1>
          <p className="mt-1 text-base text-stone-600">
            {mod.final_test.items.length} tanong. Pasado: {mod.passing_score}, itinakda ng employer.
          </p>
        </div>
        <form action={submitTest.bind(null, plan.id)} className="grid gap-5">
          {mod.final_test.items.map((it, i) => (
            <fieldset key={i} className="grid gap-2 rounded-xl border border-stone-200 bg-white p-4">
              <legend className="sr-only">Tanong {i + 1}</legend>
              <p>{i + 1}. {it.prompt}</p>
              {it.choices.map((c, n) => (
                <label key={n} className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-300 px-4 py-3 has-[:checked]:border-emerald-700 has-[:checked]:bg-emerald-50">
                  <input type="radio" name={`q${i}`} id={`q${i}_${n}`} value={n} required className="mt-1.5 h-4 w-4 accent-emerald-800" />
                  <span>{c}</span>
                </label>
              ))}
            </fieldset>
          ))}
          <button className={`${big} bg-emerald-800 text-white`}>Ipasa ang sagot</button>
        </form>
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
        const employer = employers.find((e) => e.id === job.employer_id);
        const a = assessments.find((x) => x.job_id === job.id && x.candidate_id === candidate.id);
        const gap = a ? gapHours(a.score_per_skill, job.target_skills) : null;
        const mod = current.get(job.id);
        const plan = plans.find((p) => modules.find((m) => m.id === p.module_id)?.job_id === job.id);
        const planModule = modules.find((m) => m.id === plan?.module_id);
        const sections = plan && planModule ? planModule.sections.filter((s) => plan.assigned_sections.includes(s.id)) : [];
        const done = plan ? sections.filter((s) => plan.progress[s.id]).length : 0;
        const unlocked = plan ? testUnlocked(plan) : false;
        const tries = plan ? attemptsFor(plan.id) : [];
        const last = tries.at(-1);
        const outOfTries = tries.length >= MAX_TEST_ATTEMPTS && !last?.passed;
        const offer = offers.find((o) => o.job_id === job.id && o.candidate_id === candidate.id);

        return (
          <div key={job.id} className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5">
            <div>
              <p className="text-sm text-stone-500">{employer?.name}</p>
              <h2 className="text-xl font-bold">{job.title}</h2>
              <p className="mt-1">Sahod: <b>₱{job.pay_confirmed} kada araw</b></p>
            </div>

            {offer && (
              <>
                <div className="grid gap-2 rounded-2xl border-2 border-dashed border-stone-800 p-5">
                  <span className={`w-fit -rotate-2 rounded px-3 py-2 font-mono text-sm font-semibold tracking-widest ${offer.guaranteed ? "bg-amber-400 text-amber-950" : "bg-stone-200 text-stone-700"}`}>
                    {offer.guaranteed ? "GUARANTEED" : "NOT GUARANTEED · WAITLIST"}
                  </span>
                  <p className="text-sm text-stone-500">{offer.guaranteed ? "Job offer" : "Waitlist"} mula sa {employer?.name}</p>
                  <p className="text-xl font-bold">{job.title}</p>
                  <p className="text-4xl font-bold tracking-tight">₱{offer.pay_confirmed}<span className="text-base font-normal text-stone-600"> / araw</span></p>
                  <p className="text-base">Simula: {job.deadline}</p>
                  {offer.guaranteed && <p className="text-base text-stone-600">Walang application. Walang interview.</p>}
                </div>
                {last?.passed && (
                  <p className="text-base">
                    {last.scored_output.explanation ?? `Nakuha mo ang ${last.score} sa final test. Pasado: ${planModule?.passing_score}.`}
                  </p>
                )}
                {offer.status === "offered" && (
                  <form action={acceptOffer.bind(null, offer.id)}>
                    <button className={`${big} bg-emerald-800 text-white`}>Tanggapin ang offer</button>
                  </form>
                )}
                {offer.status === "accepted" && (
                  <p className="rounded-xl bg-emerald-50 p-4 font-semibold text-emerald-900">Tinanggap mo na ang offer. Welcome sa team!</p>
                )}
                {offer.status === "waitlisted" && (
                  <p className="rounded-xl bg-stone-100 p-4 text-base">
                    Puno na ang {job.reserved_slots} slots para sa job na ito, kaya nasa waitlist ka. Hindi pa ito garantisado.
                    Sasabihan ka namin kapag may nabakanteng slot.
                  </p>
                )}
              </>
            )}

            {!offer && !a && <p className="text-stone-600">Wala ka pang assessment para sa job na ito. Maiikling task lang ito, hindi written exam.</p>}

            {!offer && a?.sorting === "ready" && (
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="font-bold text-emerald-900">Handa ka na!</p>
                <p className="mt-1 text-base">Naabot mo ang lahat ng target ng employer. Hindi mo na kailangan ng module.</p>
              </div>
            )}

            {!offer && a?.sorting === "trainable" && gap && (
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

                {plan && last && !last.passed && (
                  <div className="rounded-xl bg-sky-50 p-4 text-base">
                    <p className="text-lg font-bold text-sky-900">Resulta: {last.score} (pasado: {planModule?.passing_score})</p>
                    <p className="mt-1">{last.scored_output.explanation ?? "Naka-save ang resulta mo."}</p>
                  </div>
                )}

                {plan && !outOfTries && (
                  <>
                    <div className="grid gap-3">
                      {sections.map((s) => (
                        <Link key={s.id} href={`${home}?plan=${plan.id}&section=${s.id}`} className="rounded-xl border border-stone-300 p-4 hover:border-stone-500">
                          <div className="font-semibold">{s.title}</div>
                          <div className="mt-1 text-base text-stone-600">
                            {gap.per[s.skill] ? `${gap.per[s.skill]} hours · ` : "Practice · "}
                            {plan.progress[s.id] ? "Tapos na ✓" : last ? "Balikan para mag-practice" : "Buksan"}
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
                      <Link href={`${home}?plan=${plan.id}&test=1`} className={`${big} bg-emerald-800 text-white`}>
                        {last ? "Mag-retake ng final test" : "Simulan ang final test"}
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
