"use client";

import { Check, Minus } from "lucide-react";
import { JOURNEY_ICONS } from "./CandidateIcons";
import { useT } from "./Locale";
import type { StringKey } from "@/lib/i18n/candidate";

export type JourneyStep = keyof typeof JOURNEY_ICONS;
export type StepState = "done" | "current" | "upcoming" | "skipped";

const ORDER: { step: JourneyStep; label: StringKey }[] = [
  { step: "assessment", label: "journeyAssessment" },
  { step: "gap", label: "journeyGap" },
  { step: "module", label: "journeyModule" },
  { step: "test", label: "journeyTest" },
  { step: "offer", label: "journeyOffer" },
];

// The candidate's whole journey for one job: Assessment → Your gap → Module → Final test → Offer.
// Finished steps are ticked, the current one is highlighted, steps this candidate did not need are dimmed.
export default function Journey({ states }: { states: Record<JourneyStep, StepState> }) {
  const t = useT();
  return (
    <ol className="grid grid-cols-5" aria-label={t("journeyLabel")}>
      {ORDER.map(({ step, label }, i) => {
        const state = states[step];
        const Icon = state === "done" ? Check : state === "skipped" ? Minus : JOURNEY_ICONS[step];
        return (
          <li key={step} className="relative grid justify-items-center gap-1.5 text-center" aria-current={state === "current" ? "step" : undefined}>
            {i > 0 && (
              <span aria-hidden className={`absolute right-1/2 top-[17px] h-0.5 w-full ${
                state === "done" || state === "current" ? "bg-primary" : "bg-line"
              }`} />
            )}
            <span
              aria-hidden
              className={`relative z-10 grid h-9 w-9 place-items-center rounded-full ${
                state === "done"
                  ? "bg-primary text-white"
                  : state === "current"
                    ? "border-2 border-primary bg-card text-primary ring-4 ring-primary/15"
                    : "border-2 border-line bg-card text-muted"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2.25} />
            </span>
            <span className={`text-xs leading-tight ${state === "current" ? "font-bold text-ink" : state === "done" ? "font-semibold text-ink" : "text-muted"}`}>
              {t(label)}
              {state === "skipped" && <span className="sr-only"> ({t("journeySkipped")})</span>}
              {state === "done" && <span className="sr-only"> ({t("journeyDone")})</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
