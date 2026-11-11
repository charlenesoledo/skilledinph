import type { CandidateCardData } from "@/lib/stages";

// The candidate card, used on the Board and the Pool: initials, name, the job and its employer,
// confirmed pay, skills met in a bar and in words, and how long they have been in this stage.
// Presentational only (no hooks), so server and client components can both render it.
export default function CandidateCardBody({ data, children }: { data: CandidateCardData; children?: React.ReactNode }) {
  const pct = data.skillsMet != null && data.skillsTotal ? (data.skillsMet / data.skillsTotal) * 100 : 0;
  return (
    <div className="grid gap-3">
      <div className="flex items-start gap-3">
        <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
          {data.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold">{data.name}</p>
            <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-xs text-muted" title="Days in this stage">
              Day {data.day}
            </span>
          </div>
          <p className="text-sm text-muted">{data.location}</p>
        </div>
      </div>
      {data.jobTitle && (
        <div className="text-sm">
          <p className="font-medium">{data.jobTitle}</p>
          <p className="text-muted">
            {data.employerName}
            {data.pay != null && (
              <>
                {" · "}
                <span className="font-semibold text-ink tabular-nums">₱{data.pay}/day</span>
              </>
            )}
          </p>
        </div>
      )}
      <div>
        {data.skillsMet != null ? (
          <>
            <span className="block h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
              <span className="block h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </span>
            <p className="mt-1 text-xs text-muted tabular-nums">
              {data.skillsMet} of {data.skillsTotal} skills at target
            </p>
          </>
        ) : (
          <p className="text-xs text-muted">Skills: not assessed yet</p>
        )}
      </div>
      {children}
    </div>
  );
}
