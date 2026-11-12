"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useCountUp } from "./useCountUp";
import { COUNT_REVEAL_MS } from "@/lib/motion";
import { useT } from "./Locale";
import type { StringKey, Values } from "@/lib/i18n/candidate";
import { BadgeCheck, Building2, Check } from "lucide-react";

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
  const t = useT();
  const final = props.kind === "final";
  // One reveal decision per offer, shared by the headline and the body.
  const reduce = useReducedMotion();
  const first = useFirstReveal(final ? props.offerId : null);
  const reveal = { first, animate: first === true && !reduce };
  return (
    <div className={`grid gap-3 rounded-2xl bg-card p-6 border border-line ${final ? "" : "shadow-card"}`}>
      {final && <FinalHeadline {...props} t={t} {...reveal} />}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink"><Building2 aria-hidden className="h-4 w-4 shrink-0" />{props.employerName}</span>
        {props.verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary" title={t("verifiedHint")}>
            <Check aria-hidden className="h-3 w-3" strokeWidth={3} />
            {t("verified")}
            <span className="sr-only">: {t("verifiedHint")}</span>
          </span>
        )}
      </div>
      {final ? <FinalBody {...props} t={t} {...reveal} /> : <PromiseBody {...props} t={t} />}
      <p className="text-sm text-muted">{t("noFees")}</p>
    </div>
  );
}

type T = (key: StringKey, values?: Values) => string;

function PromiseBody(p: Extract<OfferPromiseProps, { kind: "promise" }> & { t: T }) {
  const { t } = p;
  return (
    <>
      <p className="text-xl font-bold">{p.jobTitle}</p>
      <p className="text-base font-semibold tabular-nums">
        {t("payPerDay", { pay: p.pay })}
        {p.start && <span className="font-normal text-muted"> · {t("startsOn", { date: p.start })}</span>}
      </p>
      <p className="flex gap-2 rounded-xl bg-primary/10 p-4 text-base font-semibold text-primary">
        <BadgeCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
        <span>{p.seatHeld ? t("guarantee", { employer: p.employerName }) : t("seatsFullNote")}</span>
      </p>
    </>
  );
}

// The reveal plays once per offer in this browser; later visits show the final state at once.
function useFirstReveal(offerId: string | null) {
  const [first, setFirst] = useState<boolean | null>(null);
  // Decided once per offer per mount; a repeated effect run (React dev mode) reuses the answer.
  const decided = useRef<{ offerId: string; first: boolean } | null>(null);
  useEffect(() => {
    if (offerId === null) return;
    if (decided.current?.offerId !== offerId) {
      const key = `orchestrator:offer-revealed:${offerId}`;
      let seen = false;
      try {
        seen = localStorage.getItem(key) === "1";
        localStorage.setItem(key, "1");
      } catch {}
      decided.current = { offerId, first: !seen };
    }
    setFirst(decided.current.first);
  }, [offerId]);
  return first;
}

type FinalProps = Extract<OfferPromiseProps, { kind: "final" }> & { t: T; first: boolean | null; animate: boolean };

// Headline of the offer card: the GUARANTEED band across the top, then the pay once, large, under it.
function FinalHeadline(p: FinalProps) {
  const { t, first, animate } = p;
  const shownPay = useCountUp(p.pay, animate ? COUNT_REVEAL_MS : 0);
  return (
    <div className="grid gap-3">
      {/* Full-width band on the card's top inside edge: the card's headline. */}
      <p
        className={`-mx-6 -mt-6 self-stretch rounded-t-[15px] px-4 py-2.5 text-center font-display text-[28px] font-bold leading-tight tracking-[0.08em] text-ink ${
          p.guaranteed ? "bg-accent" : "bg-line"
        }`}
      >
        {p.guaranteed ? t("stampGuaranteed") : t("stampWaitlist")}
      </p>
      <p className="big-number" aria-label={t("payLabel", { pay: p.pay })}>
        ₱{first === null ? p.pay : shownPay}
        <span className="ml-1 font-sans text-base font-normal text-muted">{t("perDay")}</span>
      </p>
    </div>
  );
}

function FinalBody(p: FinalProps) {
  const { t, first, animate } = p;
  const shownSeats = useCountUp(p.seatsTaken, animate ? COUNT_REVEAL_MS : 0);
  return (
    <>
      <p className="text-sm text-muted">{p.guaranteed ? t("jobOfferFrom", { employer: p.employerName }) : t("waitlistFrom", { employer: p.employerName })}</p>
      <p className="text-xl font-bold">{p.jobTitle}</p>
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
