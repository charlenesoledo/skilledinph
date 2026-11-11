import Link from "next/link";
import { all, counts, getFailNext, storageLabel } from "@/lib/db";
import { addFourth, loadSamples, resetSamples, runFullDemo, toggleFailNext } from "./actions";

export const dynamic = "force-dynamic";

const primary = "rounded-lg bg-emerald-800 px-4 py-2 font-semibold text-white";
const secondary = "rounded-lg border border-stone-300 px-4 py-2 font-semibold disabled:opacity-40";

export default async function Page() {
  const [c, runs, failNext] = await Promise.all([counts(), all("runs"), getFailNext()]);
  return (
    <section className="grid gap-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold">Demo Data</h1>
        <p className="mt-2 text-stone-600">
          Loads the fictional sample set: TidyNest Online, the Listing &amp; Reply Checker job, and candidates Maria, Jomar and Rhea.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <form action={loadSamples}><button className={primary}>Load sample data</button></form>
          <form action={resetSamples}><button className={secondary}>Reset all data</button></form>
          <form action={runFullDemo}><button className={primary}>Run full demo</button></form>
        </div>
        <p className="mt-3 text-sm text-stone-600">
          Run full demo reloads the sample data and steps the job through the whole loop: analyze, rate, assess, build and approve
          the module, train, test, offer, accept, and rate. Then open the <Link href="/" className="font-semibold underline">Board</Link>.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <form action={addFourth}><button disabled={c.candidates === 0} className={secondary}>Add 4th candidate</button></form>
          <form action={toggleFailNext}>
            <button aria-pressed={failNext} className={`${secondary} ${failNext ? "border-red-600 text-red-700" : ""}`}>
              {failNext ? "Next agent run will fail (click to cancel)" : "Make the next agent run fail"}
            </button>
          </form>
        </div>
        <p className="mt-3 text-sm text-stone-600">
          The 4th candidate, Paolo, is optional: assess him after both slots are taken to see the waitlist, labelled NOT GUARANTEED.
          The failure switch is a demo tool: the next agent run fails once, is logged below, and can be retried once.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <h2 className="text-lg font-bold">Agent runs</h2>
          {runs.length === 0 ? (
            <p className="mt-2 text-sm text-stone-600">No agent has run yet. Every run is logged here, including failed ones.</p>
          ) : (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-300 text-left text-xs uppercase tracking-wide text-stone-500">
                    <th className="py-2 pr-3">#</th><th className="py-2 pr-3">Agent</th><th className="py-2 pr-3">Ref</th>
                    <th className="py-2 pr-3">Result</th><th className="py-2">Finished</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r, i) => (
                    <tr key={r.id} className="border-b border-stone-200 align-top">
                      <td className="py-1.5 pr-3 tabular-nums">{i + 1}</td>
                      <td className="py-1.5 pr-3 font-mono">{r.agent}</td>
                      <td className="py-1.5 pr-3">{r.ref_type}: {r.ref_id}</td>
                      <td className="py-1.5 pr-3">
                        <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${r.ok ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-800"}`}>
                          {r.ok ? "ok" : "failed"}
                        </span>
                        {r.mock && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-900">mock</span>}
                        {r.error && <div className="mt-1 text-xs text-red-700">{r.error}</div>}
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
                <tr key={table} className="border-b border-stone-200">
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
