# MANILA HACK 2026 — FEED THIS FILE TO CLAUDE CODE
## Bucket: ORCHESTRATE — Project working name: "Orchestrator"

> What this is: A web app with ONE agent at the center — the Orchestrator — that connects employers
> whose agentic workflows still need humans, to a pool of underserved workers who missed the
> college-to-corporate route. The agent takes a real human-job, breaks it into skills, assesses the
> pool, builds a training module for each person's gap, and — when the person passes a test the
> employer approved and set the passing score for — issues a GUARANTEED job offer automatically.
> Training ends in work, not a certificate.
> All demo data is FICTIONAL and GENERAL. Do NOT use any real brand, real person, real job posting,
> or examples from the hackathon website. Do NOT use CJ, Ana, LAIFWAVE, or any real project of the team.

---

## 1. FIRST PROMPT — paste this into Claude Code word-for-word

```
Read ORCHESTRATOR-FEED-TO-CLAUDE-CODE.md in this project folder completely before writing any code.
Build the app exactly as specified there, in the build order given, one step at a time.
Stack: Next.js (App Router) + Tailwind CSS, Supabase for database, one LLM API only
(Claude API if ANTHROPIC_API_KEY is set, otherwise Gemini API if GEMINI_API_KEY is set),
and plain JSON files as a local fallback when no database key is set, so the demo always runs.
After each build step, run the acceptance check for that step and show me the result before moving on.
If any API key is missing, do not stop — switch to MOCK MODE: use the built-in sample data and
sample agent outputs from the spec so the full flow still demos end to end.
Never invent a new feature that is not in the spec. Never break the HARD RULES in Section 5.
```

---

## 2. THE PROBLEM (simple)

Two sides are stuck:

- **Employers** run AI agents, but their workflows still stop at steps only a human can do:
  checking output, judging tone, handling exceptions, capturing real-world information.
  They cannot easily find, vet, or train people for just that one step.
- **Underserved workers** — people who missed university and therefore the corporate ladder —
  are locked out, even though many of these human-steps need judgment and local context,
  not a degree.

Existing training platforms teach generic courses with no job at the end. Existing job platforms
assume you are already qualified. Nobody connects: **real job → exact skill gap → short training
built from that job → guaranteed offer.** That connection is this product.

## 3. WHO IT IS FOR (general)

- **Employer side:** any small or mid-size company running agentic/automated workflows with
  human steps — online sellers, support teams, content operations, back-office services.
- **Worker side:** adults without a college degree who have a smartphone, basic literacy,
  and local-language fluency (Taglish in the demo). No prior tech job required.

## 4. LOCKED DECISIONS (v2 — do not re-open these in code)

1. **JOBS FIRST.** No assessment, no module, no training exists before a real Job Card is secured
   with reserved slots, a confirmed pay rate, and a rubric. Demand creates the training.
2. **GUARANTEED OFFER.** A candidate who passes the final test at or above the employer's
   passing score automatically receives a job offer. No application step, no interview step.
   To keep this promise true in code: training seats for a job may never exceed its reserved
   slots (see Hard Rules). A waitlist, if shown, must be labelled NOT GUARANTEED.
3. **EMPLOYER APPROVES THE MODULE.** The agent generates the module, the final test, and a
   proposed passing score — the employer must approve all three before any candidate can
   start training on that job.
4. **PAY RATE IS RESEARCHED PER JOB, NOT FIXED.** There is no universal entry rate.
   The Rate Research step proposes a rate band for the job type (demo: from the built-in
   reference table, clearly labelled DEMO DATA). The employer confirms the final rate.
   The confirmed rate is shown to candidates BEFORE they start training.
5. **THE EMPLOYER DEFINES "QUALIFIED".** The employer vets the module and the final test and
   sets the passing score. The agent scores against the employer's approved test and rubric —
   never against the agent's own opinion. The employer can view any passed candidate's scored
   final-test output as audit proof.

## 5. HARD RULES (invariants — the code must enforce these, not just display them)

- HR1: A module cannot be generated for a job that has no reserved slots or no confirmed pay.
- HR2: A candidate cannot start a module whose status is not EMPLOYER-APPROVED.
- HR3: A candidate cannot take the final test before completing all module sections.
- HR4: Final-test scoring is deterministic — against the employer-approved answer key / rubric
  checklist stored in the database. An LLM may explain a result; it may never decide pass/fail.
- HR5: When score >= employer passing score AND a reserved slot is still open, an offer is
  created automatically with `guaranteed = true`. Enrolled training seats per job <= reserved
  slots, always. Extra candidates go to a waitlist with `guaranteed = false`.
- HR6: If the employer edits the module, test, or passing score after approval, the version
  number increments and candidates who already started keep the version they started on.
- HR7: Every agent run is written to the `runs` table (agent, input ref, ok/error). A failed
  run is shown honestly as failed and may be retried once. Mock Mode shows a visible badge.
- HR8: No real personal data. Demo candidates are fictional. Collect no ID numbers, no
  government documents, no payment details anywhere in the app.

## 6. CORE FLOW — never change this order

1. **JOB INTAKE (Employer):** Employer submits a Human Job Card: the workflow step that needs a
   human, why a human is needed, tasks, target skill levels, good/bad output examples,
   reserved slots, deadline, tools needed.
2. **JOB ANALYZER AGENT:** Breaks the Job Card into a skill list with target levels (0–100)
   and a draft quality rubric.
3. **RATE RESEARCH AGENT:** Proposes a pay rate band for this job type from the reference
   table (demo data, labelled). **Employer confirms the final rate.** Job becomes ACTIVE
   only after rate confirmation. (HR1)
4. **ASSESSMENT (Pool):** Each candidate in the pool takes a short TASK-BASED assessment for
   this job (do the task, not a written exam). Scores are stored per skill in the Skill Profile.
   The assessment items for the demo are built-in and keyed (deterministic scoring).
5. **SORTING (Matcher logic, rule-based):** For each candidate, compare Skill Profile vs targets:
   - **READY** — every skill >= target → skip training, go straight to step 8 (offer).
   - **TRAINABLE** — gap exists but total gap hours <= 12 → personalized module (step 6).
   - **NOT YET** — gap hours > 12 → no offer for this job; show a kind message and route to a
     foundational track placeholder. Never show this as a rejection of the person.
   Gap hours formula (use exactly this): per skill, `hours = ceil((target - current) / 25) * 2`;
   total gap hours = sum over skills below target.
6. **MODULE BUILDER AGENT:** Generates ONE module per job from the employer's rubric and
   examples. Structure per module: short lessons (phone-readable, Taglish), one worked example,
   practice simulations, and the FINAL TEST. Each candidate sees only the sections covering
   their own gap skills, with their personal total hours shown ("Your module: ~6 hours").
7. **EMPLOYER APPROVAL GATE:** Employer reviews module + final test + proposed passing score.
   Approve → status EMPLOYER-APPROVED (HR2). Request changes → agent regenerates once with
   the employer's notes, back to this gate. Employer may edit the passing score directly.
8. **TRAINING:** Candidate completes sections on a phone-first screen; progress is saved per
   section. Final test unlocks only when all assigned sections are complete. (HR3)
9. **QUALIFICATION GATE:** Final test scored deterministically against the approved key. (HR4)
   Below passing score → candidate gets targeted practice sections and may retake once.
10. **OFFER & WORK (Matcher):** Pass → offer created automatically (HR5), showing job, pay,
    start, and the employer's name. Candidate accepts in one tap. Output of their first real
    task (demo: one sample task) is returned to the employer view.
11. **FEEDBACK LOOP:** Employer rates the delivered output (1–5). Rating updates the candidate's
    Skill Profile. If 3+ candidates fail the same test item, the item is flagged on the
    employer dashboard as "module/test may need fixing" — fix the module, not the people.

## 7. PAGES (keep to 6)

- `/` **Orchestrator Board** — pipeline columns: Job Secured / Assessing / Training /
  Awaiting Employer Approval / Offered. One card per job or candidate with its current step.
  Mock Mode badge here when running on sample outputs.
- `/employer` **Job Intake** — Human Job Card form + list of the employer's jobs with status.
- `/employer/jobs/[id]` **Job Review** — skill breakdown, rate band proposal + confirm rate,
  module + final test preview, passing-score field, Approve / Request changes buttons,
  passed candidates with their scored final-test output (audit view).
- `/pool` **Candidate Pool** — fictional candidates, their status per job, "Run assessment" button.
- `/candidate/[id]` **Candidate View (phone-first, Taglish labels, big buttons)** — "Ang kulang
  mo" (your gap), "Ang module mo: ~X hours", pay for the job shown upfront, module sections with
  progress, final test, and the Offer screen when passed.
- `/samples` **Demo Data** — one click loads the full sample dataset (Section 9) and one click
  resets it. Also a "Run full demo" button that steps the sample job through the whole loop.

## 8. DATA MODEL

`employers`: id, name (fictional in demo), contact_label, created_at

`jobs` (Human Job Cards): id, employer_id, title, workflow_step, why_human, tasks (text),
target_skills (JSON: [{skill, target}]), good_example (text), bad_example (text),
reserved_slots (int), seats_taken (int, default 0), rate_band_demo (text, labelled DEMO DATA),
pay_confirmed (number, PHP/day), pay_status (proposed | confirmed), deadline, tools_needed,
status (draft | active | module_pending_approval | live | filled)

`candidates`: id, display_name (fictional), phone_label, location_label, foundational_level, created_at

`skill_profiles`: id, candidate_id, skill, level (0–100), updated_at, source (assessment | job_rating | module)

`assessments`: id, job_id, candidate_id, items (JSON with answer key), score_per_skill (JSON),
total_gap_hours (number), sorting (ready | trainable | not_yet), created_at

`modules`: id, job_id, version (int), sections (JSON: [{skill, title, lesson_text, worked_example,
practice_items}]), final_test (JSON: items with answer key + rubric checklist),
proposed_passing_score (number), passing_score (number, employer-set),
status (generated | employer_approved | changes_requested), employer_notes (text)

`candidate_plans`: id, candidate_id, module_id, assigned_sections (JSON of section ids —
only the candidate's gap skills), personal_hours (number), progress (JSON: section_id -> done),
status (not_started | in_progress | sections_complete | test_unlocked | passed | failed_once)

`test_results`: id, candidate_plan_id, answers (JSON), score (number), passed (bool),
scored_output (JSON — the item-by-item result the employer can audit), created_at

`offers`: id, job_id, candidate_id, test_result_id, guaranteed (bool), pay_confirmed (number),
status (offered | accepted | waitlisted), created_at

`ratings`: id, job_id, candidate_id, employer_id, stars (1–5), note (text), created_at

`runs`: id, agent, ref_type, ref_id, started_at, finished_at, ok (bool), error (text), mock (bool)

Local fallback: the same objects as JSON files under `/data` when Supabase is not configured.

## 9. SAMPLE DATA (built-in, fictional, general — use exactly this for the demo)

**SAMPLE EMPLOYER:** "TidyNest Online" — a fictional online home-goods seller whose AI agent
drafts product listings and customer chat replies, but a human must check them before posting.

**SAMPLE JOB — "Listing & Reply Checker":**
- workflow_step: "Before any AI-drafted listing or chat reply is posted/sent"
- why_human: "The agent writes fast but makes price errors and uses stiff, foreign-sounding
  Taglish. A local human catches both."
- target_skills: Price & Detail Accuracy 80, Taglish Tone Judgment 75, Reading Comprehension 70
- good_example: a listing with matching price, natural Taglish, correct product name
- bad_example: a listing priced ₱499 in the title but ₱449 in the body, stiff English reply
- reserved_slots: 2
- rate_band_demo: "₱500–₱650/day (DEMO DATA — reference only)"
- pay_confirmed (employer accepts in demo): 600
- Assessment items (built-in, keyed): 6 mini-tasks — spot the price mismatch, pick the natural
  Taglish reply, find the wrong product detail, etc.

**SAMPLE CANDIDATES (fictional — seed their assessment `score_per_skill` with exactly these
values so the sorting in Step 5 is deterministic):**
- **Candidate A — "Maria" — READY:** Price 90, Taglish Tone 85, Reading 90 — at/above all
  targets → immediate offer, no module. Proves the Ready path.
- **Candidate B — "Jomar" — TRAINABLE:** Reading 80 (above target), Price Accuracy 55,
  Taglish Tone 50 → gap hours by formula: Price ceil(25/25)*2 = 2h, Tone ceil(25/25)*2 = 2h →
  module "~4 hours", 2 sections only. Passes the final test → GUARANTEED offer (slot 2 of 2).
- **Candidate C — "Rhea" — NOT YET:** Price 20, Taglish Tone 25, Reading 40 → gap hours:
  Price ceil(60/25)*2 = 6h, Tone ceil(50/25)*2 = 4h, Reading ceil(30/25)*2 = 4h → 14h total
  > 12 → kind routing message to foundational track, no offer, no harsh rejection language.
- A 4th candidate may be added to the waitlist to prove HR5 (seats full → waitlist labelled
  NOT GUARANTEED).

**SAMPLE MODULE (what the Module Builder must produce for this job):** 3 sections
(Price & Detail Accuracy / Taglish Tone Judgment / Reading Comprehension), each: 1 short
Taglish lesson, 1 worked example from the employer's good/bad examples, 3 practice items.
Final test: 5 keyed items. Proposed passing score: 80. Employer approves (demo) at 80.

## 10. AGENT PROMPTS (use as-is, fill fields from the Job Card / profiles)

JOB ANALYZER — System: "You break a human-job into skills. Given the job's tasks, why-human
note, and good/bad examples, output JSON only: {skills: [{skill, target (0-100), why}],
rubric: [checklist items]}. Use 3–5 skills. Targets must be justified by the examples:
a skill the bad example fails must have a target of 70 or higher."

RATE RESEARCH — System (demo mode uses the built-in reference table, NOT live data):
"You propose a pay band for a job type from the provided reference table only. Output JSON
only: {band_low, band_high, basis: 'reference table (demo data)'}. Never present the band as
a verified live market rate."

ASSESSOR — System: "You create short task-based assessment items for a job's skills.
Each item is a tiny real task (spot the error, choose the reply, fix the detail) with ONE
keyed correct answer. Output JSON only: {items: [{skill, prompt, choices, correct_index}]}.
6 items, covering every target skill at least once. Plain language, phone-readable."

MODULE BUILDER — System: "You build a training module for ONE job from the employer's rubric
and good/bad examples — nothing generic. One section per skill. Each section: a short Taglish
lesson (max 150 words), one worked example, 3 practice items with keys. End with a final test
of 5 keyed items and a proposed_passing_score. Output JSON only, in the modules table shape.
Never teach anything the employer's examples contradict."

MATCHER — This one is RULE-BASED, not an LLM call. Implement Section 6 steps 5 and 10 as plain
code: sorting by the gap formula, offer creation by HR5. The LLM never decides who gets an offer.

QA / FEEDBACK EXPLAINER — System: "You explain a scored test result to a candidate in kind,
plain Taglish: what they got right, the one skill to practice, and what happens next.
Never change the score. Never use the words 'rejected' or 'failed as a person'."

## 11. TOOLS / INTEGRATIONS — what to connect, and what to skip

MUST (build core):
- Claude Code — builds the app; GitHub — one repo, commit after every working step
- Next.js (App Router) + Tailwind — the one front-end stack; do NOT add a no-code builder
- ONE LLM API only — Claude API if `ANTHROPIC_API_KEY` is set, else Gemini API if
  `GEMINI_API_KEY` is set. All agent calls go through one wrapper with a Mock Mode fallback.
- Supabase — database; if setup takes more than 20 minutes, switch to the local JSON
  fallback under `/data` and move on. Do not debug setup during build time.
- Vercel — deploy from GitHub so the team has a live link for submission.

RECOMMENDED (only if the core loop already passes all acceptance checks):
- n8n — one overnight workflow that resets the sample data, runs the full demo loop, and
  writes each step to `runs`. This is the autonomy/recovery story.

SKIP for the hackathon (out of scope — do not build, do not stub UI for these):
- Real payments, wallets, or salary disbursement (pay is displayed, never moved)
- Scraping real job boards or importing real job postings (jobs enter via the Job Card form only)
- Connecting to a real employer's live agent platform or API (the Job Card form IS the interface)
- Real SMS/email/push sending (all offers and notices are in-app only)
- Custom login system (demo mode with a role switcher: Employer / Candidate / Board view;
  Supabase magic-link auth only if time remains after acceptance checks pass)
- Collecting real personal data, IDs, or documents (HR8 — fictional data only)
- Video lessons or generated media inside modules (text + practice items only in the MVP)

## 12. TECH BOUNDARIES (architecture rules)

- One Next.js app. Server-side route handlers call the LLM wrapper; API keys never reach the browser.
- All five agent behaviours live behind one `runAgent(name, input)` function that logs to
  `runs` and falls back to the Section 9/10 sample outputs in Mock Mode.
- Sorting, gap hours, pass/fail scoring, seat counting, and offer creation are DETERMINISTIC
  CODE (the Matcher and the scorer), never LLM output. This is deliberate: money and job
  promises must be rule-based and auditable.
- State changes follow the status fields in the data model only — no hidden state in the UI.
- Candidate-facing screens are mobile-first (max width ~480px content), Taglish, large tap
  targets, minimal text per screen. Employer and Board screens are desktop-first, English.
- The app must run fully offline-of-LLM in Mock Mode for the demo: sample dataset in,
  full loop out, badge visible.

## 13. BUILD ORDER (follow strictly)

Step 1 — Project skeleton, 6 pages with placeholder text, role switcher. Check: all pages load.
Step 2 — Data layer (Supabase or `/data` JSON) + `/samples` load/reset of Section 9 data.
  Check: sample employer, job, and 3 candidates appear on Board and Pool pages.
Step 3 — Job Intake form saves a Job Card; Job Analyzer (or Mock output) fills target skills.
  Check: sample job shows the 3 target skills from the spec.
Step 4 — Rate step: band proposed (demo-labelled), employer confirms 600 → job ACTIVE.
  Check: a job with unconfirmed pay cannot accept assessments (HR1 visible in UI).
Step 5 — Assessment run for the 3 sample candidates (keyed items, deterministic scoring).
  Check: Maria = READY, Jomar = TRAINABLE (~4h), Rhea = NOT YET. Exactly.
Step 6 — Module Builder output for the sample job; Employer Approval Gate incl. passing
  score edit. Check: Jomar's candidate view cannot open the module before approval (HR2).
Step 7 — Candidate plan: Jomar sees only his 2 gap sections, progress saving, test locked
  until sections complete (HR3). Check: test button disabled until both sections done.
Step 8 — Final test scoring (deterministic, HR4) + automatic GUARANTEED offer on pass (HR5),
  Maria's instant offer from Step 5, seats counter shows 2/2, waitlist labelling works.
Step 9 — Employer audit view (scored outputs) + rating saves back to Skill Profile.
Step 10 — Deploy to Vercel; run the full sample loop on the live link, on a phone-width screen.

## 14. ACCEPTANCE CHECKS (all must pass before demo)

1. Loading sample data and running the full loop end to end works with NO manual data entry.
2. Maria (READY) receives an offer with no module in between.
3. Jomar's module shows ~4 personal hours and only his 2 gap sections — not all 3.
4. Rhea sees the foundational routing message and NO offer; the words "rejected/failed" never appear.
5. Before employer approval, no candidate can open the module (HR2). After the employer edits
   the passing score, the new score is what the gate uses.
6. Jomar cannot open the final test before finishing his sections (HR3); after passing at the
   employer-set score, his offer appears automatically, marked GUARANTEED, showing ₱600/day.
7. Seats never exceed reserved slots: a 3rd passer is waitlisted and labelled NOT GUARANTEED (HR5).
8. With the LLM API off, Mock Mode completes the whole loop and the Mock Mode badge is visible.
9. A failed agent run is logged in `runs` with its error, and one retry succeeds or is shown failed.
10. The candidate view works at phone width; the employer can open a passed candidate's scored
    final-test output from the Job Review page (audit).

## 15. IF SOMETHING BREAKS (troubleshooting)

- LLM returns non-JSON → one retry with "Output JSON only, no other text", then Mock Mode
  output for that agent. Never let a parse error stop the loop.
- Supabase not connecting after 20 minutes → local JSON fallback; keep building.
- Sorting results differ from Section 9 → the gap formula or sample scores are wrong;
  fix the numbers, not the formula.
- Offer not created on pass → check seats_taken vs reserved_slots and the passing score
  actually stored on the approved module version (HR6).
- Deploy fails → run locally, record the demo from the local app, submit repo + recording.

## 16. DEMO SCRIPT (3 minutes — for the human presenter, not the code)

0:00–0:30 Problem: "AI agents still need humans — and the people who most need the work are
locked out without a degree. Employers can't find or train them for just one workflow step."
0:30–1:00 Jobs first: show the TidyNest Job Card — slots reserved, rate researched and
confirmed at ₱600/day BEFORE anyone trains.
1:00–1:40 Assessment: run the pool — Maria ready now, Jomar trainable in ~4 hours, Rhea
routed kindly to foundations. "The agent sorts by gap, in hours."
1:40–2:20 Employer gate + training: employer approves the module and sets the passing score
at 80. Jomar finishes his 2 sections on a phone screen and takes the final test.
2:20–2:50 The payoff: Jomar passes → GUARANTEED offer appears, no application, no interview.
Employer opens his scored test as proof. Board shows 2/2 slots filled.
2:50–3:00 Close: "The agent doesn't replace the human. It builds the human's way in.
Built in two evenings; every module starts from a real, paying job."
Backup rule: if the live app fails, play the recorded backup video and show screenshots.
Never debug live on stage.

## 17. DEFINITION OF DONE

All 10 acceptance checks pass on the live Vercel link (or the local fallback with a recorded
demo), the sample loop runs in Mock Mode with no API key, and no Hard Rule can be violated
through the UI.
