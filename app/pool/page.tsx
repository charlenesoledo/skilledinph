import Link from "next/link";
import { all } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [candidates, jobs] = await Promise.all([all("candidates"), all("jobs")]);
  return (
    <section>
      <h1 className="text-2xl font-bold">Candidate Pool</h1>
      <p className="mt-2 text-stone-600">All candidates are fictional demo people.</p>
      {candidates.length === 0 ? (
        <p className="mt-4 text-stone-600">
          No candidates yet. <Link href="/samples" className="font-semibold underline">Load the sample data</Link>.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-300 text-left text-xs uppercase tracking-wide text-stone-500">
                <th className="py-2 pr-4">Candidate</th>
                <th className="py-2 pr-4">Location</th>
                <th className="py-2 pr-4">Foundational level</th>
                {jobs.map((j) => <th key={j.id} className="py-2 pr-4">{j.title}</th>)}
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id} className="border-b border-stone-200">
                  <td className="py-2 pr-4 font-semibold">
                    <Link href={`/candidate/${c.id}`} className="underline-offset-4 hover:underline">{c.display_name}</Link>
                  </td>
                  <td className="py-2 pr-4">{c.location_label}</td>
                  <td className="py-2 pr-4">{c.foundational_level}</td>
                  {jobs.map((j) => <td key={j.id} className="py-2 pr-4 text-stone-600">Not assessed</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
