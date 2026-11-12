# FEED TO CLAUDE CODE — SkilledinPH Live Build

Read these files in this project first (they are the source of truth; do not invent replacements):
1. `LIVE-BUILD-BLUEPRINT.md` — the structure, click paths, and the live gate.
2. `EMPLOYER-KNOWLEDGE-BASE-TIDYNEST.md` — the employer's Knowledge Base document.
3. `FICTITIOUS-EMPLOYEE-POOL.md` — 6 pool records + the presenter's expected-outcomes table (that table is a TEST ORACLE for you, never app copy and never stored as scores).
4. `SAMPLE-ASSESSMENT-PACK.md` — the Assessment Pack to implement exactly (candidate view, employer key/rubric with partial-credit rules, Jomar's scored attempt as your test case).

## Mission

The current app is the DEMO workspace (seeded, MOCK MODE badge — leave it fully working).
Add a **LIVE WORKSPACE** on the same app: same screens and components, but driven by saved records that start from the files above, where the workflow genuinely runs. Badge in Live: "LIVE WORKSPACE" with a small note "Sample business data — the workflow is real." Commit per step. If a later step risks breaking the Demo workspace, stop, say so, and ship what is done.

## Build order

**Step 1 — Live data.** A workspace switcher (Demo | Live) in the header. Live loads as records: employer TidyNest Online WITH the Knowledge Base attached (full document, rendered in sections), the existing TidyNest job, and the 6 pool candidates from the pool file (background/device/availability/goal only — NO scores; nobody has taken any check yet in Live).

**Step 2 — Knowledge Base in the portal.** Employer page + Job Review get a "Knowledge Base" card: the attached document rendered readably (headings + catalog table), an Upload control that accepts .md/.txt and replaces the document text (PDF: store the file name and show "PDF received — text extraction is a production feature"), and the "About the work" summary from KB §1.

**Step 3 — Assessment Pack page.** From Job Review, a button "Assessment Pack" opens the pack for this job (route or section): two tabs — **Candidate view** (the 6 tasks exactly as in the sample pack, no key anywhere) and **Employer key & rubric** (answers, points, partial-credit rules, KB source per item). An **Approve Assessment Pack** button; status shows Draft → Employer-approved. "Send Skill Check" (Step 4) is disabled until approved.

**Step 4 — Takeable Skill Check + deterministic scorer.** Pool (Live): select candidates → "Send Skill Check" → their candidate pages gain "Start Skill Check": the 6 tasks as tappable phone-first questions (multi-select for Task 1), Submit once. The scorer is plain code implementing the pack's key EXACTLY, including partial credit (Task 1: 15/error found + 5 if no false flag; Task 2: 20 subtotal / 15 delivery / 15 voucher; Task 6: 20 specs / 10 price / 10 format / 10 clarity, option D = 30). Scores → Skill Profiles → existing sorting (targets 80/75/70, standing gap-hours formula, READY ≤ no gap, TRAINABLE ≤ 8h, else NOT YET) → results appear in Pool, on candidate pages (evidence card), in Job Review (item-by-item audit), and on the Board. Seats = 2: further TRAINABLE candidates become waitlist, labelled NOT GUARANTEED. Test yourself with the oracle: answering as Jomar's scored attempt (Task1: A only; Task2: ₱1,048; Task3: B; Task4: A; Task5: B; Task6: D) must produce exactly 55 / 50 / 80 → TRAINABLE ~4h.

**Step 5 — Board Present Mode (Demo workspace).** On the Demo Board: "Next step ▸", "Auto-play" (~2s/step, click again to pause), "Reset". Staged view of the same outcomes, data untouched: Step 0 job card in Job Secured → Step 1 three candidate cards in Assessing → Step 2 job card in Awaiting Employer Approval ("Module built — waiting for employer") → Step 3 Jomar in Training, Maria READY chip, Rhea NOT YET chip → Step 4 Maria + Jomar in Offered (GUARANTEED · accepted · ₱600/day), Rhea's foundational note. Caption names each step; summary strip matches what is visible.

**Step 6 — Learning layer (if time; skip cleanly if not).** Job Review: "Course outline — built from the employer's Knowledge Base": Layer A = the job module sections with source chips (catalog PDF, tone guide); Layer B "Growth units (optional — for upskilling)": E-commerce basics (~45m, SOPs), Customer care: handling unhappy buyers (~40m, tone guide), Working with AI: giving clear instructions (~30m). Candidate pages: "Your skill path / Ang skill path mo" card (skill chips; Listing Checker → Senior Checker → Online Store Assistant → Virtual Assistant; Rhea starts at Foundational Track) with the line "This is not just one task — it is a first step." / "Hindi lang ito isang task — ito ang unang hakbang." Jomar's course gains the 3 growth units as "Bonus units (optional)".

## Guardrails

- The Demo workspace must still run its full demo to the exact same final state after every step.
- No score is ever typed in by hand anywhere in Live; every number comes from the scorer or the existing deterministic logic.
- Candidate-facing additions are bilingual via the existing TL|EN toggle; employer side stays English.
- Do not rename routes or the Demo data. No payments, no real personal data, no scraping.

## Verify before you report (the live gate)

1. Live: KB visible in the portal. 2. Assessment Pack approved by employer. 3. Jomar's oracle answers scored by code to 55/50/80 and sorted TRAINABLE. 4. Reload — everything persists. 5. Demo workspace untouched and passing. Report per step, with anything skipped and why.
