import { currentModule } from "@/lib/modules";
import { GROWTH_UNITS, SKILL_SOURCE } from "@/lib/growth";
import type { Job } from "@/lib/types";

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full bg-paper px-2 py-0.5 text-xs font-semibold text-muted">{children}</span>
);

// Job Review: the course outline, built from the employer's Knowledge Base. Layer A is the job module the
// final test depends on; Layer B is optional growth units for upskilling. Display only.
export default async function CourseOutline({ job }: { job: Job }) {
  const mod = await currentModule(job.id);
  return (
    <div className="card p-5">
      <h2 className="text-lg font-bold">Course outline — built from the employer&apos;s Knowledge Base</h2>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="font-semibold">Layer A — Job module (required for the test)</h3>
          {mod ? (
            <ol className="mt-2 grid gap-2">
              {mod.sections.map((s, i) => (
                <li key={s.id} className="grid gap-1 rounded-xl border border-line p-3 text-sm">
                  <span className="font-semibold">{i + 1}. {s.title}</span>
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-muted">{s.skill}</span>
                    <Chip>Source: {SKILL_SOURCE[s.skill] ?? "Knowledge Base"}</Chip>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-sm text-muted">Appears once the Module Builder has run. Candidates train only the sections for their own gap.</p>
          )}
        </div>
        <div>
          <h3 className="font-semibold">Layer B — Growth units (optional — for upskilling)</h3>
          <ul className="mt-2 grid gap-2">
            {GROWTH_UNITS.map((u) => (
              <li key={u.key} className="grid gap-1 rounded-xl border border-dashed border-line p-3 text-sm">
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{u.title_en}</span>
                  <span className="rounded bg-line px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide">Optional</span>
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-muted tabular-nums">~{u.minutes} min</span>
                  <Chip>Source: {u.source}</Chip>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">Growth units never block the final test and do not count toward any gap.</p>
        </div>
      </div>
    </div>
  );
}
