"use client";

import { useChangeCount } from "./useCountUp";
import { COUNT_CHANGE_MS } from "@/lib/motion";

export type BoardStatsData = {
  jobsSecured: number;
  seatsTaken: number;
  seatsTotal: number;
  payLow: number; // ₱ per day; 0 when no pay is confirmed yet
  payHigh: number;
  guaranteedOffers: number;
};

// The Board's summary strip. Values appear at their real numbers on load; a value that changes
// while the page is open counts from the old number to the new one (250ms).
export default function BoardStats({ stats }: { stats: BoardStatsData }) {
  const jobs = useChangeCount(stats.jobsSecured, COUNT_CHANGE_MS);
  const taken = useChangeCount(stats.seatsTaken, COUNT_CHANGE_MS);
  const total = useChangeCount(stats.seatsTotal, COUNT_CHANGE_MS);
  const low = useChangeCount(stats.payLow, COUNT_CHANGE_MS);
  const high = useChangeCount(stats.payHigh, COUNT_CHANGE_MS);
  const offers = useChangeCount(stats.guaranteedOffers, COUNT_CHANGE_MS);
  return (
    <dl className="card grid grid-cols-2 gap-x-6 gap-y-5 p-6 md:grid-cols-4">
      <Stat label="Jobs secured" value={`${jobs}`} />
      <Stat label="Seats filled" value={`${taken}/${total}`} />
      <Stat label="Pay per day" value={stats.payLow === stats.payHigh ? `₱${low}` : `₱${low}–₱${high}`} />
      <Stat label="Guaranteed offers" value={`${offers}`} />
    </dl>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse gap-2">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="big-number text-primary">{value}</dd>
    </div>
  );
}
