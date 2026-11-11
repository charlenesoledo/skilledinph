import { counts, storageLabel } from "@/lib/db";
import { loadSamples, resetSamples } from "./actions";

export const dynamic = "force-dynamic";

export default async function Page() {
  const c = await counts();
  return (
    <section className="max-w-2xl">
      <h1 className="text-2xl font-bold">Demo Data</h1>
      <p className="mt-2 text-stone-600">
        Loads the fictional sample set: TidyNest Online, the Listing &amp; Reply Checker job, and candidates Maria, Jomar and Rhea.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <form action={loadSamples}>
          <button className="rounded-lg bg-emerald-800 px-4 py-2 font-semibold text-white">Load sample data</button>
        </form>
        <form action={resetSamples}>
          <button className="rounded-lg border border-stone-300 px-4 py-2 font-semibold">Reset all data</button>
        </form>
      </div>
      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-stone-500">Storage: {storageLabel}</h2>
      <table className="mt-2 w-full max-w-sm text-sm">
        <tbody>
          {Object.entries(c).map(([table, n]) => (
            <tr key={table} className="border-b border-stone-200">
              <td className="py-1.5 font-mono">{table}</td>
              <td className="py-1.5 text-right tabular-nums">{n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
