"use client";

import { ClipboardList } from "lucide-react";
import { SkillLabel } from "./CandidateIcons";
import { useT } from "./Locale";
import type { StringKey } from "@/lib/i18n/candidate";

// "How we measured your skills": the Skill Check task behind each score, and how the candidate did.
// Display only. Scores are the candidate's existing assessment scores, unchanged.
type Row = { skill: string; score: number; target: number };

const TASKS: Record<string, StringKey> = {
  "Price & Detail Accuracy": "checkTaskPrice",
  "Taglish Tone Judgment": "checkTaskTone",
  "Prompt Judgment": "checkTaskPrompt",
};

export default function SkillCheckCard({ skills }: { skills: Row[] }) {
  const t = useT();
  const result = ({ skill, score, target }: Row) => {
    // Three planted errors: the score maps to how many were found.
    if (skill === "Price & Detail Accuracy") return t("checkFound", { n: Math.min(3, Math.max(0, Math.round((score * 3) / 100))) });
    // One right answer among three choices: right when the score meets the employer's target.
    if (skill === "Taglish Tone Judgment") return score >= target ? t("checkCorrect") : t("checkNotYet");
    return t("checkScore", { score });
  };
  return (
    <div className="grid gap-4 rounded-xl border border-line p-5">
      <div>
        <h3 className="flex items-center gap-2 font-bold"><ClipboardList aria-hidden className="h-5 w-5 shrink-0 text-primary" />{t("skillCheckTitle")}</h3>
        <p className="mt-1 text-sm text-muted">{t("skillCheckSub")}</p>
      </div>
      <ul className="grid gap-4">
        {skills.map((row) => (
          <li key={row.skill} className="grid gap-1.5 border-t border-line pt-4 text-base first:border-t-0 first:pt-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SkillLabel skill={row.skill} className="font-semibold" />
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${row.score >= row.target ? "bg-primary/10 text-primary" : "bg-line text-ink"}`}>
                {t("checkChip", { score: row.score, target: row.target })}
              </span>
            </div>
            {TASKS[row.skill] && (
              <p className="text-sm"><span className="font-semibold text-muted">{t("checkTaskLabel")}: </span>{t(TASKS[row.skill])}</p>
            )}
            <p className="text-sm"><span className="font-semibold text-muted">{t("checkResultLabel")}: </span>{result(row)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
