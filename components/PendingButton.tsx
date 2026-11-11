"use client";

import { useFormStatus } from "react-dom";

// A submit button that shows it is working while its server action runs.
export default function PendingButton({ label, pendingLabel, className }: { label: string; pendingLabel: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} aria-busy={pending} className={`${className} disabled:cursor-wait disabled:opacity-60`}>
      {pending ? pendingLabel : label}
    </button>
  );
}
