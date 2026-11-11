import Link from "next/link";
import { all } from "@/lib/db";
import { currentModule } from "@/lib/modules";
import { candidateCard, candidateStage } from "@/lib/stages";
import type { Module } from "@/lib/types";
import BoardColumns, { type BoardCard } from "@/components/BoardColumns";
import BoardStats, { type BoardStatsData } from "@/components/BoardStats";

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
  const profiles = await all("skill_profiles");
  for (const c of candidates) {
    // Stage rules live in lib/stages.ts, shared with the Pool. "off" = routed to the foundational track;
    // kept as a card so it can leave the board visibly.
    const stage = candidateStage(c, { assessments, plans, offers, currentModule: current });
    if (stage.column === "off") foundational.push(c.display_name);
    cards.push({
      key: c.id, column: stage.column, title: c.display_name, sub: c.location_label, step: stage.step, href: `/candidate/${c.id}`,
      tone: stage.tone, person: candidateCard(c, stage.since, { jobs, employers, assessments, profiles }),
    });
  }
  const empty = jobs.length === 0 && candidates.length === 0;

  // Summary strip, computed from the data on every render.
  const pays = jobs.filter((j) => j.pay_status === "confirmed" && j.pay_confirmed).map((j) => j.pay_confirmed as number);
  const stats: BoardStatsData = {
    jobsSecured: jobs.filter((j) => j.pay_status === "confirmed").length,
    seatsTaken: jobs.reduce((n, j) => n + j.seats_taken, 0),
    seatsTotal: jobs.reduce((n, j) => n + j.reserved_slots, 0),
    payLow: pays.length ? Math.min(...pays) : 0,
    payHigh: pays.length ? Math.max(...pays) : 0,
    guaranteedOffers: offers.filter((o) => o.guaranteed).length,
  };

  return (
    <section className="grid gap-8">
      <div>
        <h1 className="text-2xl font-bold">Orchestrator Board</h1>
        <p className="mt-1 text-muted">Training ends in work, not just a certificate.</p>
        {empty && (
          <p className="mt-2 text-muted">
            No data yet. <Link href="/samples" className="font-semibold underline">Load the sample data</Link> to begin.
          </p>
        )}
      </div>
      <BoardStats stats={stats} />
      <BoardColumns cards={cards} />
      {foundational.length > 0 && (
        <p className="text-sm text-muted">
          Routed to the foundational track for now: {foundational.join(", ")}. No offer on this job yet, and the door stays open.
        </p>
      )}
    </section>
  );
}
