"use client";

import { useLocale, useT } from "./Locale";

// The final-test result message under the score. The QA Explainer writes it in Taglish; in TL mode that
// message shows as written. In EN mode the same facts (score, correct answers, pass mark) are shown in English.
export default function ResultMessage({ stored, score, correct, total, pass, passed, missedSkills, retakeLeft }: {
  stored: string | null; score: number; correct: number; total: number; pass: number | string;
  passed: boolean; missedSkills: string[]; retakeLeft: boolean;
}) {
  const { locale } = useLocale();
  const t = useT();
  if (stored === null) return <>{passed ? t("resultFallback", { score, pass }) : t("resultSaved")}</>;
  if (locale === "tl") return <>{stored}</>;
  if (passed) return <>{t("resultPassedMsg", { score, correct, total, pass })}</>;
  return (
    <>
      {t("resultFailedMsg", { score, correct, total, pass, skills: missedSkills.join(", ") })}{" "}
      {retakeLeft ? t("resultRetakeLeft") : t("resultNoRetake")}
    </>
  );
}
