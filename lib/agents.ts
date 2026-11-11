// The single wrapper for every agent call (spec Section 12). Server-side only: keys never reach the browser.
// Every run is written to `runs` (HR7). With no LLM key, or after two non-JSON replies, the built-in
// sample output is used and the run is marked mock.
import { insert } from "./db";
import { llmMode } from "./mode";
import type { KeyedItem, TargetSkill } from "./types";
import { SAMPLE_ASSESSMENT_ITEMS } from "./assessment-items";
import { lookupBand } from "./rate-table";

export type AgentOutputs = {
  job_analyzer: { skills: TargetSkill[]; rubric: string[] };
  rate_research: { band_low: number; band_high: number; basis: string };
  assessor: { items: KeyedItem[] };
};
export type AgentName = keyof AgentOutputs;

const SYSTEM: Record<AgentName, string> = {
  job_analyzer:
    "You break a human-job into skills. Given the job's tasks, why-human note, and good/bad examples, output JSON only: " +
    "{skills: [{skill, target (0-100), why}], rubric: [checklist items]}. Use 3–5 skills. Targets must be justified by " +
    "the examples: a skill the bad example fails must have a target of 70 or higher.",
  rate_research:
    "You propose a pay band for a job type from the provided reference table only. Output JSON only: " +
    "{band_low, band_high, basis: 'reference table (demo data)'}. Never present the band as a verified live market rate.",
  assessor:
    "You create short task-based assessment items for a job's skills. Each item is a tiny real task (spot the error, " +
    "choose the reply, fix the detail) with ONE keyed correct answer. Output JSON only: " +
    "{items: [{skill, prompt, choices, correct_index}]}. 6 items, covering every target skill at least once. " +
    "Plain language, phone-readable.",
};

const MOCK: { [K in AgentName]: (input: unknown) => AgentOutputs[K] } = {
  job_analyzer: () => ({
    skills: [
      { skill: "Price & Detail Accuracy", target: 80, why: "The bad example shows one price in the title and another in the body." },
      { skill: "Taglish Tone Judgment", target: 75, why: "The bad example uses a stiff English reply." },
      { skill: "Reading Comprehension", target: 70, why: "The checker must read the whole listing and message to catch both." },
    ],
    rubric: [
      "Price matches in the title, body, and variant",
      "Product name, size, and count are correct",
      "Reply sounds like natural Taglish",
      "Reply answers every question the customer asked",
    ],
  }),
  rate_research: (input) => {
    const row = lookupBand(String((input as { job_type?: string })?.job_type ?? ""));
    return { band_low: row.low, band_high: row.high, basis: "reference table (demo data)" };
  },
  assessor: () => ({ items: SAMPLE_ASSESSMENT_ITEMS }),
};

const validItem = (i: KeyedItem) =>
  typeof i?.skill === "string" && typeof i.prompt === "string" && Array.isArray(i.choices) && i.choices.length >= 2 &&
  Number.isInteger(i.correct_index) && i.correct_index >= 0 && i.correct_index < i.choices.length;

const VALID: { [K in AgentName]: (o: unknown) => boolean } = {
  job_analyzer: (o) => {
    const x = o as AgentOutputs["job_analyzer"];
    return (
      Array.isArray(x?.skills) && x.skills.length >= 3 && x.skills.length <= 5 &&
      x.skills.every((s) => typeof s.skill === "string" && typeof s.target === "number" && s.target >= 0 && s.target <= 100) &&
      Array.isArray(x.rubric) && x.rubric.every((r) => typeof r === "string")
    );
  },
  rate_research: (o) => {
    const x = o as AgentOutputs["rate_research"];
    return typeof x?.band_low === "number" && typeof x.band_high === "number" && x.band_low > 0 && x.band_low < x.band_high;
  },
  assessor: (o) => {
    const x = o as AgentOutputs["assessor"];
    return Array.isArray(x?.items) && x.items.length === 6 && x.items.every(validItem);
  },
};

async function callLLM(mode: "claude" | "gemini", system: string, user: string): Promise<string> {
  if (mode === "claude") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-5-5", max_tokens: 4000, system, messages: [{ role: "user", content: user }],
      }),
    });
    if (!res.ok) throw new Error(`Claude API error ${res.status}`);
    const data = await res.json();
    return data.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
  }
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

function parse(text: string): unknown {
  try {
    return JSON.parse(text.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/, "").trim());
  } catch {
    return undefined;
  }
}

export type AgentResult<K extends AgentName> =
  | { ok: true; output: AgentOutputs[K]; mock: boolean }
  | { ok: false; error: string };

export async function runAgent<K extends AgentName>(
  name: K, input: unknown, ref: { type: string; id: string },
): Promise<AgentResult<K>> {
  const started_at = new Date().toISOString();
  const mode = llmMode();
  let mock = mode === "mock";
  let output: AgentOutputs[K] | undefined;
  let error: string | null = null;

  try {
    if (mode === "mock") {
      output = MOCK[name](input);
    } else {
      const user = JSON.stringify(input);
      let o = parse(await callLLM(mode, SYSTEM[name], user));
      if (!VALID[name](o)) o = parse(await callLLM(mode, SYSTEM[name] + "\nOutput JSON only, no other text.", user));
      if (VALID[name](o)) output = o as AgentOutputs[K];
      else {
        // Spec Section 15: never let a parse error stop the loop.
        output = MOCK[name](input);
        mock = true;
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  await insert("runs", {
    id: `run_${crypto.randomUUID().slice(0, 8)}`, agent: name, ref_type: ref.type, ref_id: ref.id,
    started_at, finished_at: new Date().toISOString(), ok: !error, error, mock,
  });
  return error || !output ? { ok: false, error: error ?? "No output" } : { ok: true, output, mock };
}
