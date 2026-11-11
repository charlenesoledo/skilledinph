import Link from "next/link";
import { all } from "@/lib/db";
import { createJob } from "./actions";

export const dynamic = "force-dynamic";

const FIELDS: { name: string; label: string; hint: string; long?: boolean }[] = [
  { name: "title", label: "Job title", hint: "What you call this human step" },
  { name: "workflow_step", label: "Workflow step", hint: "Where in your agent's workflow a human is needed" },
  { name: "why_human", label: "Why a human is needed", hint: "What the agent gets wrong or cannot judge", long: true },
  { name: "tasks", label: "Tasks", hint: "What the person does, step by step", long: true },
  { name: "good_example", label: "Good output example", hint: "What correct work looks like", long: true },
  { name: "bad_example", label: "Bad output example", hint: "What must be caught", long: true },
  { name: "tools_needed", label: "Tools needed", hint: "For example: smartphone with internet" },
];
const input = "mt-1 w-full card px-3 py-2";

export default async function Page() {
  const [jobs, employers] = await Promise.all([all("jobs"), all("employers")]);
  const employer = employers[0];
  return (
    <section className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div>
        <h1 className="text-2xl font-bold">Job Intake</h1>
        <p className="mt-2 text-muted">
          Submit a Human Job Card: one workflow step that still needs a person. Training is only built after a real job exists.
        </p>
        {!employer ? (
          <p className="mt-4 text-muted">
            No employer yet. <Link href="/samples" className="font-semibold underline">Load the sample data</Link> first.
          </p>
        ) : (
          <form action={createJob} className="mt-6 grid gap-4">
            <p className="text-sm text-muted">Posting as <b>{employer.name}</b></p>
            {FIELDS.map((f) => (
              <label key={f.name} className="block text-sm font-medium">
                {f.label}
                {f.long
                  ? <textarea name={f.name} id={f.name} required rows={2} placeholder={f.hint} className={input} />
                  : <input name={f.name} id={f.name} required placeholder={f.hint} className={input} />}
              </label>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium">
                Reserved slots
                <input name="reserved_slots" id="reserved_slots" type="number" min={1} required defaultValue={1} className={input} />
              </label>
              <label className="block text-sm font-medium">
                Deadline
                <input name="deadline" id="deadline" type="date" required className={input} />
              </label>
            </div>
            <div>
              <button className="rounded-lg bg-primary px-4 py-2 font-semibold text-white">Save Job Card</button>
            </div>
          </form>
        )}
      </div>
      <div>
        <h2 className="text-lg font-bold">Your jobs</h2>
        {jobs.length === 0 && <p className="mt-2 text-sm text-muted">No jobs yet.</p>}
        <ul className="mt-3 grid gap-2">
          {jobs.map((j) => (
            <li key={j.id}>
              <Link href={`/employer/jobs/${j.id}`} className="block card p-3 hover:border-muted">
                <div className="font-semibold">{j.title}</div>
                <div className="mt-1 text-xs text-muted">
                  Status: {j.status} · {j.reserved_slots} reserved slots · {j.target_skills.length ? `${j.target_skills.length} skills` : "skills not analyzed"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
