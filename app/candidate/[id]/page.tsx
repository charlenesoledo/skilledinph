import Link from "next/link";
import { redirect } from "next/navigation";
import { all, get } from "@/lib/db";
import { MAX_TEST_ATTEMPTS, gapHours, jobGate, moduleOpen, testUnlocked } from "@/lib/rules";
import { currentModule } from "@/lib/modules";
import type { Module } from "@/lib/types";
import Practice from "@/components/Practice";
import { T } from "@/components/Locale";
import OfferPromise from "@/components/OfferPromise";
import ModulePath, { PathProgress } from "@/components/ModulePath";
import { pathStep } from "@/lib/path";
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
        <p><T k="noCandidate" /> <Link href="/samples" className="font-semibold underline"><T k="loadSamples" /></Link>.</p>
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
        {(() => {
          const assigned = mod.sections.filter((s) => plan.assigned_sections.includes(s.id));
          const p = pathStep(assigned.map((s) => !!plan.progress[s.id]));
          return (
            <div className="sticky top-0 z-10 card overflow-hidden px-5">
              <PathProgress planId={plan.id} step={p.step} total={p.total} done={p.done} sectionsDone={p.done} sectionsTotal={assigned.length} record={false} />
            </div>
          );
        })()}
        <Link href={home} className="text-base font-semibold underline"><T k="backToModule" /></Link>
        <div>
          <p className="text-sm text-muted">{section.skill}</p>
          <h1 className="text-2xl font-bold">{section.title}</h1>
        </div>
        <p>{section.lesson_text}</p>
        <div className="rounded-xl bg-paper p-4">
          <p className="font-bold"><T k="example" /></p>
          <p className="mt-1">{section.worked_example}</p>
        </div>
        <Practice items={section.practice_items} />
        {plan.progress[section.id] ? (
          <p className="rounded-xl bg-primary/10 p-4 font-semibold text-primary"><T k="sectionDone" /></p>
        ) : (
          <form action={completeSection.bind(null, plan.id, section.id)}>
            <button className={`${big} bg-primary text-white`}><T k="finishSection" /></button>
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
        <Link href={home} className="text-base font-semibold underline"><T k="back" /></Link>
        <div>
          <h1 className="text-2xl font-bold"><T k="finalTest" /></h1>
          <p className="mt-1 text-base text-muted">
            <T k="testIntro" v={{ count: mod.final_test.items.length, pass: mod.passing_score }} />
          </p>
        </div>
        <form action={submitTest.bind(null, plan.id)} className="grid gap-5">
          {mod.final_test.items.map((it, i) => (
            <fieldset key={i} className="grid gap-2 card p-4">
              <legend className="sr-only"><T k="questionN" v={{ n: i + 1 }} /></legend>
              <p>{i + 1}. {it.prompt}</p>
              {it.choices.map((c, n) => (
                <label key={n} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-4 py-3 has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                  <input type="radio" name={`q${i}`} id={`q${i}_${n}`} value={n} required className="mt-1.5 h-4 w-4 accent-primary" />
                  <span>{c}</span>
                </label>
              ))}
            </fieldset>
          ))}
          <button className={`${big} bg-primary text-white`}><T k="submitAnswers" /></button>
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
      <h1 className="text-2xl font-bold"><T k="greeting" v={{ name: candidate.display_name }} /></h1>
      {openJobs.length === 0 && <p className="text-muted"><T k="noOpenJobs" /></p>}
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

        const progress = plan && !offer && !outOfTries ? pathStep(sections.map((s) => !!plan.progress[s.id])) : null;
        return (
          <div key={job.id} className="grid gap-4 card p-5">
            {/* While training, progress stays pinned at the top of the card. */}
            {plan && progress && (
              <div className="-mt-5">
                <PathProgress planId={plan.id} step={progress.step} total={progress.total} done={progress.done}
                  sectionsDone={progress.done} sectionsTotal={sections.length} />
              </div>
            )}
            <div>
              <p className="text-sm text-muted">{employer?.name}</p>
              <h2 className="text-xl font-bold">{job.title}</h2>
              <p className="mt-3 text-sm text-muted"><T k="pay" /></p>
              <p className="big-number">₱{job.pay_confirmed}<span className="ml-1 font-sans text-base font-normal text-muted"><T k="perDayLong" /></span></p>
            </div>

            {/* The Offer Promise, from assessment onward. Not shown on the foundational track, where this job has no offer path. */}
            {!offer && a && a.sorting !== "not_yet" && (
              <OfferPromise kind="promise" employerName={employer?.name ?? ""} jobTitle={job.title} verified={job.pay_status === "confirmed"}
                pay={job.pay_confirmed ?? 0} start={job.deadline || null} seatHeld={!!plan || job.seats_taken < job.reserved_slots} />
            )}

            {offer && (
              <>
                <OfferPromise kind="final" offerId={offer.id} guaranteed={offer.guaranteed} employerName={employer?.name ?? ""}
                  jobTitle={job.title} verified={job.pay_status === "confirmed"} pay={offer.pay_confirmed} start={job.deadline || null}
                  candidateName={candidate.display_name} testKind={last?.passed ? "final" : "assessment"}
                  datePassed={(last?.passed ? last.created_at : a?.created_at ?? offer.created_at).slice(0, 10)}
                  seatsTaken={job.seats_taken} slots={job.reserved_slots} />
                {last?.passed && (
                  <p className="text-base">
                    {last.scored_output.explanation ?? <T k="resultFallback" v={{ score: last.score, pass: planModule?.passing_score ?? "" }} />}
                  </p>
                )}
                {offer.status === "offered" && (
                  <form action={acceptOffer.bind(null, offer.id)}>
                    <button className={`${big} bg-primary text-white`}><T k="acceptOffer" /></button>
                  </form>
                )}
                {offer.status === "accepted" && (
                  <p className="rounded-xl bg-primary/10 p-4 font-semibold text-primary"><T k="accepted" /></p>
                )}
                {offer.status === "waitlisted" && (
                  <p className="rounded-xl bg-paper p-4 text-base">
                    <T k="waitlistNote" v={{ slots: job.reserved_slots }} />
                  </p>
                )}
              </>
            )}

            {!offer && !a && <p className="text-muted"><T k="noAssessment" /></p>}

            {!offer && a?.sorting === "ready" && (
              <div className="rounded-xl bg-primary/10 p-4">
                <p className="font-bold text-primary"><T k="ready" /></p>
                <p className="mt-1 text-base"><T k="readyBody" /></p>
              </div>
            )}

            {!offer && a?.sorting === "trainable" && gap && (
              <>
                <div>
                  <h3 className="font-bold"><T k="yourGap" /></h3>
                  <ul className="mt-2 grid gap-3 text-base">
                    {Object.entries(gap.per).map(([skill, hours]) => {
                      const target = job.target_skills.find((s) => s.skill === skill)!.target;
                      const level = a.score_per_skill[skill] ?? 0;
                      return (
                        <li key={skill}>
                          <div className="flex justify-between gap-3">
                            <span>{skill}</span>
                            <span className="shrink-0 tabular-nums text-muted">{level} → {target} · {hours}h</span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded bg-line">
                            <div className="h-full bg-primary" style={{ width: `${level}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <p className="text-xl font-bold"><T k="yourModule" v={{ hours: plan ? plan.personal_hours : gap.total }} /></p>

                {!plan && !moduleOpen(mod) && (
                  <div className="rounded-xl bg-accent/20 p-4 text-base">
                    <p className="font-bold text-ink"><T k="moduleLocked" /></p>
                    <p className="mt-1"><T k="moduleLockedBody" /></p>
                  </div>
                )}

                {!plan && moduleOpen(mod) && (
                  <>
                    <p className="text-base text-muted">
                      <T k="moduleApproved" v={{ count: mod.sections.filter((s) => s.skill in gap.per).length }} />
                    </p>
                    <form action={startPlan.bind(null, candidate.id, job.id)}>
                      <button className={`${big} bg-primary text-white`}><T k="startModule" /></button>
                    </form>
                  </>
                )}

                {plan && last && !last.passed && (
                  <div className="rounded-xl bg-paper p-4 text-base">
                    <p className="text-sm font-semibold text-muted"><T k="result" /></p>
                    <p className="big-number mt-1">{last.score}<span className="ml-2 font-sans text-base font-normal text-muted"><T k="passMarkShort" v={{ pass: planModule?.passing_score ?? "" }} /></span></p>
                    <p className="mt-1">{last.scored_output.explanation ?? <T k="resultSaved" />}</p>
                  </div>
                )}

                {plan && !outOfTries && (
                  <ModulePath
                    sections={sections.map((s) => ({
                      id: s.id, skill: s.skill, title: s.title, done: !!plan.progress[s.id], hours: gap.per[s.skill] ?? null,
                      href: `${home}?plan=${plan.id}&section=${s.id}`,
                    }))}
                    retry={!!last}
                    testUnlocked={unlocked}
                    testHref={`${home}?plan=${plan.id}&test=1`}
                    retake={!!last}
                  />
                )}
              </>
            )}

            {a?.sorting === "not_yet" && gap && (
              <div className="rounded-xl bg-paper p-4 text-base">
                <p className="text-lg font-bold text-primary"><T k="notYetTitle" /></p>
                <p className="mt-1">
                  <T k="notYetLead" v={{ hours: gap.total }} />{" "}<b><T k="notYetTrack" /></b><T k="notYetTail" />
                </p>
                <p className="mt-2"><T k="notYetAfter" /></p>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
