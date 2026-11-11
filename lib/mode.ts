// One LLM only: Claude if ANTHROPIC_API_KEY is set, else Gemini if GEMINI_API_KEY is set, else Mock Mode.
export function llmMode(): "claude" | "gemini" | "mock" {
  if (process.env.ANTHROPIC_API_KEY) return "claude";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return "mock";
}
