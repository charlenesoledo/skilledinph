// Every string the Offer Promise card shows, in one place. {name} placeholders are filled at render time.
// Lines that already existed on the candidate page are copied exactly; the rest are new for this card.
export const OFFER_STRINGS = {
  tl: {
    verified: "Verified",
    verifiedHint: "Kinumpirma ng employer ang sahod para sa job na ito",
    payPerDay: "₱{pay}/araw",
    startsOn: "simula {date}",
    guarantee: "Garantisado: ipasa ang approved test ng {employer} at sa'yo na ang offer.",
    seatsFullNote: "Puno na ang slots ngayon. Kapag pumasa ka, mapupunta ka sa waitlist at hindi pa ito garantisado.",
    noFees: "Hindi ka kailanman magbabayad para sa training o sa job na ito.",
    jobOfferFrom: "Job offer mula sa {employer}",
    waitlistFrom: "Waitlist mula sa {employer}",
    stampGuaranteed: "GUARANTEED",
    stampWaitlist: "NOT GUARANTEED · WAITLIST",
    perDay: "/ araw",
    start: "Simula: {date}",
    slotsFilled: "slots ang napunan",
    slotsFilledLabel: "Slots: {taken} sa {slots} ang napunan",
    payLabel: "₱{pay} kada araw",
    noApplication: "Walang application. Walang interview.",
    awardedTo: "Para kay {name}",
    passed: "Pumasa sa {test}",
    testFinal: "Final test · {job}",
    testAssessment: "Assessment · {job}",
    datePassed: "Petsa: {date}",
  },
} as const;

export type OfferStringKey = keyof (typeof OFFER_STRINGS)["tl"];

export function fill(template: string, values: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? `{${k}}`));
}
