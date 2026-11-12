import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import RoleSwitcher from "@/components/RoleSwitcher";
import { LocaleProvider } from "@/components/Locale";
import LocaleToggle from "@/components/LocaleToggle";
import HeaderBrand from "@/components/HeaderBrand";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";
import { currentWorkspace } from "@/lib/workspace";
import { llmMode } from "@/lib/mode";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });

export const metadata: Metadata = {
  title: "SkilledinPH",
  description: "A real job first, then the training, then a guaranteed offer.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const workspace = await currentWorkspace();
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <LocaleProvider>
        <header className="border-b border-line bg-card">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
            <HeaderBrand />
            <WorkspaceSwitcher workspace={workspace} />
            {workspace === "live" ? (
              <span className="grid">
                <span className="w-fit rounded-md bg-primary px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white">Live Workspace</span>
                <span className="mt-0.5 text-xs text-muted">Sample business data — the workflow is real.</span>
              </span>
            ) : llmMode() === "mock" && (
              <span className="rounded-md bg-accent px-2 py-1 text-xs font-semibold uppercase tracking-wide text-ink">Mock Mode</span>
            )}
            <LocaleToggle />
            <RoleSwitcher workspace={workspace} />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </LocaleProvider>
      </body>
    </html>
  );
}
