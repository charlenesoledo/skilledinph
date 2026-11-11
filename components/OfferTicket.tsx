"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCountUp } from "./useCountUp";

// The offer moment: the stamp lands, the pay counts up, and the seats counter fills.
// Display only; the offer itself was already created by the Matcher on the server.
export default function OfferTicket({
  guaranteed, employerName, title, pay, start, seatsTaken, slots,
}: {
  guaranteed: boolean; employerName: string; title: string; pay: number; start: string; seatsTaken: number; slots: number;
}) {
  const reduce = useReducedMotion();
  const shownPay = useCountUp(pay, 800, 250);
  const shownSeats = useCountUp(seatsTaken, 600, 450);
  return (
    <div className="grid gap-2 rounded-2xl border-2 border-dashed border-ink bg-card p-5">
      <motion.span
        initial={reduce ? false : { scale: 1.6, rotate: 0, opacity: 0 }}
        animate={{ scale: 1, rotate: -8, opacity: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 18, mass: 0.8 }}
        className={`mb-1 w-fit origin-left rounded-md border-2 px-3 py-2 font-display text-base font-bold tracking-[0.18em] ${
          guaranteed ? "border-ink bg-accent text-ink" : "border-muted bg-line text-ink"
        }`}
      >
        {guaranteed ? "GUARANTEED" : "NOT GUARANTEED · WAITLIST"}
      </motion.span>
      <p className="text-sm text-muted">{guaranteed ? "Job offer" : "Waitlist"} mula sa {employerName}</p>
      <p className="text-xl font-bold">{title}</p>
      <p className="big-number text-[48px]" aria-label={`₱${pay} kada araw`}>
        ₱{shownPay}
        <span className="ml-1 font-sans text-base font-normal text-muted">/ araw</span>
      </p>
      <p className="text-base">Simula: {start}</p>
      <p className="flex items-baseline gap-2 text-base" aria-label={`Slots: ${seatsTaken} sa ${slots} ang napunan`}>
        <span className="font-display text-2xl font-bold tabular-nums">
          {shownSeats}/{slots}
        </span>
        <span className="text-muted">slots ang napunan</span>
      </p>
      {guaranteed && <p className="text-base text-muted">Walang application. Walang interview.</p>}
    </div>
  );
}
