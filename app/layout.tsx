import type { Metadata } from "next";
import RoleSwitcher from "@/components/RoleSwitcher";
import { llmMode } from "@/lib/mode";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orchestrator",
  description: "A real job first, then the training, then a guaranteed offer.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
            <span className="text-xl font-bold tracking-tight">Orchestrator</span>
            {llmMode() === "mock" && (
              <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900">Mock Mode</span>
            )}
            <RoleSwitcher />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
