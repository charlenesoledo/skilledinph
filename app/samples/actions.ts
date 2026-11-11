"use server";

import { revalidatePath } from "next/cache";
import { clearAll } from "@/lib/db";
import { loadSampleData } from "@/lib/sample-data";

export async function loadSamples() {
  await loadSampleData();
  revalidatePath("/", "layout");
}

export async function resetSamples() {
  await clearAll();
  revalidatePath("/", "layout");
}
