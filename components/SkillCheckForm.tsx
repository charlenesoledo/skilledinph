"use client";

import { useState } from "react";
import { useT } from "./Locale";
import Markdown from "./Markdown";

// The candidate's Skill Check: the tasks only (no key, no points), phone-first with large tap targets.
// Task 1 is multi-select. Submit stays disabled until every task has an answer; it can be submitted once.
export type CandidateTask = {
  n: number; kind: "single" | "multi"; prompt: string; quote?: string; choices: { key: string; text: string }[];
};

export default function SkillCheckForm({ tasks, action }: { tasks: CandidateTask[]; action: (form: FormData) => Promise<void> }) {
  const t = useT();
  const [picked, setPicked] = useState<Record<number, string[]>>({});
  const [sending, setSending] = useState(false);
  const answered = tasks.every((it) => (picked[it.n] ?? []).length > 0);
  const toggle = (it: CandidateTask, key: string, on: boolean) =>
    setPicked((p) => {
      const cur = p[it.n] ?? [];
      return { ...p, [it.n]: it.kind === "single" ? [key] : on ? [...cur, key] : cur.filter((k) => k !== key) };
    });
  return (
    <form action={action} onSubmit={() => setSending(true)} className="grid gap-5">
      <p className="text-base">{t("checkIntro")}</p>
      {tasks.map((it) => (
        <fieldset key={it.n} className="card grid gap-3 p-5">
          <legend className="sr-only">{t("checkTaskN", { n: it.n })}</legend>
          <p className="text-sm font-semibold text-muted">{t("checkTaskN", { n: it.n })}</p>
          <Markdown source={it.prompt} />
          {it.quote && <blockquote className="border-l-2 border-line pl-3 text-base">{it.quote}</blockquote>}
          {it.kind === "multi" && <p className="text-sm text-muted">{t("checkPickAll")}</p>}
          {it.choices.map((c) => (
            <label key={c.key} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-4 py-3 text-base has-[:checked]:border-primary has-[:checked]:bg-primary/10">
              <input
                type={it.kind === "multi" ? "checkbox" : "radio"} name={`t${it.n}`} value={c.key}
                onChange={(e) => toggle(it, c.key, e.target.checked)}
                className="mt-1.5 h-4 w-4 shrink-0 accent-primary"
              />
              <span><b>{c.key}.</b> {c.text}</span>
            </label>
          ))}
        </fieldset>
      ))}
      {!answered && <p className="text-sm text-muted">{t("checkAnswerAll", { count: tasks.length })}</p>}
      <button disabled={!answered || sending}
        className="block w-full rounded-xl bg-primary px-4 py-4 text-center text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
        {t("checkSubmit")}
      </button>
    </form>
  );
}
