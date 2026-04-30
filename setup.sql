-- =========================================================
-- SECURE WEB-BASED STUDENT VOTING SYSTEM
-- COMPLETE DATABASE SCHEMA + RLS + TRIGGERS + POLICIES
-- =========================================================

begin;

-- =========================================================
-- EXTENSIONS
-- =========================================================
create extension if not exists "pgcrypto";

-- =========================================================
-- DROP OLD OBJECTS SAFELY (OPTIONAL FOR CLEAN RE-RUNS)
-- =========================================================

drop policy if exists "profiles_select_own_record" on public.profiles;
drop policy if exists "profiles_update_own_basic_record" on public.profiles;

drop policy if exists "elections_select_published_or_active_for_authenticated" on public.elections;
drop policy if exists "positions_select_for_visible_elections" on public.positions;
drop policy if exists "candidates_select_for_visible_elections" on public.candidates;
drop policy if exists "ballots_select_own_ballots" on public.ballots;
drop policy if exists "ballot_items_select_own_ballot_items" on public.ballot_items;
drop policy if exists "audit_logs_no_direct_access" on public.audit_logs;

drop trigger if exists trg_set_profiles_updated_at on public.profiles;
drop trigger if exists trg_set_elections_updated_at on public.elections;
drop trigger if exists trg_set_positions_updated_at on public.positions;
drop trigger if exists trg_set_candidates_updated_at on public.candidates;
drop trigger if exists trg_set_ballots_updated_at on public.ballots;
drop trigger if exists trg_set_ballot_items_updated_at on public.ballot_items;
drop trigger if exists trg_set_audit_logs_updated_at on public.audit_logs;
drop trigger if exists trg_handle_new_auth_user on auth.users;

drop function if exists public.set_updated_at();
drop function if exists public.handle_new_auth_user();

drop table if exists public.audit_logs cascade;
drop table if exists public.ballot_items cascade;
drop table if exists public.ballots cascade;
drop table if exists public.candidates cascade;
drop table if exists public.positions cascade;
drop table if exists public.elections cascade;
drop table if exists public.profiles cascade;

drop type if exists public.election_status cascade;
drop type if exists public.user_role cascade;

-- =========================================================
-- ENUMS
-- =========================================================

create type public.user_role as enum (
  'admin',
  'student',
  'election_officer'
);

create type public.election_status as enum (
  'draft',
  'active',
  'closed',
  'published'
);

-- =========================================================
-- GENERIC UPDATED_AT TRIGGER FUNCTION
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- =========================================================
-- PROFILES
-- =========================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  email text not null unique,
  full_name text not null,

  role public.user_role not null default 'student',

  department text,
  matric_no text unique,
  level text,

  is_active boolean not null default true,
  is_eligible boolean not null default false,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint profiles_student_matric_check
    check (
      role <> 'student'
      or matric_no is not null
    )
);

create index idx_profiles_role on public.profiles(role);
create index idx_profiles_is_active on public.profiles(is_active);
create index idx_profiles_is_eligible on public.profiles(is_eligible);
create index idx_profiles_department on public.profiles(department);

create trigger trg_set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- =========================================================
-- ELECTIONS
-- =========================================================

create table public.elections (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  description text,

  status public.election_status not null default 'draft',

  start_time timestamptz not null,
  end_time timestamptz not null,

  published_at timestamptz,

  created_by uuid references public.profiles(id) on delete set null,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint elections_time_check check (end_time > start_time)
);

create index idx_elections_status on public.elections(status);
create index idx_elections_start_time on public.elections(start_time);
create index idx_elections_end_time on public.elections(end_time);
create index idx_elections_created_by on public.elections(created_by);

create trigger trg_set_elections_updated_at
before update on public.elections
for each row
execute function public.set_updated_at();

-- =========================================================
-- POSITIONS
-- =========================================================

create table public.positions (
  id uuid primary key default gen_random_uuid(),

  election_id uuid not null references public.elections(id) on delete cascade,

  title text not null,
  description text,

  display_order integer not null default 1,
  max_selections integer not null default 1,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint positions_display_order_check check (display_order > 0),
  constraint positions_max_selections_check check (max_selections > 0),
  constraint positions_unique_title_per_election unique (election_id, title),
  constraint positions_unique_order_per_election unique (election_id, display_order)
);

create index idx_positions_election_id on public.positions(election_id);
create index idx_positions_display_order on public.positions(election_id, display_order);

create trigger trg_set_positions_updated_at
before update on public.positions
for each row
execute function public.set_updated_at();

-- =========================================================
-- CANDIDATES
-- =========================================================

create table public.candidates (
  id uuid primary key default gen_random_uuid(),

  election_id uuid not null references public.elections(id) on delete cascade,
  position_id uuid not null references public.positions(id) on delete cascade,

  full_name text not null,
  matric_no text,
  department text,
  level text,

  manifesto text,
  image_url text,

  is_active boolean not null default true,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint candidates_unique_name_per_position unique (position_id, full_name)
);

create index idx_candidates_election_id on public.candidates(election_id);
create index idx_candidates_position_id on public.candidates(position_id);
create index idx_candidates_is_active on public.candidates(is_active);

create trigger trg_set_candidates_updated_at
before update on public.candidates
for each row
execute function public.set_updated_at();

-- =========================================================
-- BALLOTS
-- =========================================================

create table public.ballots (
  id uuid primary key default gen_random_uuid(),

  election_id uuid not null references public.elections(id) on delete cascade,
  voter_id uuid not null references public.profiles(id) on delete cascade,

  submitted_at timestamptz not null default timezone('utc', now()),

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint ballots_one_vote_per_student_per_election unique (election_id, voter_id)
);

create index idx_ballots_election_id on public.ballots(election_id);
create index idx_ballots_voter_id on public.ballots(voter_id);
create index idx_ballots_submitted_at on public.ballots(submitted_at);

create trigger trg_set_ballots_updated_at
before update on public.ballots
for each row
execute function public.set_updated_at();

-- =========================================================
-- BALLOT ITEMS
-- =========================================================

create table public.ballot_items (
  id uuid primary key default gen_random_uuid(),

  ballot_id uuid not null references public.ballots(id) on delete cascade,
  position_id uuid not null references public.positions(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint ballot_items_one_choice_per_position unique (ballot_id, position_id)
);

create index idx_ballot_items_ballot_id on public.ballot_items(ballot_id);
create index idx_ballot_items_position_id on public.ballot_items(position_id);
create index idx_ballot_items_candidate_id on public.ballot_items(candidate_id);

create trigger trg_set_ballot_items_updated_at
before update on public.ballot_items
for each row
execute function public.set_updated_at();

-- =========================================================
-- AUDIT LOGS
-- =========================================================

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),

  actor_id uuid references public.profiles(id) on delete set null,

  action text not null,
  entity_type text,
  entity_id uuid,
  description text,
  metadata jsonb,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index idx_audit_logs_actor_id on public.audit_logs(actor_id);
create index idx_audit_logs_action on public.audit_logs(action);
create index idx_audit_logs_entity_type on public.audit_logs(entity_type);
create index idx_audit_logs_entity_id on public.audit_logs(entity_id);
create index idx_audit_logs_created_at on public.audit_logs(created_at desc);

create trigger trg_set_audit_logs_updated_at
before update on public.audit_logs
for each row
execute function public.set_updated_at();

-- =========================================================
-- HELPER TRIGGER: AUTO-CREATE / UPSERT PROFILE ON AUTH USER CREATION
-- =========================================================

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text;
  meta_full_name text;
  meta_department text;
  meta_matric_no text;
  meta_level text;
  meta_is_active boolean;
  meta_is_eligible boolean;
begin
  meta_role := coalesce(new.raw_user_meta_data ->> 'role', 'student');
  meta_full_name := coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1));
  meta_department := new.raw_user_meta_data ->> 'department';
  meta_matric_no := new.raw_user_meta_data ->> 'matric_no';
  meta_level := new.raw_user_meta_data ->> 'level';
  meta_is_active := coalesce((new.raw_user_meta_data ->> 'is_active')::boolean, true);
  meta_is_eligible := coalesce((new.raw_user_meta_data ->> 'is_eligible')::boolean, false);

  insert into public.profiles (
    id,
    email,
    full_name,
    role,
    department,
    matric_no,
    level,
    is_active,
    is_eligible
  )
  values (
    new.id,
    new.email,
    meta_full_name,
    meta_role::public.user_role,
    meta_department,
    meta_matric_no,
    meta_level,
    meta_is_active,
    meta_is_eligible
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role,
    department = excluded.department,
    matric_no = excluded.matric_no,
    level = excluded.level,
    is_active = excluded.is_active,
    is_eligible = excluded.is_eligible,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

create trigger trg_handle_new_auth_user
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

-- =========================================================
-- DATA INTEGRITY CHECKS VIA CONSTRAINT TRIGGERS
-- =========================================================

create or replace function public.validate_candidate_matches_position_and_election()
returns trigger
language plpgsql
as $$
declare
  candidate_position_id uuid;
  candidate_election_id uuid;
  ballot_election_id uuid;
begin
  select c.position_id, c.election_id
  into candidate_position_id, candidate_election_id
  from public.candidates c
  where c.id = new.candidate_id;

  if candidate_position_id is null then
    raise exception 'Candidate does not exist.';
  end if;

  if candidate_position_id <> new.position_id then
    raise exception 'Candidate does not belong to the selected position.';
  end if;

  select b.election_id
  into ballot_election_id
  from public.ballots b
  where b.id = new.ballot_id;

  if ballot_election_id is null then
    raise exception 'Ballot does not exist.';
  end if;

  if candidate_election_id <> ballot_election_id then
    raise exception 'Candidate does not belong to the same election as the ballot.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_ballot_item_candidate on public.ballot_items;
create trigger trg_validate_ballot_item_candidate
before insert or update on public.ballot_items
for each row
execute function public.validate_candidate_matches_position_and_election();

create or replace function public.validate_position_matches_ballot_election()
returns trigger
language plpgsql
as $$
declare
  position_election_id uuid;
  ballot_election_id uuid;
begin
  select p.election_id into position_election_id
  from public.positions p
  where p.id = new.position_id;

  select b.election_id into ballot_election_id
  from public.ballots b
  where b.id = new.ballot_id;

  if position_election_id is null or ballot_election_id is null then
    raise exception 'Position or ballot does not exist.';
  end if;

  if position_election_id <> ballot_election_id then
    raise exception 'Position does not belong to the ballot election.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_ballot_item_position on public.ballot_items;
create trigger trg_validate_ballot_item_position
before insert or update on public.ballot_items
for each row
execute function public.validate_position_matches_ballot_election();

-- =========================================================
-- ENABLE ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles enable row level security;
alter table public.elections enable row level security;
alter table public.positions enable row level security;
alter table public.candidates enable row level security;
alter table public.ballots enable row level security;
alter table public.ballot_items enable row level security;
alter table public.audit_logs enable row level security;

-- =========================================================
-- RLS POLICIES
-- NOTE:
-- Service role bypasses RLS, so your backend can still manage writes safely.
-- These policies mainly protect direct client-side access.
-- =========================================================

-- -------------------------
-- PROFILES
-- -------------------------

create policy "profiles_select_own_record"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_update_own_basic_record"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role = (select p.role from public.profiles p where p.id = auth.uid())
);

-- -------------------------
-- ELECTIONS
-- Students/officers can directly read active/published elections if needed.
-- Admin reads/writes are expected via backend/service role.
-- -------------------------

create policy "elections_select_published_or_active_for_authenticated"
on public.elections
for select
to authenticated
using (status in ('active', 'published', 'closed'));

-- -------------------------
-- POSITIONS
-- Direct client reads allowed only for visible elections.
-- -------------------------

create policy "positions_select_for_visible_elections"
on public.positions
for select
to authenticated
using (
  exists (
    select 1
    from public.elections e
    where e.id = positions.election_id
      and e.status in ('active', 'published', 'closed')
  )
);

-- -------------------------
-- CANDIDATES
-- Direct client reads allowed only for visible elections.
-- -------------------------

create policy "candidates_select_for_visible_elections"
on public.candidates
for select
to authenticated
using (
  exists (
    select 1
    from public.elections e
    where e.id = candidates.election_id
      and e.status in ('active', 'published', 'closed')
  )
);

-- -------------------------
-- BALLOTS
-- A user can only directly see their own ballots.
-- Ballot insert/update/delete should go through backend/service role.
-- -------------------------

create policy "ballots_select_own_ballots"
on public.ballots
for select
to authenticated
using (voter_id = auth.uid());

-- -------------------------
-- BALLOT ITEMS
-- A user can only directly see items belonging to their own ballot.
-- Inserts should go through backend/service role.
-- -------------------------

create policy "ballot_items_select_own_ballot_items"
on public.ballot_items
for select
to authenticated
using (
  exists (
    select 1
    from public.ballots b
    where b.id = ballot_items.ballot_id
      and b.voter_id = auth.uid()
  )
);

-- -------------------------
-- AUDIT LOGS
-- No direct client access.
-- Admin should read via backend/service role.
-- -------------------------

create policy "audit_logs_no_direct_access"
on public.audit_logs
for select
to authenticated
using (false);

-- =========================================================
-- OPTIONAL SEED ADMIN NOTE
-- =========================================================
-- After creating an auth user for your first admin, either:
-- 1. pass raw_user_meta_data during signup/admin creation, or
-- 2. update the profile row manually afterward.
--
-- Example:
-- update public.profiles
-- set role = 'admin', is_active = true, is_eligible = false
-- where email = 'admin@example.com';

commit;