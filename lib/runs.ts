// HR7: a failed agent run is shown honestly and may be retried once.
import type { Run } from "./types";

export type RunState = { failed: boolean; exhausted: boolean; error: string | null };
export const MAX_FAILS_IN_A_ROW = 2; // the first failure plus one failed retry

export function runState(runs: Run[], agent: string, refId: string): RunState {
  const mine = runs.filter((r) => r.agent === agent && r.ref_id === refId);
  let fails = 0;
  for (let i = mine.length - 1; i >= 0 && !mine[i].ok; i--) fails++;
  return { failed: fails > 0, exhausted: fails >= MAX_FAILS_IN_A_ROW, error: fails > 0 ? mine.at(-1)!.error : null };
}
