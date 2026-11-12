// The TidyNest Assessment Pack (live-build/SAMPLE-ASSESSMENT-PACK.md), built from Job Card v1 + Knowledge Base v1.
// 6 tasks, 2 per skill, each skill out of 100 (2 tasks × 50). Every partial-credit rule is part of the key
// the employer approves; the scorer (lib/live/scorer.ts) applies this key and nothing else.
import type { PackItem } from "../types";

const P = "Price & Detail Accuracy", T = "Taglish Tone Judgment", J = "Prompt Judgment";
export const PACK_SKILLS = [P, T, J];

export const PACK_SOURCES = "Job Card v1 + Knowledge Base v1 (catalog §2, pricing §3, tone guide §5, rubric §8)";

export const PACK_INTRO_TL =
  "Kumusta! Ito ay maiikling tasks na gaya ng totoong trabaho. Walang trick questions. Basahin ang bawat isa at piliin ang pinakamagandang sagot. ~15 minuto ito. Hindi makikita ng employer ang pangalan mo habang sini-score ito.";
export const PACK_INTRO_EN =
  "Hello! These are short tasks like the real work. No trick questions. Read each one and choose the best answer. It takes about 15 minutes. The employer does not see your name while it is scored.";

export const TIDYNEST_PACK: PackItem[] = [
  {
    n: 1, skill: P, kind: "multi",
    title_tl: "Hanapin ang mga mali sa listing", title_en: "Find the errors in a listing",
    prompt: "Eto ang draft listing. Piliin ang **lahat** ng mali, base sa catalog ng TidyNest:",
    quote: "Foldable Laundry Basket | 38L | TidyNest — ₱259. Glass material. Colors: gray. Delivery Metro Manila ₱80.",
    choices: [
      { key: "A", text: "Ang presyo (₱259 — dapat ₱299)" },
      { key: "B", text: 'Ang materyal ("glass")' },
      { key: "C", text: "Ang delivery fee (₱80 — dapat ₱50 sa Metro Manila)" },
      { key: "D", text: "Ang laki (38L)" },
      { key: "E", text: "Ang kulay (gray)" },
    ],
    correct: ["A", "B", "C"], per_hit: 15, bonus_if_no_false: 5,
    rule: "A, B, C (D and E are correct details). 15 per error found (max 45) + 5 if no correct detail is falsely flagged.",
    source: "KB §2 (TN-009), §3",
  },
  {
    n: 2, skill: P, kind: "single",
    title_tl: "Kuwentahin ang babayaran ng buyer", title_en: "Work out what the buyer pays",
    prompt: "Buyer order: 2 × Storage Box 45L (₱499 each) + delivery to Quezon City + voucher WELCOME50. Magkano ang babayaran?",
    choices: [{ key: "A", text: "₱998" }, { key: "B", text: "₱1,048" }, { key: "C", text: "₱948" }, { key: "D", text: "₱1,098" }],
    answer: "A", points: { A: 50, B: 35, C: 35, D: 20 },
    rule: "₱998 (₱499×2 = ₱998; + ₱50 MM delivery = ₱1,048; − ₱50 voucher = ₱998). By step: subtotal 20, delivery fee 15, voucher applied 15. ₱1,048 = 35 (voucher missed) · ₱948 = 35 (delivery missed) · ₱1,098 = 20 (subtotal only).",
    source: "KB §3",
  },
  {
    n: 3, skill: T, kind: "single",
    title_tl: "Piliin ang reply sa sirang item", title_en: "Choose the reply for a damaged item",
    prompt: "Nasira ang mop na dumating kay buyer. Alin ang pinakamagandang reply?",
    choices: [
      { key: "A", text: '"SIR YAN PO ANG PINADALA NAMIN, BAKA KAYO ANG NAKASIRA."' },
      { key: "B", text: '"Kumusta po! Naku, pasensya na po sa sira. Paki-send po ng litrato ng item dito, at aayusin po namin ang kapalit o refund ayon sa inyong gusto. Salamat po sa pag-report agad."' },
      { key: "C", text: '"We regret the inconvenience. Your concern has been noted and will be forwarded to the appropriate department for processing."' },
    ],
    answer: "B", points: { A: 0, B: 50, C: 0 },
    rule: "B (template: acknowledge → photo → replacement/refund). 50 or 0.",
    source: "KB §5 template",
  },
  {
    n: 4, skill: T, kind: "single",
    title_tl: "Hanapin ang reply na lumalabag sa tone guide", title_en: "Spot the reply that breaks the tone guide",
    prompt: "Alin sa mga reply ang **lumalabag** sa tone guide ng TidyNest?",
    choices: [
      { key: "A", text: '"Kumusta po! Na-check ko po — darating po bukas ang parcel ninyo. Salamat po sa paghihintay!"' },
      { key: "B", text: '"Refund agad-agad po, i-GCash niyo lang po sa personal number ko."' },
      { key: "C", text: '"Kumusta po! Ubos na po ang beige. May gray po kami — gusto niyo po ba?"' },
    ],
    answer: "B", points: { A: 0, B: 50, C: 0 },
    rule: "B (outside-platform personal GCash = hard violation). 50 or 0.",
    source: 'KB §5 "Never" list',
  },
  {
    n: 5, skill: J, kind: "single",
    title_tl: "Piliin ang pinakamalinaw na utos sa AI", title_en: "Pick the clearest instruction to the AI",
    prompt: "Gusto mong ipasulat sa AI ang description ng LED Motion Sensor Light (TN-003). Alin ang pinakamalinaw na utos?",
    choices: [
      { key: "A", text: '"Gawan mo ng description ang ilaw."' },
      { key: "B", text: '"Sumulat ng 3-sentence na description para sa LED Motion Sensor Light: warm white, USB rechargeable, ₱349. Friendly Taglish. Huwag sasabihing solar powered."' },
      { key: "C", text: '"Yung maganda ha, yung mabebenta, mahaba dapat."' },
    ],
    answer: "B", points: { A: 0, B: 50, C: 0 },
    rule: "B (names product, specs, price, length, tone, and the forbidden claim). 50 or 0.",
    source: "KB §2 (TN-003), §4",
  },
  {
    n: 6, skill: J, kind: "single",
    title_tl: "Piliin ang utos na mag-aayos sa maling draft", title_en: "Pick the instruction that fixes a wrong draft",
    prompt: "Mali ang draft ng AI sa Shoe Rack (TN-006) — nagkapalit ang height at width. Alin ang pinakamagandang utos para ayusin ito?",
    choices: [
      { key: "A", text: '"Ayusin mo yan."' },
      { key: "B", text: '"Ulitin mo, mali ka."' },
      { key: "C", text: '"I-correct ang Shoe Rack 4-Tier listing: gamitin ang catalog specs na 80 × 30 × 92 cm (width × depth × height), presyo ₱799, at panatilihin ang title format na Product | Spec | TidyNest."' },
      { key: "D", text: '"Palitan ang size ng Shoe Rack ng 80 × 30 × 92 cm."' },
    ],
    answer: "C", points: { A: 0, B: 0, C: 50, D: 30 },
    rule: "C (correct data, price, format, and what to change). By element: specs 20, price 10, title format 10, clear instruction 10. Option D earns 30 (specs + clarity only).",
    source: "KB §2 (TN-006), §4",
  },
];

// The pack can be generated when the job's analyzed skills are the three this KB template covers.
export function packFor(skills: string[]): PackItem[] | null {
  return PACK_SKILLS.every((s) => skills.includes(s)) ? TIDYNEST_PACK : null;
}
