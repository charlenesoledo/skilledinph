// A small Markdown renderer for the Knowledge Base: headings, paragraphs, lists, tables, blockquotes,
// **bold**, *italic* and `code`. Text is rendered as React text nodes, never as raw HTML.
import { Fragment, type ReactNode } from "react";

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("**")) out.push(<strong key={i++}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith("`")) out.push(<code key={i++} className="rounded bg-paper px-1 font-mono text-[0.9em]">{t.slice(1, -1)}</code>);
    else out.push(<em key={i++}>{t.slice(1, -1)}</em>);
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const cells = (line: string) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

export default function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const cls = level === 1 ? "text-xl font-bold" : level === 2 ? "mt-2 text-lg font-bold" : "font-semibold";
      blocks.push(<p key={k++} className={cls} role="heading" aria-level={level + 1}>{inline(h[2])}</p>);
      i++;
      continue;
    }
    if (line.trim().startsWith("|")) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(lines[i++]);
      const [head, , ...body] = rows;
      blocks.push(
        <div key={k++} className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted"><tr>{cells(head).map((c, j) => <th key={j} className="py-1 pr-3 font-medium">{inline(c)}</th>)}</tr></thead>
            <tbody>
              {body.map((r, n) => (
                <tr key={n} className="border-t border-line align-top">{cells(r).map((c, j) => <td key={j} className="py-1.5 pr-3">{inline(c)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      while (i < lines.length && (ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/).test(lines[i])) {
        items.push(lines[i].replace(ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/, ""));
        i++;
      }
      const List = ordered ? "ol" : "ul";
      blocks.push(
        <List key={k++} className={`grid gap-1 pl-5 text-sm ${ordered ? "list-decimal" : "list-disc"}`}>
          {items.map((it, n) => <li key={n}>{inline(it)}</li>)}
        </List>,
      );
      continue;
    }
    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) quote.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push(<blockquote key={k++} className="border-l-2 border-line pl-3 text-sm">{inline(quote.join(" "))}</blockquote>);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|\||>|\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i])) para.push(lines[i++]);
    blocks.push(<p key={k++} className="text-sm">{inline(para.join(" "))}</p>);
  }
  return <div className="grid gap-3">{blocks.map((b, n) => <Fragment key={n}>{b}</Fragment>)}</div>;
}

// The body of one "## N. Title" section, or null when the document has no such section.
export function section(source: string, number: number): string | null {
  const m = source.match(new RegExp(`^##\\s+${number}\\.[^\\n]*\\n([\\s\\S]*?)(?=^##\\s|$(?![\\s\\S]))`, "m"));
  return m ? m[1].trim() : null;
}
