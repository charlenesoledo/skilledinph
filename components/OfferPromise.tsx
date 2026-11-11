"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useCountUp } from "./useCountUp";
import { COUNT_REVEAL_MS, DUR_MED, EASE_ENTER } from "@/lib/motion";
import { OFFER_STRINGS, fill, type OfferStringKey } from "@/lib/i18n/offer-strings";

type Common = {
  employerName: string;
  jobTitle: string;
  verified: boolean; // the employer has confirmed the pay for this job
  pay: number;
  start: string | null;
};
export type OfferPromiseProps =
  | (Common & { kind: "promise"; seatHeld: boolean })
  | (Common & {
      kind: "final";
      offerId: string;
      guaranteed: boolean;
      candidateName: string;
      testKind: "final" | "assessment"; // passed the final test, or met every target at assessment
      datePassed: string;
      seatsTaken: number;
      slots: number;
    });

// One card, from assessment onward. Before the offer it states the promise; once the Matcher has made
// the offer it keeps the same anatomy and adds the certificate: who, which test, when, and the stamp.
export default function OfferPromise(props: OfferPromiseProps) {
  const t = (key: OfferStringKey, values?: Record<string, string | number>) => fill(OFFER_STRINGS.tl[key], values);
  const final = props.kind === "final";
  return (
    <div className={`grid gap-3 rounded-2xl bg-card p-5 ${final ? "border-2 border-dashed border-ink" : "border border-line shadow-card"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-ink">{props.employerName}</span>
        {props.verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary" title={t("verifiedHint")}>
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3.5 8.5l3 3 6-7" />
            </svg>
            {t("verified")}
            <span className="sr-only">: {t("verifiedHint")}</span>
          </span>
        )}
      </div>
      {final ? <FinalBody {...props} t={t} /> : <PromiseBody {...props} t={t} />}
      <p className="text-sm text-muted">{t("noFees")}</p>
    </div>
  );
}

type T = (key: OfferStringKey, values?: Record<string, string | number>) => string;

function PromiseBody(p: Extract<OfferPromiseProps, { kind: "promise" }> & { t: T }) {
  const { t } = p;
  return (
    <>
      <p className="text-xl font-bold">{p.jobTitle}</p>
      <p className="text-base font-semibold tabular-nums">
        {t("payPerDay", { pay: p.pay })}
        {p.start && <span className="font-normal text-muted"> · {t("startsOn", { date: p.start })}</span>}
      </p>
      <p className="rounded-xl bg-primary/10 p-3 text-base font-semibold text-primary">
        {p.seatHeld ? t("guarantee", { employer: p.employerName }) : t("seatsFullNote")}
      </p>
    </>
  );
}

// The reveal plays once per offer in this browser; later visits show the final state at once.
function useFirstReveal(offerId: string) {
  const [first, setFirst] = useState<boolean | null>(null);
  useEffect(() => {
    const key = `orchestrator:offer-revealed:${offerId}`;
    let seen = false;
    try {
      seen = localStorage.getItem(key) === "1";
      localStorage.setItem(key, "1");
    } catch {}
    setFirst(!seen);
  }, [offerId]);
  return first;
}

function FinalBody(p: Extract<OfferPromiseProps, { kind: "final" }> & { t: T }) {
  const { t } = p;
  const reduce = useReducedMotion();
  const first = useFirstReveal(p.offerId);
  const animate = first === true && !reduce;
  const shownPay = useCountUp(p.pay, animate ? COUNT_REVEAL_MS : 0);
  const shownSeats = useCountUp(p.seatsTaken, animate ? COUNT_REVEAL_MS : 0);
  return (
    <>
      <motion.span
        key={String(first)}
        initial={animate ? { scale: 1.6, rotate: 0, opacity: 0 } : false}
        animate={{ scale: 1, rotate: -8, opacity: 1 }}
        transition={{ duration: DUR_MED, ease: EASE_ENTER }}
        className={`w-fit origin-left rounded-md border-2 px-3 py-2 font-display text-base font-bold tracking-[0.18em] ${
          p.guaranteed ? "border-ink bg-accent text-ink" : "border-muted bg-line text-ink"
        }`}
      >
        {p.guaranteed ? t("stampGuaranteed") : t("stampWaitlist")}
      </motion.span>
      <p className="text-sm text-muted">{p.guaranteed ? t("jobOfferFrom", { employer: p.employerName }) : t("waitlistFrom", { employer: p.employerName })}</p>
      <p className="text-xl font-bold">{p.jobTitle}</p>
      <p className="big-number" aria-label={t("payLabel", { pay: p.pay })}>
        ₱{first === null ? p.pay : shownPay}
        <span className="ml-1 font-sans text-base font-normal text-muted">{t("perDay")}</span>
      </p>
      {p.start && <p className="text-base">{t("start", { date: p.start })}</p>}
      <p className="flex items-baseline gap-2 text-base" aria-label={t("slotsFilledLabel", { taken: p.seatsTaken, slots: p.slots })}>
        <span className="font-display text-2xl font-bold tabular-nums">
          {first === null ? p.seatsTaken : shownSeats}/{p.slots}
        </span>
        <span className="text-muted">{t("slotsFilled")}</span>
      </p>
      <div className="grid gap-1 border-t border-line pt-3 text-sm">
        <p className="font-semibold">{t("awardedTo", { name: p.candidateName })}</p>
        <p>{t("passed", { test: t(p.testKind === "final" ? "testFinal" : "testAssessment", { job: p.jobTitle }) })}</p>
        <p className="tabular-nums text-muted">{t("datePassed", { date: p.datePassed })}</p>
      </div>
      {p.guaranteed && <p className="text-base text-muted">{t("noApplication")}</p>}
    </>
  );
}
