"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Workspace } from "@/lib/workspace";

// Demo role switcher (no login). The active role is derived from the URL,
// so there is no hidden role state in the UI.
const ROLES = [
  { role: "Board", href: "/", links: [{ href: "/", label: "Board" }, { href: "/samples", label: "Demo Data" }] },
  { role: "Employer", href: "/employer", links: [{ href: "/employer", label: "Job Intake" }, { href: "/pool", label: "Candidate Pool" }] },
  { role: "Candidate", href: "/candidate/cand_jomar", links: [] },
];

function roleFor(path: string) {
  if (path.startsWith("/employer") || path.startsWith("/pool")) return "Employer";
  if (path.startsWith("/candidate")) return "Candidate";
  return "Board";
}

export default function RoleSwitcher({ workspace }: { workspace: Workspace }) {
  const path = usePathname();
  // The Candidate tab opens Jomar in either workspace; Live pool records carry a live_ id.
  const roles = ROLES.map((r) => (r.role === "Candidate" && workspace === "live" ? { ...r, href: "/candidate/live_cand_jomar" } : r))
    .map((r) => (r.role === "Board" && workspace === "live" ? { ...r, links: [{ href: "/", label: "Board" }, { href: "/samples", label: "Live Data" }] } : r));
  const active = roleFor(path);
  const links = roles.find((r) => r.role === active)?.links ?? [];
  return (
    <nav className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2" aria-label="Role switcher">
      <div className="flex rounded-full border border-line p-0.5 text-sm">
        {roles.map((r) => (
          <Link
            key={r.role}
            href={r.href}
            aria-current={r.role === active ? "true" : undefined}
            className={`rounded-full px-4 py-1.5 font-medium ${r.role === active ? "bg-primary text-white" : "text-muted hover:text-ink"}`}
          >
            {r.role}
          </Link>
        ))}
      </div>
      <div className="flex gap-4 text-sm">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={path === l.href ? "font-semibold underline underline-offset-4" : "text-muted hover:text-ink"}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
