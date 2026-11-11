import Link from "next/link";
import { all, counts, getFailNext, storageLabel } from "@/lib/db";
import PendingButton from "@/components/PendingButton";
import FullDemoRunner from "@/components/FullDemoRunner";
import { addFourth, loadSamples, resetSamples, runFullDemo, toggleFailNext } from "./actions";

export const dynamic = "force-dynamic";

const primary = "rounded-lg bg-primary px-4 py-2 font-semibold text-white";
const secondary = "rounded-lg border border-line px-4 py-2 font-semibold disabled:opacity-40";

export default async function Page() {
  const [c, runs, failNext] = await Promise.all([counts(), all("runs"), getFailNext()]);
  return (
    <section className="grid gap-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold">Demo Data</h1>
        <p className="mt-2 text-muted">
          Loads the fictional sample set: TidyNest Online, the Listing &amp; Reply Checker job, and candidates Maria, Jomar and Rhea.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <form action={loadSamples}><PendingButton label="Load sample data" pendingLabel="Loading…" className={primary} /></form>
          <form action={resetSamples}><PendingButton label="Reset all data" pendingLabel="Resetting…" className={secondary} /></form>
        </div>
        <div className="mt-5">
          <FullDemoRunner action={runFullDemo} className={primary} />
        </div>
        <p className="mt-3 text-sm text-muted">
          Run full demo reloads the sample data and steps the job through the whole loop: analyze, rate, assess, build and approve
          the module, train, test, offer, accept, and rate, then opens the <Link href="/" className="font-semibold underline">Board</Link>.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <form action={addFourth}><button disabled={c.candidates === 0} className={secondary}>Add 4th candidate</button></form>
          <form action={toggleFailNext}>
            <button aria-pressed={failNext} className={`${secondary} ${failNext ? "border-accent text-ink" : ""}`}>
              {failNext ? "Next agent run will fail (click to cancel)" : "Make the next agent run fail"}
            </button>
          </form>
        </div>
        <p className="mt-3 text-sm text-muted">
          The 4th candidate, Paolo, is optional: assess him after both slots are taken to see the waitlist, labelled NOT GUARANTEED.
          The failure switch is a demo tool: the next agent run fails once, is logged below, and can be retried once.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <h2 className="text-lg font-bold">Agent runs</h2>
          {runs.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No agent has run yet. Every run is logged here, including failed ones.</p>
          ) : (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                    <th className="py-2 pr-3">#</th><th className="py-2 pr-3">Agent</th><th className="py-2 pr-3">Ref</th>
                    <th className="py-2 pr-3">Result</th><th className="py-2">Finished</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r, i) => (
                    <tr key={r.id} className="border-b border-line align-top">
                      <td className="py-1.5 pr-3 tabular-nums">{i + 1}</td>
                      <td className="py-1.5 pr-3 font-mono">{r.agent}</td>
                      <td className="py-1.5 pr-3">{r.ref_type}: {r.ref_id}</td>
                      <td className="py-1.5 pr-3">
                        <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${r.ok ? "bg-primary/10 text-primary" : "bg-accent text-ink"}`}>
                          {r.ok ? "ok" : "failed"}
                        </span>
                        {r.mock && <span className="ml-1 rounded bg-accent/30 px-1.5 py-0.5 text-xs font-semibold text-ink">mock</span>}
                        {r.error && <div className="mt-1 text-xs text-ink">{r.error}</div>}
                      </td>
                      <td className="py-1.5 font-mono text-xs">{r.finished_at.slice(11, 19)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold">Storage: {storageLabel}</h2>
          <table className="mt-2 w-full text-sm">
            <tbody>
              {Object.entries(c).map(([table, n]) => (
                <tr key={table} className="border-b border-line">
                  <td className="py-1.5 font-mono">{table}</td>
                  <td className="py-1.5 text-right tabular-nums">{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
