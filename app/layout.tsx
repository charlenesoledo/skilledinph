import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import RoleSwitcher from "@/components/RoleSwitcher";
import { LocaleProvider } from "@/components/Locale";
import { llmMode } from "@/lib/mode";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });

export const metadata: Metadata = {
  title: "Orchestrator",
  description: "A real job first, then the training, then a guaranteed offer.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <LocaleProvider>
        <header className="border-b border-line bg-card">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
            <span className="font-display text-xl font-bold tracking-tight">Orchestrator</span>
            {llmMode() === "mock" && (
              <span className="rounded-md bg-accent px-2 py-1 text-xs font-semibold uppercase tracking-wide text-ink">Mock Mode</span>
            )}
            <RoleSwitcher />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </LocaleProvider>
      </body>
    </html>
  );
}
