"use client";

import { useTransition } from "react";
import { setWorkspace } from "@/app/workspace-actions";
import type { Workspace } from "@/lib/workspace";

// "Demo | Live" pill. Demo is the seeded, resettable stage copy; Live is saved records where the workflow runs.
export default function WorkspaceSwitcher({ workspace }: { workspace: Workspace }) {
  const [pending, start] = useTransition();
  const option = (value: Workspace, label: string) => (
    <button
      type="button"
      disabled={pending}
      onClick={() => value !== workspace && start(() => setWorkspace(value))}
      aria-pressed={workspace === value}
      className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide disabled:cursor-wait ${
        workspace === value ? "bg-primary text-white" : "text-muted hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
  return (
    <div role="group" aria-label="Workspace" className="flex items-center rounded-full border border-line p-0.5">
      {option("demo", "Demo")}
      {option("live", "Live")}
    </div>
  );
}
