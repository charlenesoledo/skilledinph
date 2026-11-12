# Fictitious Employee Pool — SkilledinPH (all people invented for the demo)

*Import these as pool records. The pool record holds background and goals only — **never scores**. Scores exist only after a person answers a Skill Check.*

## The pool

### 1. Maria Santos — cand_maria
- **Location label:** Metro Manila
- **Background:** 41, solo parent of two. Eight years as a public-market vendor; sells via Facebook on the side.
- **Education:** High school graduate.
- **Strengths from life:** mental math with prices, talks to customers all day, very careful with sukli.
- **Device:** Android phone, home Wi-Fi + mobile data.
- **Availability:** 6–8 hours/day, mornings preferred.
- **Goal / skill path:** steady online work she can do from home → Senior Checker → Online Store Assistant.

### 2. Jomar Reyes — cand_jomar
- **Location label:** Central Luzon
- **Background:** 26, former warehouse picker. Finished Grade 10; left school to work.
- **Strengths from life:** fast reader of labels and lists, careful with quantities, shy in chat but writes clearly.
- **Device:** Android phone, prepaid data.
- **Availability:** full-time, any shift.
- **Goal / skill path:** first regular online job → Listing Checker → Virtual Assistant.

### 3. Rhea Villanueva — cand_rhea
- **Location label:** Western Visayas
- **Background:** 23, teenage-pregnancy survivor, now a young solo mom. Helps in a sari-sari store.
- **Strengths from life:** warm with customers, patient; numbers and written instructions are still hard.
- **Device:** shared Android phone (evenings), sari-sari store Wi-Fi.
- **Availability:** part-time, evenings.
- **Goal / skill path:** Foundational Track first → Listing Checker later, at her pace.

### 4. Paolo Aquino — cand_paolo
- **Location label:** CALABARZON
- **Background:** 31, former delivery rider. Senior high school graduate.
- **Strengths from life:** knows addresses and routes, careful with delivery fees and COD totals.
- **Device:** Android phone, stable data.
- **Availability:** full-time.
- **Goal / skill path:** Listing Checker → Senior Checker.

### 5. Liza Gomez — cand_liza
- **Location label:** Metro Manila
- **Background:** 35, former factory worker; runs a small online ukay page.
- **Strengths from life:** writes product posts daily; prices carefully; replies can sound rushed when busy.
- **Device:** Android phone + borrowed laptop on weekends.
- **Availability:** 4–6 hours/day.
- **Goal / skill path:** Listing Checker → Online Store Assistant.

### 6. Carlo Dizon — cand_carlo
- **Location label:** Central Visayas
- **Background:** 29, former construction helper. Elementary graduate; reads slowly but works hard.
- **Strengths from life:** follows step-by-step instructions well when they are visual; honest about what he doesn't understand.
- **Device:** Android phone, mobile data.
- **Availability:** full-time.
- **Goal / skill path:** Foundational Track → warehouse/dispatch support roles later.

---

## Expected demo outcomes — NOT part of any employee record

*Read this only as the presenter's answer key. In the live page, these numbers must come from the Skill Check itself (deterministic scoring against the approved key). They are written here so we can verify the live run produced the right sorting.*

Job targets (TidyNest "Listing & Reply Checker"): Price & Detail Accuracy **80** · Taglish Tone Judgment **75** · Prompt Judgment **70**. Sorting rule: no gap = READY · total gap ≤ 8h = TRAINABLE · above = NOT YET (Foundational Track). Seats: **2**.

| Candidate | Price | Tone | Prompt | Gap hours | Sorting |
|---|---|---|---|---|---|
| Maria | 90 | 85 | 90 | 0 | **READY** → offer (seat 1) |
| Jomar | 55 | 50 | 80 | ~4h | **TRAINABLE** → module → test → offer (seat 2) |
| Paolo | 70 | 70 | 75 | ~4h | TRAINABLE, but seats full → **waitlist, NOT GUARANTEED** |
| Liza | 85 | 70 | 80 | ~2h | TRAINABLE, seats full → **waitlist, NOT GUARANTEED** |
| Rhea | 20 | 25 | 40 | ~14h | **NOT YET** → Foundational Track |
| Carlo | 45 | 40 | 50 | ~10h | **NOT YET** → Foundational Track |

*Gap hours use the standing formula: per skill below target, `ceil((target − current) / 25) × 2`.*
