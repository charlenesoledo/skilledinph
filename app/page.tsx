import Link from "next/link";
import { all } from "@/lib/db";

export const dynamic = "force-dynamic";

const COLUMNS = ["Job Secured", "Assessing", "Training", "Awaiting Employer Approval", "Offered"] as const;
type Card = { key: string; title: string; sub: string; step: string; href: string };

export default async function Page() {
  const [jobs, employers, candidates, assessments] = await Promise.all([
    all("jobs"), all("employers"), all("candidates"), all("assessments"),
  ]);
  const cols: Record<(typeof COLUMNS)[number], Card[]> = {
    "Job Secured": [], Assessing: [], Training: [], "Awaiting Employer Approval": [], Offered: [],
  };
  const foundational: string[] = [];
  for (const j of jobs) {
    cols["Job Secured"].push({
      key: j.id, title: j.title, sub: employers.find((e) => e.id === j.employer_id)?.name ?? "",
      step: `Status: ${j.status} · ${j.pay_status === "confirmed" ? `₱${j.pay_confirmed}/day` : "pay not confirmed"} · Seats ${j.seats_taken}/${j.reserved_slots}`,
      href: `/employer/jobs/${j.id}`,
    });
  }
  for (const c of candidates) {
    const a = assessments.find((x) => x.candidate_id === c.id);
    const card = (step: string): Card => ({ key: c.id, title: c.display_name, sub: c.location_label, step, href: `/candidate/${c.id}` });
    if (!a) cols.Assessing.push(card("Not assessed yet"));
    else if (a.sorting === "ready") cols.Assessing.push(card("READY · no gap · offer is the next step"));
    else if (a.sorting === "trainable")
      cols["Awaiting Employer Approval"].push(card(`TRAINABLE · gap ~${a.total_gap_hours} hours · waiting for an approved module`));
    else foundational.push(c.display_name);
  }
  const empty = jobs.length === 0 && candidates.length === 0;

  return (
    <section>
      <h1 className="text-2xl font-bold">Orchestrator Board</h1>
      {empty && (
        <p className="mt-2 text-stone-600">
          No data yet. <Link href="/samples" className="font-semibold underline">Load the sample data</Link> to begin.
        </p>
      )}
      <div className="mt-6 grid gap-4 md:grid-cols-5">
        {COLUMNS.map((name) => (
          <div key={name} className="min-w-0">
            <h2 className="border-b-2 border-stone-300 pb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">{name}</h2>
            <div className="mt-3 grid gap-2">
              {cols[name].map((card) => (
                <Link key={card.key} href={card.href} className="rounded-lg border border-stone-200 bg-white p-3 hover:border-stone-400">
                  <div className="font-semibold">{card.title}</div>
                  <div className="text-sm text-stone-600">{card.sub}</div>
                  <div className="mt-1 text-xs text-stone-500">{card.step}</div>
                </Link>
              ))}
              {cols[name].length === 0 && <p className="text-sm text-stone-400">Empty</p>}
            </div>
          </div>
        ))}
      </div>
      {foundational.length > 0 && (
        <p className="mt-6 text-sm text-stone-600">
          Routed to the foundational track for now: {foundational.join(", ")}. No offer on this job yet, and the door stays open.
        </p>
      )}
    </section>
  );
}
