// DEMO DATA. A built-in reference table of daily pay bands (PHP/day) by job type.
// These numbers are fictional and for the demo only. They are not live or verified market rates.
export type RateRow = { job_type: string; keywords: string[]; low: number; high: number };

export const RATE_TABLE: RateRow[] = [
  { job_type: "Listing and reply checking", keywords: ["listing", "reply"], low: 500, high: 650 },
  { job_type: "Customer support review", keywords: ["support", "ticket", "chat"], low: 480, high: 620 },
  { job_type: "Back-office exception handling", keywords: ["order", "payment", "invoice", "exception"], low: 520, high: 680 },
];
export const DEFAULT_RATE: RateRow = { job_type: "General human-in-the-loop check", keywords: [], low: 450, high: 600 };

export function lookupBand(text: string): RateRow {
  const t = text.toLowerCase();
  return RATE_TABLE.find((r) => r.keywords.some((k) => t.includes(k))) ?? DEFAULT_RATE;
}

export const bandLabel = (low: number, high: number) => `₱${low}–₱${high}/day (DEMO DATA — reference only)`;
