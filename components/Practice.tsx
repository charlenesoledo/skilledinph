"use client";

import { useState } from "react";
import type { KeyedItem } from "@/lib/types";

// Practice items give instant feedback. They are not scored and do not affect the final test.
export default function Practice({ items }: { items: KeyedItem[] }) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  return (
    <div className="grid gap-4">
      {items.map((it, i) => {
        const sel = picked[i];
        return (
          <div key={i} className="grid gap-2 rounded-xl border border-stone-200 p-4">
            <p>Practice {i + 1}. {it.prompt}</p>
            {it.choices.map((c, n) => {
              const state = sel === undefined ? "" : n === it.correct_index ? "border-emerald-600 bg-emerald-50" : n === sel ? "border-amber-600 bg-amber-50" : "";
              return (
                <button key={n} type="button" onClick={() => setPicked({ ...picked, [i]: n })}
                  className={`rounded-xl border border-stone-300 px-4 py-3 text-left ${state}`}>
                  {c}
                </button>
              );
            })}
            {sel !== undefined && (
              <p className="text-base">{sel === it.correct_index ? "Tama!" : "Subukan ulit. Tingnan ang naka-berde."}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
