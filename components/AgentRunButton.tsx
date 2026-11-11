import type { RunState } from "@/lib/runs";

// One button for every agent step. Shows a failed run honestly, offers one retry, then stops (HR7).
export default function AgentRunButton({
  action, label, retryLabel, state, disabled = false, variant = "primary",
}: {
  action: () => Promise<void>; label: string; retryLabel: string; state: RunState; disabled?: boolean; variant?: "primary" | "secondary";
}) {
  const style = variant === "primary"
    ? "rounded-lg bg-emerald-800 px-4 py-2 font-semibold text-white disabled:opacity-40"
    : "rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="grid gap-2">
      {state.failed && <p className="text-sm text-red-700">Run failed: {state.error}</p>}
      {state.exhausted ? (
        <p className="text-sm font-medium text-red-700">Failed again after one retry. No further retries; reset the demo data to start over.</p>
      ) : (
        <form action={action}>
          <button disabled={disabled} className={style}>{state.failed ? retryLabel : label}</button>
        </form>
      )}
    </div>
  );
}
