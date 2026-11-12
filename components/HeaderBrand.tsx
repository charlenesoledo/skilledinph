"use client";

import { usePathname } from "next/navigation";
import { useT } from "./Locale";

// Brand name and tagline. The tagline is the same in both languages. On candidate pages it never
// stands alone: the clarifying line (TL or EN) sits directly under it.
export const BRAND = "SkilledinPH";
export const BRAND_TAGLINE = "Pag gusto, may paraan!";

export default function HeaderBrand() {
  const t = useT();
  const candidatePage = usePathname()?.startsWith("/candidate") ?? false;
  return (
    <div className="grid">
      <span className="font-display text-xl font-bold tracking-tight">{BRAND}</span>
      <span className="text-sm font-semibold text-primary">{BRAND_TAGLINE}</span>
      {candidatePage && <span className="text-sm text-muted">{t("taglineClarifier")}</span>}
    </div>
  );
}
