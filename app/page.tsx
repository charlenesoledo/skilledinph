import Link from "next/link";
import { all } from "@/lib/db";

export const dynamic = "force-dynamic";

const COLUMNS = ["Job Secured", "Assessing", "Training", "Awaiting Employer Approval", "Offered"] as const;
type Card = { key: string; title: string; sub: string; step: string; href: string };

export default async function Page() {
  const [jobs, employers, candidates] = await Promise.all([all("jobs"), all("employers"), all("candidates")]);
  const cols: Record<(typeof COLUMNS)[number], Card[]> = {
    "Job Secured": [], Assessing: [], Training: [], "Awaiting Employer Approval": [], Offered: [],
  };
  for (const j of jobs) {
    cols["Job Secured"].push({
      key: j.id, title: j.title, sub: employers.find((e) => e.id === j.employer_id)?.name ?? "",
      step: `Status: ${j.status} · Seats ${j.seats_taken}/${j.reserved_slots}`, href: `/employer/jobs/${j.id}`,
    });
  }
  for (const c of candidates) {
    cols.Assessing.push({
      key: c.id, title: c.display_name, sub: c.location_label, step: "Not assessed yet", href: `/candidate/${c.id}`,
    });
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
    </section>
  );
}
