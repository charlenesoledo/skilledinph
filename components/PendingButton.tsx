"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

// The muted-green "in flight" look shared by every running button (same as "Running the full loop…").
export const RUNNING_STYLE = "rounded-lg bg-primary px-4 py-2 font-semibold text-white opacity-60 cursor-wait";

// A submit button that shows it is working while its server action runs. It is disabled while running,
// ignores a second click that lands before the disabled state is drawn, and restores its label when the
// action finishes or fails.
export default function PendingButton({
  label, pendingLabel, className, pendingClassName, disabled = false,
}: { label: string; pendingLabel: string; className: string; pendingClassName?: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  const submitted = useRef(false);
  useEffect(() => {
    if (!pending) submitted.current = false;
  }, [pending]);
  return (
    <button
      disabled={disabled || pending}
      aria-busy={pending}
      onClick={(e) => {
        if (submitted.current) e.preventDefault();
        else submitted.current = true;
      }}
      className={pending && pendingClassName ? pendingClassName : `${className} disabled:cursor-wait disabled:opacity-60`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
