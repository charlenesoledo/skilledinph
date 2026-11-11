import type { RunState } from "@/lib/runs";
import PendingButton, { RUNNING_STYLE } from "./PendingButton";

// One button for every agent step. Shows a failed run honestly, offers one retry, then stops (HR7).
export default function AgentRunButton({
  action, label, retryLabel, state, disabled = false, variant = "primary", pendingLabel,
}: {
  action: () => Promise<void>; label: string; retryLabel: string; state: RunState; disabled?: boolean; variant?: "primary" | "secondary";
  pendingLabel?: string; // shown while the run is in flight; without it the label stays and only the button disables
}) {
  const style = variant === "primary"
    ? "rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-40"
    : "rounded-lg border border-line px-3 py-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="grid gap-2">
      {state.failed && <p className="text-sm text-ink">Run failed: {state.error}</p>}
      {state.exhausted ? (
        <p className="text-sm font-medium text-ink">Failed again after one retry. No further retries; reset the demo data to start over.</p>
      ) : (
        <form action={action}>
          <PendingButton disabled={disabled} className={style} label={state.failed ? retryLabel : label}
            pendingLabel={pendingLabel ?? (state.failed ? retryLabel : label)} pendingClassName={pendingLabel ? RUNNING_STYLE : undefined} />
        </form>
      )}
    </div>
  );
}
