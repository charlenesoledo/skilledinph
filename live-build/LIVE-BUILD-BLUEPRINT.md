# SkilledinPH — Live Build Blueprint (fleshed out, pre-prompt)

## The decision: two pages, one system

**1. Demo page (presentation)**
- Deterministic, resettable, safe to present. Seeded outcomes, Present Mode, backup if anything fails live.
- Keeps the MOCK MODE badge. This is the stage copy.

**2. Live page (working)**
- The same screens and components, but the forms actually work: an employer can be created, a Knowledge Base attached, a job posted, employees added to the pool, and the agent run step by step.
- Starts from the fictitious employer + pool in this folder (imported as real records, not hard-coded screens).
- The MOCK MODE badge comes off this page **only after the live gate below passes**. Until then it stays — we do not claim "live" for something that is still scripted.

Both pages share: data model, scoring code, and UI. They differ only in where the data comes from (seed script vs saved records) and the badge.

## The live gate (all four must be true before removing Mock Mode)

1. The employer's Knowledge Base is saved and shown in their portal.
2. The Assessment Pack is generated from that job + KB and approved by the employer.
3. At least one candidate answers the Skill Check and is scored by code (not by a seeded score).
4. All results survive a page reload.

## How anyone gets to the assessment (exact click path)

**Employer path (creates it):**
Employer → *New Job* → fill Job Card → *Attach Knowledge Base* → **Run Job Analyzer** (skills + targets appear) → **Generate Assessment Pack** → Assessment Pack page opens with two tabs: *Candidate view* and *Employer key & rubric* → employer edits the passing score if they want → **Approve Assessment Pack**.

**Agent path (runs it):**
Pool → select the job → select candidates → **Send Skill Check** → candidates move to *Assessing* on the Board.

**Employee path (takes it):**
Candidate page → **Start Skill Check** (phone-first, ~15 minutes, instructions in Taglish) → answer 6 tasks → **Submit** → sees only: "Natanggap na ang sagot mo" — no score shown yet.

**Where the results land:**
- Pool: per-skill scores, gap hours, READY / TRAINABLE / NOT YET.
- Candidate page: "How we measured your skills" — the tasks they answered and their results.
- Job Review (employer): the same scores + the item-by-item scored output (audit view) for anyone who passed.
- Board: cards move Assessing → Training / Offered.

## What the agent actually does (no magic)

| Agent | Reads | Produces | Decided by |
|---|---|---|---|
| Job Analyzer | Job Card + Knowledge Base | Skill list, targets, quality rubric | LLM drafts; employer confirms |
| Assessment Builder | Skills + KB examples/rules | Assessment Pack: 6 tasks, answer key, points, source link per item | LLM drafts; employer approves |
| Scorer | Candidate answers + approved key | Per-skill scores, gap hours, sorting | **Code only — never the LLM** |
| Module Builder | Gap + KB | Layer A job module (gap only) + Layer B growth units | LLM drafts; employer approves |
| QA Explainer | Scored output | Plain-language explanation of any score | LLM explains; never changes a score |

## Assessment design rules (so it looks and is real)

- 6 tasks, 2 per skill, ~15 minutes, phone-first, large tap targets.
- Every task is built from the employer's own KB (their prices, their tone guide, their SOPs) — and each item shows its KB source on the employer side.
- Every task is a *work sample* (check this listing, choose this reply), not a school exam.
- Candidate never sees the key. Employer always can.
- Scoring is deterministic: each skill = its 2 items × 50 points, with stated partial credit.
- One retake allowed after targeted practice; the version used is recorded.

## Files in this folder

- `EMPLOYER-KNOWLEDGE-BASE-TIDYNEST.md` — the near-complete fictitious KB CJ can attach.
- `FICTITIOUS-EMPLOYEE-POOL.md` — 6 fictitious employees + (separately) expected demo outcomes.
- `SAMPLE-ASSESSMENT-PACK.md` — what the agent generates: candidate view, employer key/rubric, one fully scored attempt.

## Order of work (agreed)

1. These source files (done first, human-checked).
2. Verify the flow on paper against the app.
3. Only then write the build prompt.
4. Deck and architecture come LAST.
