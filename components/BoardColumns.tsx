"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";

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
type Placement = Record<string, Column | "off">;

// The board remembers where each card was the last time it was drawn, in this browser tab only.
// On the next visit, cards start where they were and glide to where they are now.
// Visual only: the columns themselves always come from the server.
const STORAGE_KEY = "orchestrator:board-placement";
export function rememberPlacement(placement: Placement) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(placement));
  } catch {}
}
function recallPlacement(): Placement | null {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
  } catch {
    return null;
  }
}

const EASE = [0.16, 1, 0.3, 1] as const; // ease-out
const STAGGER = 0.06;

export default function BoardColumns({ cards }: { cards: BoardCard[] }) {
  const reduce = useReducedMotion();
  const finalPlacement = useMemo(() => Object.fromEntries(cards.map((c) => [c.key, c.column])) as Placement, [cards]);
  const [placement, setPlacement] = useState<Placement>(finalPlacement);
  // Moves are only animated once the cards have faded in; the rewind to the old layout is instant.
  const [glide, setGlide] = useState(false);

  // Before the first paint: if the board looked different last time, start from that layout (cards are still invisible).
  useLayoutEffect(() => {
    const previous = recallPlacement();
    if (reduce || !previous) return;
    const start: Placement = {};
    let differs = false;
    for (const c of cards) {
      start[c.key] = previous[c.key] ?? c.column;
      if (start[c.key] !== c.column) differs = true;
    }
    if (differs) setPlacement(start);
    // Runs once per mount; later changes are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After the cards have faded in, move every card to its real column. Motion animates the move.
  useEffect(() => {
    const settle = reduce ? 0 : 350 + cards.length * STAGGER * 1000 + 200;
    const timer = setTimeout(() => {
      setGlide(true);
      setPlacement(finalPlacement);
      rememberPlacement(finalPlacement);
    }, settle);
    return () => clearTimeout(timer);
  }, [finalPlacement, cards.length, reduce]);

  const order = new Map(cards.map((c, i) => [c.key, i]));
  return (
    <LayoutGroup>
      <div className="grid gap-4 md:grid-cols-5">
        {COLUMNS.map((name) => {
          const inColumn = cards.filter((c) => placement[c.key] === name);
          return (
            <div key={name} className="min-w-0">
              <h2 className="border-b-2 border-line pb-2 font-sans text-xs font-semibold uppercase tracking-wide text-muted">
                {name}
              </h2>
              <div className="mt-3 grid gap-3">
                <AnimatePresence mode="popLayout">
                {inColumn.map((card) => {
                  const leaving = finalPlacement[card.key] === "off"; // shown here only until it glides off the board
                  return (
                    <motion.div
                      key={card.key}
                      layoutId={card.key}
                      layoutCrossfade={false}
                      // Fade in only on arrival; a card that changes columns later is already visible and just glides.
                      initial={reduce || glide ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      // A card leaving the board fades out where it stands; a card changing columns is
                      // drawn in its new column at once and glides there, so its old copy vanishes instantly.
                      exit={leaving ? { opacity: 0, scale: 0.96, transition: { duration: 0.3, ease: EASE } } : { opacity: 0, transition: { duration: 0 } }}
                      whileHover={reduce ? undefined : { y: -2 }}
                      transition={{
                        layout: { duration: glide ? 0.4 : 0, ease: EASE },
                        y: { duration: 0.35, ease: EASE, delay: (order.get(card.key) ?? 0) * STAGGER },
                        opacity: { duration: 0.35, ease: EASE, delay: (order.get(card.key) ?? 0) * STAGGER },
                      }}
                      className={leaving ? "pointer-events-none" : undefined}
                    >
                      <CardBody card={card} />
                    </motion.div>
                  );
                })}
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
