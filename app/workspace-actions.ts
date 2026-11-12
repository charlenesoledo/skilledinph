"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { WORKSPACE_COOKIE, currentWorkspace, type Workspace } from "@/lib/workspace";
import { liveIsEmpty, loadLiveRecords } from "@/lib/live/seed";

// Switch workspace. The first visit to Live loads its starting records (employer + Knowledge Base,
// the TidyNest job as a draft, and the 6 pool records). After that, Live keeps whatever was saved.
export async function setWorkspace(ws: Workspace) {
  (await cookies()).set(WORKSPACE_COOKIE, ws, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  if (ws === "live" && (await liveIsEmpty())) await loadLiveRecords();
  revalidatePath("/", "layout");
  redirect("/");
}

// Live only: wipe the Live workspace and load its starting records again. The demo workspace is untouched.
export async function resetLive() {
  if ((await currentWorkspace()) !== "live") return;
  await loadLiveRecords();
  revalidatePath("/", "layout");
}
