// Data layer. Local JSON fallback: one file per table under /data (spec Section 8).
// Every read and write in the app goes through these functions, so a Supabase
// adapter can replace the file calls here without touching pages or rules.
import { promises as fs } from "fs";
import path from "path";
import { TABLE_NAMES, type TableName, type Tables } from "./types";

// Vercel's project directory is read-only at runtime; /tmp is writable there.
const DIR = process.env.VERCEL ? "/tmp/orchestrator-data" : path.join(process.cwd(), "data");
const file = (t: TableName) => path.join(DIR, `${t}.json`);

export const storageLabel = "Local JSON (/data)";

export async function all<T extends TableName>(table: T): Promise<Tables[T][]> {
  try {
    return JSON.parse(await fs.readFile(file(table), "utf8"));
  } catch {
    return [];
  }
}

async function write<T extends TableName>(table: T, rows: Tables[T][]) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(file(table), JSON.stringify(rows, null, 2));
}

export async function get<T extends TableName>(table: T, id: string): Promise<Tables[T] | undefined> {
  return (await all(table)).find((r) => r.id === id);
}

export async function insert<T extends TableName>(table: T, row: Tables[T]): Promise<Tables[T]> {
  await write(table, [...(await all(table)), row]);
  return row;
}

export async function update<T extends TableName>(table: T, id: string, patch: Partial<Tables[T]>): Promise<Tables[T]> {
  const rows = await all(table);
  const i = rows.findIndex((r) => r.id === id);
  if (i < 0) throw new Error(`${table}: no row with id ${id}`);
  rows[i] = { ...rows[i], ...patch };
  await write(table, rows);
  return rows[i];
}

export async function clearAll() {
  for (const t of TABLE_NAMES) await write(t, []);
}

export async function counts(): Promise<Record<TableName, number>> {
  const out = {} as Record<TableName, number>;
  for (const t of TABLE_NAMES) out[t] = (await all(t)).length;
  return out;
}

// Demo-only switch for showing HR7: when set, the next agent run fails once. Stored beside the tables.
const flagFile = path.join(DIR, "_demo_flags.json");
export async function getFailNext(): Promise<boolean> {
  try { return JSON.parse(await fs.readFile(flagFile, "utf8")).fail_next_run === true; } catch { return false; }
}
export async function setFailNext(on: boolean) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(flagFile, JSON.stringify({ fail_next_run: on }));
}
