"use client";

import { ArrowRight, Check, Route } from "lucide-react";
import { SKILL_PATH } from "@/lib/growth";
import { SkillLabel } from "./CandidateIcons";
import { useT } from "./Locale";

// "Your skill path": the skills this job builds, and where the job leads. Display only.
// Candidates routed to the Foundational Track start there; everyone else starts at Listing Checker.
export default function SkillPathCard({ skills, foundational }: {
  skills: { skill: string; met: boolean | null }[]; foundational: boolean;
}) {
  const t = useT();
  const path = foundational ? ["Foundational Track", ...SKILL_PATH] : [...SKILL_PATH];
  return (
    <div className="grid gap-4 card p-6">
      <h2 className="flex items-center gap-2 text-xl font-bold"><Route aria-hidden className="h-5 w-5 shrink-0 text-primary" />{t("skillPathTitle")}</h2>
      {skills.length > 0 && (
        <div>
          <p className="text-sm text-muted">{t("skillPathSkills")}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {skills.map((s) => (
              <li key={s.skill} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm ${s.met ? "bg-primary/10 font-semibold text-primary" : "bg-paper text-ink"}`}>
                <SkillLabel skill={s.skill} />
                {s.met && <Check aria-hidden className="h-4 w-4" strokeWidth={2.5} />}
              </li>
            ))}
          </ul>
        </div>
      )}
      <ol className="grid gap-2">
        {path.map((step, i) => (
          <li key={step} className="grid gap-1">
            <span className={`flex items-center justify-between gap-2 rounded-xl px-4 py-3 text-base ${i === 0 ? "border-2 border-primary font-bold" : "border border-line"}`}>
              <span>{step}</span>
              {i === 0 && <span className="text-xs font-semibold uppercase tracking-wide text-primary">{t("skillPathStart")}</span>}
            </span>
            {i < path.length - 1 && <ArrowRight aria-hidden className="mx-auto h-4 w-4 rotate-90 text-muted" />}
          </li>
        ))}
      </ol>
      <p className="text-base font-semibold">{t("skillPathLine")}</p>
    </div>
  );
}
