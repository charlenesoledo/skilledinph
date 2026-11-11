// A skill's target (the employer's pass mark) on a 0–100 bar. Static: no animation.
export default function TargetBar({ label, target, note }: { label: string; target: number; note?: string }) {
  return (
    <div className="grid gap-1">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-semibold">{label}</span>
        <span className="text-sm text-muted tabular-nums">
          Target <b className="font-display text-base text-ink">{target}</b>/100
        </span>
      </div>
      <span className="relative block h-2.5 rounded-full bg-line" aria-hidden>
        <span className="absolute inset-y-0 left-0 rounded-full bg-primary/25" style={{ width: `${target}%` }} />
        <span className="absolute -top-1 -bottom-1 w-0.5 bg-ink" style={{ left: `${target}%` }} />
      </span>
      {note && <p className="text-sm text-muted">{note}</p>}
    </div>
  );
}
