import Link from "next/link";
import { all } from "@/lib/db";
import { currentModule } from "@/lib/modules";
import { moduleOpen, testUnlocked } from "@/lib/rules";
import type { Module } from "@/lib/types";
import BoardColumns, { type BoardCard } from "@/components/BoardColumns";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [jobs, employers, candidates, assessments] = await Promise.all([
    all("jobs"), all("employers"), all("candidates"), all("assessments"),
  ]);
  const plans = await all("candidate_plans");
  const offers = await all("offers");
  const current = new Map<string, Module | undefined>();
  for (const j of jobs) current.set(j.id, await currentModule(j.id));

  // Which column each card is in. Same rules as before; the client component only draws and animates them.
  const cards: BoardCard[] = [];
  const foundational: string[] = [];
  for (const j of jobs) {
    cards.push({
      key: j.id, column: "Job Secured", title: j.title, sub: employers.find((e) => e.id === j.employer_id)?.name ?? "",
      step: `Status: ${j.status} · ${j.pay_status === "confirmed" ? `₱${j.pay_confirmed}/day` : "pay not confirmed"} · Seats ${j.seats_taken}/${j.reserved_slots}`,
      href: `/employer/jobs/${j.id}`, pay: j.pay_status === "confirmed" ? j.pay_confirmed : null,
      seats: { taken: j.seats_taken, slots: j.reserved_slots },
    });
    const m = current.get(j.id);
    if (m && m.status !== "employer_approved")
      cards.push({
        key: m.id, column: "Awaiting Employer Approval", title: `Module v${m.version}`, sub: j.title,
        step: `${m.sections.length} sections · ${m.final_test.items.length}-item final test · needs employer approval`, href: `/employer/jobs/${j.id}`,
      });
  }
  for (const c of candidates) {
    const a = assessments.find((x) => x.candidate_id === c.id);
    const card = (column: BoardCard["column"], step: string, tone?: BoardCard["tone"]): BoardCard =>
      ({ key: c.id, column, title: c.display_name, sub: c.location_label, step, href: `/candidate/${c.id}`, tone });
    const o = offers.find((x) => x.candidate_id === c.id);
    if (o) cards.push(card("Offered", o.guaranteed ? `GUARANTEED · ${o.status} · ₱${o.pay_confirmed}/day` : "WAITLIST · NOT GUARANTEED", o.guaranteed ? "guaranteed" : "waitlist"));
    else if (!a) cards.push(card("Assessing", "Not assessed yet"));
    else if (a.sorting === "ready") cards.push(card("Assessing", "READY · no gap · offer is the next step"));
    else if (a.sorting === "trainable") {
      const plan = plans.find((p) => p.candidate_id === c.id);
      const doneCount = plan ? plan.assigned_sections.filter((s) => plan.progress[s]).length : 0;
      if (plan) cards.push(card("Training", testUnlocked(plan) ? `Sections complete · final test unlocked` : `Training · ${doneCount}/${plan.assigned_sections.length} sections · ~${plan.personal_hours} hours`));
      else if (moduleOpen(current.get(a.job_id))) cards.push(card("Training", `TRAINABLE · module ~${a.total_gap_hours} hours · module open, not started`));
      else cards.push(card("Awaiting Employer Approval", `TRAINABLE · gap ~${a.total_gap_hours} hours · waiting for an approved module`));
    } else {
      // Not on a column: routed to the foundational track. Kept as a card so it can leave the board visibly.
      cards.push(card("off", "Foundational track"));
      foundational.push(c.display_name);
    }
  }
  const empty = jobs.length === 0 && candidates.length === 0;

  return (
    <section className="grid gap-8">
      <div>
        <h1 className="text-2xl font-bold">Orchestrator Board</h1>
        {empty && (
          <p className="mt-2 text-muted">
            No data yet. <Link href="/samples" className="font-semibold underline">Load the sample data</Link> to begin.
          </p>
        )}
      </div>
      <BoardColumns cards={cards} />
      {foundational.length > 0 && (
        <p className="text-sm text-muted">
          Routed to the foundational track for now: {foundational.join(", ")}. No offer on this job yet, and the door stays open.
        </p>
      )}
    </section>
  );
}
