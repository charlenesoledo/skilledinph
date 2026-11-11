"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { DUR_FAST, DUR_MED, EASE_STANDARD } from "@/lib/motion";
import type { CandidateCardData } from "@/lib/stages";
import CandidateCardBody from "./CandidateCard";

export const COLUMNS = ["Job Secured", "Assessing", "Training", "Awaiting Employer Approval", "Offered"] as const;
type Column = (typeof COLUMNS)[number];
export type BoardCard = {
  key: string;
  column: Column | "off"; // "off" = not on the board (routed to the foundational track)
  title: string;
  sub: string;
  step: string;
  href: string;
  tone?: "guaranteed" | "waitlist";
  pay?: number | null;
  seats?: { taken: number; slots: number };
  person?: CandidateCardData; // set on candidate cards
};

// How often the open Board re-reads the data, so stage changes made elsewhere (another tab,
// the presenter's phone, Run full demo) appear here and glide into place.
const REFRESH_MS = 3000;

function useLiveRefresh() {
  const router = useRouter();
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const id = setInterval(tick, REFRESH_MS);
    return () => clearInterval(id);
  }, [router]);
}

// The Board draws every card in its column at once, with no entrance animation. The one motion is the
// stage glide: when a card's column changes while the Board is open, it moves there (FLIP, 300ms).
// Under reduced motion the card moves instantly and its outline flashes amber instead.
export default function BoardColumns({ cards }: { cards: BoardCard[] }) {
  useLiveRefresh();
  const reduce = useReducedMotion();

  // Remember each card's last column, to know which ones just moved.
  const lastColumn = useRef<Map<string, BoardCard["column"]>>(new Map());
  const moved = new Set<string>();
  for (const c of cards) {
    const before = lastColumn.current.get(c.key);
    if (before && before !== c.column) moved.add(c.key);
  }
  useEffect(() => {
    lastColumn.current = new Map(cards.map((c) => [c.key, c.column]));
  }, [cards]);
  // Where every card is now. Exiting cards read this through AnimatePresence's `custom`, so a card that
  // moved to another column vanishes at once (its new copy glides), while a card leaving the board fades out.
  const now = new Map(cards.map((c) => [c.key, c.column]));

  return (
    <LayoutGroup>
      <div className="grid gap-4 md:grid-cols-5">
        {COLUMNS.map((name) => {
          const inColumn = cards.filter((c) => c.column === name);
          return (
            <div key={name} className="min-w-0">
              <h2 className="flex items-center gap-2 border-b-2 border-line pb-2 font-sans text-xs font-semibold uppercase tracking-wide text-muted">
                <ColumnIcon column={name} />
                <span className="min-w-0 flex-1">{name}</span>
                <span className="rounded-full bg-line px-2 py-0.5 text-ink tabular-nums" aria-label={`${inColumn.length} in ${name}`}>
                  {inColumn.length}
                </span>
              </h2>
              <div className="mt-3 grid gap-3">
                <AnimatePresence mode="popLayout" initial={false} custom={now}>
                  {inColumn.map((card) => (
                    <motion.div
                      key={card.key}
                      layoutId={card.key}
                      layoutCrossfade={false}
                      initial={false}
                      animate={{ opacity: 1, scale: 1 }}
                      custom={now}
                      variants={{
                        gone: (current: Map<string, BoardCard["column"]>) => {
                          const where = current.get(card.key);
                          return where && where !== "off"
                            ? { opacity: 0, transition: { duration: 0 } }
                            : { opacity: 0, scale: 0.96, transition: { duration: DUR_FAST, ease: EASE_STANDARD } };
                        },
                      }}
                      exit="gone"
                      transition={{ layout: { duration: DUR_MED, ease: EASE_STANDARD } }}
                      className="relative"
                    >
                      <CardBody card={card} />
                      {reduce && moved.has(card.key) && (
                        <motion.span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-accent"
                          initial={{ opacity: 1 }}
                          animate={{ opacity: 0 }}
                          transition={{ duration: DUR_MED, ease: EASE_STANDARD }}
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {inColumn.length === 0 && <p className="text-sm text-muted">Empty</p>}
              </div>
            </div>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

function CardBody({ card }: { card: BoardCard }) {
  if (card.person)
    return (
      <Link href={card.href} className="card block p-4 hover:border-muted">
        <CandidateCardBody data={card.person}>
          <StatusLine card={card} />
        </CandidateCardBody>
      </Link>
    );
  return (
    <Link href={card.href} className="card block p-4 hover:border-muted">
      <div className="font-semibold">{card.title}</div>
      <div className="text-sm text-muted">{card.sub}</div>
      {card.pay != null && (
        <p className="big-number mt-3 text-primary">
          ₱{card.pay}
          <span className="ml-1 font-sans text-sm font-normal text-muted">/day</span>
        </p>
      )}
      {card.seats && (
        <p className="mt-2 font-display text-lg font-bold tabular-nums">
          {card.seats.taken}/{card.seats.slots}
          <span className="ml-1 font-sans text-xs font-normal text-muted">seats</span>
        </p>
      )}
      <div className="mt-2">
        <StatusLine card={card} />
      </div>
    </Link>
  );
}

function StatusLine({ card }: { card: BoardCard }) {
  return card.tone ? (
    <span className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${card.tone === "guaranteed" ? "bg-accent text-ink" : "bg-line text-ink"}`}>
      {card.step}
    </span>
  ) : (
    <div className="text-xs text-muted">{card.step}</div>
  );
}

// Column icons: simple line drawings that sit beside the column's name and count, never instead of them.
function ColumnIcon({ column }: { column: Column }) {
  const paths: Record<Column, string> = {
    "Job Secured": "M3 7h18v12H3zM8 7V5h8v2", // briefcase
    Assessing: "M8 4h8v3H8zM6 6h12v14H6zM9 12l2 2 4-4", // clipboard with tick
    Training: "M4 5h7a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-7a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h7z", // open book
    "Awaiting Employer Approval": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2", // clock
    Offered: "M12 3l2.4 2 3.1-.3.7 3 2.6 1.8-1.3 2.8 1.3 2.8-2.6 1.8-.7 3-3.1-.3L12 21l-2.4-2-3.1.3-.7-3L3.2 14.5l1.3-2.8L3.2 9l2.6-1.8.7-3 3.1.3zM9 12l2 2 4-4", // seal with tick
  };
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={paths[column]} />
    </svg>
  );
}
