"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function RoleSwitcher() {
  const path = usePathname();
  const active = roleFor(path);
  const links = ROLES.find((r) => r.role === active)?.links ?? [];
  return (
    <nav className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2" aria-label="Role switcher">
      <div className="flex rounded-full border border-stone-300 p-0.5 text-sm">
        {ROLES.map((r) => (
          <Link
            key={r.role}
            href={r.href}
            aria-current={r.role === active ? "true" : undefined}
            className={`rounded-full px-4 py-1.5 font-medium ${r.role === active ? "bg-emerald-800 text-white" : "text-stone-600 hover:text-stone-900"}`}
          >
            {r.role}
          </Link>
        ))}
      </div>
      <div className="flex gap-4 text-sm">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={path === l.href ? "font-semibold underline underline-offset-4" : "text-stone-600 hover:text-stone-900"}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
