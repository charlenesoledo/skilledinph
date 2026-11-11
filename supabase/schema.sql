-- Orchestrator: Supabase schema (spec Section 8).
-- Run this once in the Supabase SQL Editor of a new project.
-- All demo data is fictional. No ID numbers, documents or payment details are stored (HR8).
--
-- `seq` keeps rows in insertion order; the app never writes it.
-- Row Level Security is on with no policies, so only the server (service role key) can read or write.

create table if not exists employers (
  seq bigint generated always as identity, id text primary key,
  name text not null, contact_label text, created_at text
);

create table if not exists jobs (
  seq bigint generated always as identity, id text primary key,
  employer_id text not null, title text not null, workflow_step text, why_human text, tasks text,
  target_skills jsonb not null default '[]', rubric jsonb not null default '[]',
  good_example text, bad_example text,
  reserved_slots integer not null, seats_taken integer not null default 0,
  rate_band_demo text, pay_confirmed double precision, pay_status text not null,
  deadline text, tools_needed text, status text not null,
  constraint seats_within_slots check (seats_taken <= reserved_slots)  -- HR5, enforced by the database too
);

create table if not exists candidates (
  seq bigint generated always as identity, id text primary key,
  display_name text not null, phone_label text, location_label text, foundational_level text, created_at text
);

create table if not exists skill_profiles (
  seq bigint generated always as identity, id text primary key,
  candidate_id text not null, skill text not null, level double precision not null, updated_at text, source text not null
);

create table if not exists assessments (
  seq bigint generated always as identity, id text primary key,
  job_id text not null, candidate_id text not null, items jsonb not null, score_per_skill jsonb not null,
  total_gap_hours double precision not null, sorting text not null, created_at text
);

create table if not exists modules (
  seq bigint generated always as identity, id text primary key,
  job_id text not null, version integer not null, sections jsonb not null, final_test jsonb not null,
  proposed_passing_score double precision not null, passing_score double precision not null,
  status text not null, employer_notes text not null default ''
);

create table if not exists candidate_plans (
  seq bigint generated always as identity, id text primary key,
  candidate_id text not null, module_id text not null, assigned_sections jsonb not null,
  personal_hours double precision not null, progress jsonb not null default '{}', status text not null
);

create table if not exists test_results (
  seq bigint generated always as identity, id text primary key,
  candidate_plan_id text not null, answers jsonb not null, score double precision not null, passed boolean not null,
  scored_output jsonb not null, created_at text
);

create table if not exists offers (
  seq bigint generated always as identity, id text primary key,
  job_id text not null, candidate_id text not null, test_result_id text,
  guaranteed boolean not null, pay_confirmed double precision not null, status text not null, created_at text
);

create table if not exists ratings (
  seq bigint generated always as identity, id text primary key,
  job_id text not null, candidate_id text not null, employer_id text not null,
  stars integer not null check (stars between 1 and 5), note text not null default '', created_at text
);

create table if not exists runs (
  seq bigint generated always as identity, id text primary key,
  agent text not null, ref_type text not null, ref_id text not null,
  started_at text, finished_at text, ok boolean not null, error text, mock boolean not null
);

-- Demo-only switch used to show a failed agent run (HR7).
create table if not exists demo_flags (
  id text primary key, fail_next_run boolean not null default false
);

alter table employers enable row level security;
alter table jobs enable row level security;
alter table candidates enable row level security;
alter table skill_profiles enable row level security;
alter table assessments enable row level security;
alter table modules enable row level security;
alter table candidate_plans enable row level security;
alter table test_results enable row level security;
alter table offers enable row level security;
alter table ratings enable row level security;
alter table runs enable row level security;
alter table demo_flags enable row level security;
