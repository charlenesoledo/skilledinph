// Two workspaces share one app and one database:
// - "demo": seeded and resettable, safe to present (MOCK MODE badge).
// - "live": saved records where the workflow genuinely runs (Knowledge Base, Assessment Pack, Skill Check).
// The viewer's choice lives in a cookie. Every database read and write is scoped to it (lib/db.ts).
import { cookies } from "next/headers";

export type Workspace = "demo" | "live";
export const WORKSPACE_COOKIE = "skilledinph-workspace";

export async function currentWorkspace(): Promise<Workspace> {
  try {
    return (await cookies()).get(WORKSPACE_COOKIE)?.value === "live" ? "live" : "demo";
  } catch {
    return "demo"; // outside a request (build time): the demo workspace
  }
}
