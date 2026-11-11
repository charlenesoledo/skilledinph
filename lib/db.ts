// Data layer. Every read and write in the app goes through these functions.
// - Supabase, when NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are both set (tables in supabase/schema.sql).
// - Otherwise the local JSON fallback: one file per table under /data (spec Section 8).
// Server-side only: the service role key never reaches the browser.
import { promises as fs } from "fs";
import path from "path";
import { TABLE_NAMES, type TableName, type Tables } from "./types";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const usingSupabase = Boolean(SB_URL && SB_KEY);
export const storageLabel = usingSupabase ? "Supabase" : "Local JSON (/data)";

// ---------- Supabase (PostgREST over fetch, no extra dependency) ----------
// Counts database round trips, so slow flows can be measured (see runFullDemo).
export const dbStats = { calls: 0 };

async function sb(pathAndQuery: string, init: RequestInit & { prefer?: string } = {}): Promise<unknown> {
  dbStats.calls++;
  const res = await fetch(`${SB_URL}/rest/v1/${pathAndQuery}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: SB_KEY!, Authorization: `Bearer ${SB_KEY}`, "content-type": "application/json",
      ...(init.prefer ? { Prefer: init.prefer } : {}),
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status} on ${pathAndQuery.split("?")[0]}: ${(await res.text()).slice(0, 200)}`);
  const body = await res.text();
  return body ? JSON.parse(body) : null;
}
// `seq` is a database-only column that keeps rows in insertion order. It is never part of an app row.
const strip = <R>(row: R): R => {
  const { seq: _seq, ...rest } = row as R & { seq?: number };
  return rest as R;
};
const byId = (id: string) => `id=eq.${encodeURIComponent(id)}`;

// ---------- Local JSON ----------
// Vercel's project directory is read-only at runtime; /tmp is writable there but not shared between instances.
const DIR = process.env.VERCEL ? "/tmp/orchestrator-data" : path.join(process.cwd(), "data");
const file = (t: TableName) => path.join(DIR, `${t}.json`);
// Each JSON call reads and rewrites a whole file, so calls run one at a time; otherwise two updates
// made in parallel (Promise.all) would overwrite each other. Supabase calls are not queued.
let queue: Promise<unknown> = Promise.resolve();
function locked<R>(fn: () => Promise<R>): Promise<R> {
  const run = queue.then(fn);
  queue = run.catch(() => undefined);
  return run;
}
async function readFileRaw<T extends TableName>(table: T): Promise<Tables[T][]> {
  try {
    return JSON.parse(await fs.readFile(file(table), "utf8"));
  } catch {
    return [];
  }
}
async function writeFileRaw<T extends TableName>(table: T, rows: Tables[T][]) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(file(table), JSON.stringify(rows, null, 2));
}
const readFile = <T extends TableName>(table: T) => locked(() => readFileRaw(table));
const writeFile = <T extends TableName>(table: T, rows: Tables[T][]) => locked(() => writeFileRaw(table, rows));
const modifyFile = <T extends TableName, R>(table: T, fn: (rows: Tables[T][]) => { rows: Tables[T][]; result: R }) =>
  locked(async () => {
    const { rows, result } = fn(await readFileRaw(table));
    await writeFileRaw(table, rows);
    return result;
  });

// ---------- Public API ----------
export async function all<T extends TableName>(table: T): Promise<Tables[T][]> {
  if (usingSupabase) return ((await sb(`${table}?select=*&order=seq.asc`)) as Tables[T][]).map(strip);
  return readFile(table);
}

export async function get<T extends TableName>(table: T, id: string): Promise<Tables[T] | undefined> {
  if (!id) return undefined;
  if (usingSupabase) {
    const rows = (await sb(`${table}?select=*&${byId(id)}`)) as Tables[T][];
    return rows[0] ? strip(rows[0]) : undefined;
  }
  return (await readFile(table)).find((r) => r.id === id);
}

export async function insert<T extends TableName>(table: T, row: Tables[T]): Promise<Tables[T]> {
  const clean = strip(row);
  if (usingSupabase) await sb(table, { method: "POST", body: JSON.stringify(clean), prefer: "return=minimal" });
  else await modifyFile(table, (rows) => ({ rows: [...rows, clean], result: null }));
  return clean;
}

// Several rows into one table in a single round trip, keeping their order.
export async function insertMany<T extends TableName>(table: T, rows: Tables[T][]): Promise<Tables[T][]> {
  const clean = rows.map(strip);
  if (clean.length === 0) return clean;
  if (usingSupabase) await sb(table, { method: "POST", body: JSON.stringify(clean), prefer: "return=minimal" });
  else await modifyFile(table, (rows) => ({ rows: [...rows, ...clean], result: null }));
  return clean;
}

export async function update<T extends TableName>(table: T, id: string, patch: Partial<Tables[T]>): Promise<Tables[T]> {
  if (usingSupabase) {
    const rows = (await sb(`${table}?${byId(id)}`, {
      method: "PATCH", body: JSON.stringify(strip(patch)), prefer: "return=representation",
    })) as Tables[T][];
    if (!rows?.[0]) throw new Error(`${table}: no row with id ${id}`);
    return strip(rows[0]);
  }
  return modifyFile(table, (rows) => {
    const i = rows.findIndex((r) => r.id === id);
    if (i < 0) throw new Error(`${table}: no row with id ${id}`);
    rows[i] = { ...rows[i], ...patch };
    return { rows, result: rows[i] };
  });
}

export async function clearAll() {
  if (usingSupabase)
    await Promise.all(TABLE_NAMES.map((t) => sb(`${t}?id=neq.__none__`, { method: "DELETE", prefer: "return=minimal" })));
  else for (const t of TABLE_NAMES) await writeFile(t, []);
}

export async function counts(): Promise<Record<TableName, number>> {
  const lengths = await Promise.all(TABLE_NAMES.map(async (t) => (await all(t)).length));
  return Object.fromEntries(TABLE_NAMES.map((t, i) => [t, lengths[i]])) as Record<TableName, number>;
}

// Demo-only switch for showing HR7: when set, the next agent run fails once.
const flagFile = path.join(DIR, "_demo_flags.json");
export async function getFailNext(): Promise<boolean> {
  if (usingSupabase) {
    const rows = (await sb(`demo_flags?select=fail_next_run&${byId("demo")}`)) as { fail_next_run: boolean }[];
    return rows[0]?.fail_next_run === true;
  }
  try { return JSON.parse(await fs.readFile(flagFile, "utf8")).fail_next_run === true; } catch { return false; }
}
export async function setFailNext(on: boolean) {
  if (usingSupabase) {
    await sb("demo_flags", {
      method: "POST", body: JSON.stringify({ id: "demo", fail_next_run: on }), prefer: "resolution=merge-duplicates,return=minimal",
    });
    return;
  }
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(flagFile, JSON.stringify({ fail_next_run: on }));
}
