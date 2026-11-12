import { all } from "@/lib/db";
import { uploadKnowledgeBase } from "@/app/employer/actions";
import PendingButton from "./PendingButton";
import Markdown, { section } from "./Markdown";

// The employer's Knowledge Base: "About the work" (KB §1), the full document in readable sections, and an
// upload that replaces it (.md or .txt). A PDF is accepted by name only: text extraction is a production feature.
export default async function KnowledgeBaseCard({ employerId }: { employerId: string }) {
  const kb = (await all("knowledge_bases")).filter((k) => k.employer_id === employerId).at(-1);
  const about = kb ? section(kb.body, 1) : null;
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold">Knowledge Base</h2>
        {kb && (
          <p className="text-xs text-muted">
            {kb.file_name} · v{kb.version} · updated {kb.updated_at.slice(0, 10)}
          </p>
        )}
      </div>
      {!kb ? (
        <p className="mt-2 text-sm text-muted">No Knowledge Base attached yet. Upload the document the agent should build the job from.</p>
      ) : (
        <>
          {kb.kind === "pdf" && (
            <p className="mt-2 rounded-lg bg-accent/30 px-3 py-2 text-sm">
              PDF received — text extraction is a production feature. The last text version is shown below.
            </p>
          )}
          {about && (
            <div className="mt-3">
              <h3 className="text-sm font-semibold">About the work</h3>
              <div className="mt-1"><Markdown source={about} /></div>
            </div>
          )}
          <details className="mt-4 rounded-xl border border-line p-4">
            <summary className="cursor-pointer text-sm font-semibold">Read the full document</summary>
            <div className="mt-3"><Markdown source={kb.body} /></div>
          </details>
        </>
      )}
      <form action={uploadKnowledgeBase.bind(null, employerId)} className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <label className="text-sm">
          <span className="sr-only">Knowledge Base file</span>
          <input type="file" name="file" accept=".md,.txt,.pdf,text/markdown,text/plain,application/pdf" required
            className="text-sm file:mr-3 file:rounded-lg file:border file:border-line file:bg-card file:px-3 file:py-1.5 file:text-sm file:font-semibold" />
        </label>
        <PendingButton label={kb ? "Upload to replace" : "Upload"} pendingLabel="Uploading…"
          className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold" />
        <span className="text-xs text-muted">.md or .txt replaces the text. PDF: file name only.</span>
      </form>
    </div>
  );
}
