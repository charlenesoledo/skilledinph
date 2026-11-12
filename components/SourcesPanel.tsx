import { CircleCheck } from "lucide-react";
import { lookupBand } from "@/lib/rate-table";
import type { Job } from "@/lib/types";

// "Sources the agent used": what the Job Analyzer, Rate Research and Assessor worked from.
// Display only. Nothing here feeds or changes any computation. Illustrative content is tagged "Sample data".

const SampleTag = () => (
  <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-ink">Sample data</span>
);

function SourceCard({ n, title, sample, children }: { n: number; title: string; sample?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid content-start gap-3 rounded-xl border border-line p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold"><span className="text-muted tabular-nums">{n}. </span>{title}</h3>
        {sample && <SampleTag />}
      </div>
      {children}
    </div>
  );
}

const GOOD = [
  "Bamboo Laundry Hamper, ₱650. 45 × 35 cm, natural bamboo with cotton liner. Delivery fee ₱80 within Metro Manila.",
  "Cotton Throw Pillow Cover, ₱180 each. 45 × 45 cm, 100% cotton, zip closure. Delivery fee ₱60.",
];
const BAD = [
  "Ceramic Mug Set ₱399. No size, no material, and no delivery fee stated.",
  "BEST STORAGE BOX EVER!!! BUY NOW BEFORE IT'S GONE!!! (all-caps, shouting tone)",
];

// Skill Check tasks, one per job skill (the same tasks candidates see on their page).
const CHECK_TASKS: Record<string, string> = {
  "Price & Detail Accuracy": "Check a sample listing whose price, size, and delivery fee contain errors. Find them.",
  "Taglish Tone Judgment": "Choose the reply a friendly seller would send to an unhappy buyer (3 choices).",
  "Prompt Judgment": "Pick the clearest instruction to give an AI helper for writing a product description (3 choices).",
};

// Five illustrative scanned rates spread across the reference band.
const SAMPLE_RATES: { platform: string; role: string; at: number }[] = [
  { platform: "Shopee", role: "Listing checker", at: 0.13 },
  { platform: "Lazada", role: "Product encoder", at: 0.4 },
  { platform: "Facebook Marketplace", role: "Listing checker", at: 0 },
  { platform: "OnlineJobs", role: "Product encoder", at: 0.67 },
  { platform: "Upwork", role: "Listing checker", at: 1 },
];

export default function SourcesPanel({ job }: { job: Job }) {
  const band = lookupBand(`${job.title} ${job.tasks}`);
  const rate = (at: number) => Math.round((band.low + at * (band.high - band.low)) / 10) * 10;
  return (
    <div className="card p-5">
      <h2 className="text-lg font-bold">Sources the agent used</h2>
      <p className="mt-1 text-sm text-muted">What the agents worked from for this job. Shown for reference; nothing here changes a score or a rate.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <SourceCard n={1} title="Job description">
          <p className="text-sm text-muted">Your submitted text (excerpt)</p>
          <blockquote className="border-l-2 border-line pl-3 text-sm">
            <p>{job.tasks}</p>
            <p className="mt-2">{job.why_human}</p>
          </blockquote>
        </SourceCard>

        <SourceCard n={2} title="Employer rules & examples" sample>
          <div className="grid gap-3 text-sm">
            <div>
              <p className="font-semibold text-primary">Good</p>
              <ul className="mt-1 grid gap-1 list-disc pl-5">{GOOD.map((g) => <li key={g}>{g}</li>)}</ul>
            </div>
            <div>
              <p className="font-semibold text-ink">Bad</p>
              <ul className="mt-1 grid gap-1 list-disc pl-5">{BAD.map((b) => <li key={b}>{b}</li>)}</ul>
            </div>
          </div>
        </SourceCard>

        <SourceCard n={3} title="Rate research" sample>
          <p className="text-sm">200 similar listings scanned</p>
          <table className="w-full text-left text-sm">
            <thead className="text-muted">
              <tr><th className="py-1 pr-2 font-medium">Platform</th><th className="py-1 pr-2 font-medium">Role</th><th className="py-1 text-right font-medium">Rate/day</th></tr>
            </thead>
            <tbody>
              {SAMPLE_RATES.map((r) => (
                <tr key={r.platform} className="border-t border-line">
                  <td className="py-1.5 pr-2">{r.platform}</td>
                  <td className="py-1.5 pr-2">{r.role}</td>
                  <td className="py-1.5 text-right tabular-nums">₱{rate(r.at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted">Band = middle range of scanned rates.</p>
          <p className="flex gap-1.5 text-xs">
            <CircleCheck aria-hidden className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span><b>Wage floor check ✓</b> — employment-type roles are checked against the regional minimum wage; below-floor rates are blocked.</span>
          </p>
        </SourceCard>

        <SourceCard n={4} title="Candidate skill check">
          {job.target_skills.length > 0 ? (
            <ul className="grid gap-2 text-sm">
              {job.target_skills.map((s) => (
                <li key={s.skill}><span className="font-semibold">{s.skill}:</span> {CHECK_TASKS[s.skill] ?? "A short task for this skill (3 choices)."}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">The skill check is set once the Job Analyzer has run.</p>
          )}
          <p className="text-xs text-muted">Every candidate answers the same check. Scoring is blind.</p>
        </SourceCard>
      </div>
    </div>
  );
}
