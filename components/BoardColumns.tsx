"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { DUR_FAST, DUR_MED, EASE_STANDARD } from "@/lib/motion";

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
              <h2 className="border-b-2 border-line pb-2 font-sans text-xs font-semibold uppercase tracking-wide text-muted">
                {name}
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
      {card.tone ? (
        <span className={`mt-2 inline-block rounded-md px-2 py-1 text-xs font-semibold ${card.tone === "guaranteed" ? "bg-accent text-ink" : "bg-line text-ink"}`}>
          {card.step}
        </span>
      ) : (
        <div className="mt-2 text-xs text-muted">{card.step}</div>
      )}
    </Link>
  );
}
