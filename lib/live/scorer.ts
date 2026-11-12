// Skill Check scorer: plain code, never the LLM. It applies the employer-approved key exactly, including
// partial credit, and nothing else. It is blind: it receives the answers and the pack, never a name.
import type { PackItem, ScoredTask } from "../types";

export function scoreSkillCheck(items: PackItem[], answers: Record<string, string[]>) {
  const tasks: ScoredTask[] = items.map((it) => {
    const picked = [...new Set(answers[String(it.n)] ?? [])].filter((k) => it.choices.some((c) => c.key === k)).sort();
    if (it.kind === "multi") {
      const hits = picked.filter((k) => it.correct.includes(k)).length;
      const falseFlags = picked.filter((k) => !it.correct.includes(k)).length;
      const max = it.per_hit * it.correct.length + it.bonus_if_no_false;
      const points = Math.min(max, hits * it.per_hit + (falseFlags === 0 ? it.bonus_if_no_false : 0));
      const note = `${hits} of ${it.correct.length} errors found${falseFlags ? `, ${falseFlags} correct detail${falseFlags > 1 ? "s" : ""} falsely flagged` : ", no false flag"}`;
      return { n: it.n, skill: it.skill, answer: picked, points, max, note };
    }
    const max = Math.max(...Object.values(it.points));
    const choice = picked[0];
    const points = choice ? it.points[choice] ?? 0 : 0;
    const note = !choice ? "No answer" : points === max ? "Correct" : points > 0 ? "Partly correct" : "Not correct";
    return { n: it.n, skill: it.skill, answer: choice ? [choice] : [], points, max, note };
  });
  const per_skill: Record<string, number> = {};
  for (const t of tasks) per_skill[t.skill] = (per_skill[t.skill] ?? 0) + t.points;
  return { tasks, per_skill };
}
