-- SkilledinPH: Live workspace migration. Run once in the Supabase SQL Editor, after schema.sql.
-- Additive and safe to re-run: existing rows become workspace 'demo', and the current app keeps working
-- before and after (it never reads or writes these new columns until the Live build is deployed).
-- All data stays fictional. No ID numbers, documents or payment details are stored (HR8).

-- 1. Every existing table gets a workspace: 'demo' (seeded, resettable) or 'live' (saved records).
alter table employers       add column if not exists workspace text not null default 'demo';
alter table jobs            add column if not exists workspace text not null default 'demo';
alter table candidates      add column if not exists workspace text not null default 'demo';
alter table skill_profiles  add column if not exists workspace text not null default 'demo';
alter table assessments     add column if not exists workspace text not null default 'demo';
alter table modules         add column if not exists workspace text not null default 'demo';
alter table candidate_plans add column if not exists workspace text not null default 'demo';
alter table test_results    add column if not exists workspace text not null default 'demo';
alter table offers          add column if not exists workspace text not null default 'demo';
alter table ratings         add column if not exists workspace text not null default 'demo';
alter table runs            add column if not exists workspace text not null default 'demo';

-- 2. Pool records hold background and goals only: never scores.
alter table candidates add column if not exists profile jsonb;

-- 3. The employer's Knowledge Base document.
create table if not exists knowledge_bases (
  seq bigint generated always as identity, id text primary key,
  workspace text not null default 'demo',
  employer_id text not null, file_name text not null, kind text not null, body text not null,
  version integer not null default 1, updated_at text
);

-- 4. The Assessment Pack for a job: tasks, key, points, partial-credit rules, KB source per item.
create table if not exists assessment_packs (
  seq bigint generated always as identity, id text primary key,
  workspace text not null default 'demo',
  job_id text not null, version integer not null, status text not null, items jsonb not null,
  sources text, created_at text, approved_at text
);

-- 5. One Skill Check per candidate per job: sent, then submitted once and scored by code.
create table if not exists skill_checks (
  seq bigint generated always as identity, id text primary key,
  workspace text not null default 'demo',
  job_id text not null, candidate_id text not null, pack_id text not null, status text not null,
  answers jsonb, scored jsonb, sent_at text, submitted_at text
);

alter table knowledge_bases  enable row level security;
alter table assessment_packs enable row level security;
alter table skill_checks     enable row level security;
