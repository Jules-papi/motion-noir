create extension if not exists pgcrypto with schema extensions;
create extension if not exists fuzzystrmatch with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.play_mode as enum ('live', 'async');
create type public.room_status as enum (
  'waiting_for_partner', 'waiting_for_ready', 'in_progress', 'paused',
  'completed', 'expired', 'deleted'
);
create type public.round_status as enum (
  'waiting_for_answers', 'one_answer_received', 'both_answers_received', 'transitioning'
);
create type public.participant_role as enum ('creator', 'partner');
create type public.answer_role as enum ('self', 'guess');
create type public.question_type as enum (
  'single_choice', 'short_text', 'scale', 'multi_choice',
  'date', 'special_day', 'boolean', 'custom'
);
create type public.match_type as enum ('match', 'partial', 'different');

create table public.test_types (
  id bigint generated always as identity primary key,
  name text not null unique check (char_length(name) between 3 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.categories (
  id bigint generated always as identity primary key,
  name text not null unique check (char_length(name) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.questions (
  id bigint generated always as identity primary key,
  test_type_id bigint not null references public.test_types(id) on delete restrict,
  category_id bigint not null references public.categories(id) on delete restrict,
  question_text text not null check (char_length(question_text) between 10 and 300),
  question_type public.question_type not null,
  options_json jsonb not null default '[]'::jsonb check (jsonb_typeof(options_json) = 'array'),
  weight numeric(6,3) not null default 1 check (weight > 0 and weight <= 10),
  is_sensitive boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (test_type_id, question_text)
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique check (public_code ~ '^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$'),
  title text not null check (char_length(title) between 3 and 120),
  test_type_id bigint not null references public.test_types(id) on delete restrict,
  creator_name text not null check (char_length(creator_name) between 2 and 40),
  partner_name text not null check (char_length(partner_name) between 2 and 40),
  play_mode public.play_mode not null default 'live',
  status public.room_status not null default 'waiting_for_partner',
  question_count smallint not null check (question_count in (10, 20, 30)),
  selected_category_ids bigint[] not null check (cardinality(selected_category_ids) > 0),
  current_question_position smallint not null default 0 check (current_question_position >= 0),
  round_status public.round_status not null default 'waiting_for_answers',
  round_version bigint not null default 0 check (round_version >= 0),
  question_time_limit_seconds smallint check (question_time_limit_seconds in (30, 60, 90, 120)),
  question_started_at timestamptz,
  question_deadline_at timestamptz,
  realtime_topic text not null unique check (char_length(realtime_topic) >= 32),
  created_by_auth_user_id uuid not null references auth.users(id) on delete restrict,
  password_hash text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  paused_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz not null,
  deleted_at timestamptz,
  check (current_question_position <= question_count),
  check ((status = 'deleted') = (deleted_at is not null))
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  role public.participant_role not null,
  is_ready boolean not null default false,
  ready_at timestamptz,
  joined_at timestamptz not null default now(),
  completed_at timestamptz,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (room_id, role)
);

create table public.participant_sessions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz
);

create unique index participant_sessions_one_active_user
  on public.participant_sessions(auth_user_id)
  where revoked_at is null;
create unique index participant_sessions_one_active_participant
  on public.participant_sessions(participant_id)
  where revoked_at is null;

create table public.participant_rejoin_secrets (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  secret_hash text not null,
  created_at timestamptz not null default now(),
  used_at timestamptz,
  revoked_at timestamptz,
  expires_at timestamptz not null,
  check (expires_at > created_at)
);
create unique index participant_rejoin_one_active
  on public.participant_rejoin_secrets(participant_id)
  where revoked_at is null;

create table public.room_custom_questions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  created_by_participant_id uuid not null references public.participants(id) on delete cascade,
  question_text text not null check (char_length(question_text) between 10 and 220),
  created_at timestamptz not null default now()
);

create table public.room_questions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  question_id bigint references public.questions(id) on delete restrict,
  custom_question_id uuid references public.room_custom_questions(id) on delete cascade,
  position smallint not null check (position > 0),
  target_participant_id uuid not null references public.participants(id) on delete cascade,
  guesser_participant_id uuid not null references public.participants(id) on delete cascade,
  question_text_snapshot text not null,
  question_type_snapshot public.question_type not null,
  options_snapshot jsonb not null default '[]'::jsonb,
  weight_snapshot numeric(6,3) not null default 1,
  category_name_snapshot text not null,
  created_at timestamptz not null default now(),
  unique (room_id, position),
  check (target_participant_id <> guesser_participant_id),
  check ((question_id is not null)::int + (custom_question_id is not null)::int = 1)
);

create table public.answer_drafts (
  id uuid primary key default gen_random_uuid(),
  room_question_id uuid not null references public.room_questions(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  answer_text text check (answer_text is null or char_length(answer_text) <= 500),
  answer_json jsonb not null default '{}'::jsonb,
  client_version bigint not null default 0 check (client_version >= 0),
  updated_at timestamptz not null default now(),
  unique (room_question_id, participant_id)
);

create table public.answers (
  id uuid primary key default gen_random_uuid(),
  room_question_id uuid not null references public.room_questions(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  answer_role public.answer_role not null,
  answer_text text check (answer_text is null or char_length(answer_text) <= 500),
  answer_json jsonb not null default '{}'::jsonb,
  request_id uuid not null unique,
  round_number bigint not null check (round_number >= 0),
  timed_out boolean not null default false,
  submitted_at timestamptz not null default now(),
  locked_at timestamptz not null default now(),
  unique (room_question_id, participant_id)
);

create table public.async_submissions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  request_id uuid not null unique,
  submitted_at timestamptz not null default now(),
  unique (room_id, participant_id)
);

create table public.game_results (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null unique references public.rooms(id) on delete cascade,
  score numeric(6,3) not null check (score between 0 and 100),
  total_weight numeric(10,3) not null check (total_weight >= 0),
  matched_count integer not null default 0 check (matched_count >= 0),
  partial_count integer not null default 0 check (partial_count >= 0),
  different_count integer not null default 0 check (different_count >= 0),
  result_json jsonb not null,
  calculated_at timestamptz not null default now()
);

create table public.result_overrides (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  room_question_id uuid not null references public.room_questions(id) on delete cascade,
  override_type public.match_type not null,
  created_by_participant_id uuid not null references public.participants(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (room_id, room_question_id)
);

create table public.admin_users (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  action_key text not null check (char_length(action_key) between 3 and 80),
  attempt_count integer not null default 1 check (attempt_count > 0),
  window_started_at timestamptz not null default now(),
  unique (auth_user_id, action_key)
);

create index questions_active_catalog_idx on public.questions(test_type_id, category_id) where is_active;
create index questions_category_id_idx on public.questions(category_id);
create index rooms_creator_id_idx on public.rooms(created_by_auth_user_id);
create index rooms_status_expires_idx on public.rooms(status, expires_at) where deleted_at is null;
create index participants_room_id_idx on public.participants(room_id);
create index participant_sessions_participant_idx on public.participant_sessions(participant_id, revoked_at);
create index room_custom_questions_room_idx on public.room_custom_questions(room_id);
create index room_questions_room_position_idx on public.room_questions(room_id, position);
create index room_questions_target_idx on public.room_questions(target_participant_id);
create index room_questions_guesser_idx on public.room_questions(guesser_participant_id);
create index answer_drafts_participant_idx on public.answer_drafts(participant_id);
create index answers_question_idx on public.answers(room_question_id);
create index answers_participant_idx on public.answers(participant_id);
create index async_submissions_participant_idx on public.async_submissions(participant_id);
create index result_overrides_room_idx on public.result_overrides(room_id);
create index rate_limits_window_idx on public.rate_limits(auth_user_id, action_key, window_started_at);

create or replace function private.current_participant_id(target_room_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select ps.participant_id
  from public.participant_sessions ps
  join public.participants p on p.id = ps.participant_id
  where ps.auth_user_id = (select auth.uid())
    and ps.revoked_at is null
    and p.room_id = target_room_id
  limit 1
$$;

create or replace function private.is_room_member(target_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.current_participant_id(target_room_id) is not null
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where auth_user_id = (select auth.uid()) and is_active
  )
$$;

revoke all on function private.current_participant_id(uuid) from public, anon, authenticated;
revoke all on function private.is_room_member(uuid) from public, anon, authenticated;
revoke all on function private.is_admin() from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.current_participant_id(uuid) to authenticated;
grant execute on function private.is_room_member(uuid) to authenticated;
grant execute on function private.is_admin() to authenticated;

alter table public.test_types enable row level security;
alter table public.categories enable row level security;
alter table public.questions enable row level security;
alter table public.rooms enable row level security;
alter table public.participants enable row level security;
alter table public.participant_sessions enable row level security;
alter table public.participant_rejoin_secrets enable row level security;
alter table public.room_custom_questions enable row level security;
alter table public.room_questions enable row level security;
alter table public.answer_drafts enable row level security;
alter table public.answers enable row level security;
alter table public.async_submissions enable row level security;
alter table public.game_results enable row level security;
alter table public.result_overrides enable row level security;
alter table public.admin_users enable row level security;
alter table public.rate_limits enable row level security;

create policy "catalog test types readable" on public.test_types for select to authenticated using (is_active);
create policy "catalog categories readable" on public.categories for select to authenticated using (is_active);
create policy "catalog questions readable" on public.questions for select to authenticated using (is_active and not is_sensitive);
create policy "members read rooms" on public.rooms for select to authenticated
  using ((select private.is_room_member(id)) and deleted_at is null);
create policy "members read participants" on public.participants for select to authenticated
  using ((select private.is_room_member(room_id)));
create policy "users read own sessions" on public.participant_sessions for select to authenticated
  using ((select auth.uid()) = auth_user_id and revoked_at is null);
create policy "members read room questions" on public.room_questions for select to authenticated
  using ((select private.is_room_member(room_id)));
create policy "users read own drafts" on public.answer_drafts for select to authenticated
  using (participant_id = (select private.current_participant_id(
    (select rq.room_id from public.room_questions rq where rq.id = room_question_id)
  )));
create policy "users read own answers before completion" on public.answers for select to authenticated
  using (
    participant_id = (select private.current_participant_id(
      (select rq.room_id from public.room_questions rq where rq.id = room_question_id)
    ))
    or exists (
      select 1 from public.room_questions rq
      join public.rooms r on r.id = rq.room_id
      where rq.id = room_question_id
        and r.status = 'completed'
        and (select private.is_room_member(r.id))
    )
  );
create policy "users read own async submission" on public.async_submissions for select to authenticated
  using (
    participant_id = (select private.current_participant_id(room_id))
  );
create policy "members read completed results" on public.game_results for select to authenticated
  using ((select private.is_room_member(room_id)) and exists (
    select 1 from public.rooms r where r.id = room_id and r.status = 'completed'
  ));
create policy "members read overrides" on public.result_overrides for select to authenticated
  using ((select private.is_room_member(room_id)));
create policy "admins read admin list" on public.admin_users for select to authenticated
  using ((select private.is_admin()));

revoke all on all tables in schema public from anon, authenticated;
grant select on public.test_types, public.categories, public.questions to authenticated;
grant select on public.rooms, public.participants, public.participant_sessions,
  public.room_questions, public.answer_drafts, public.answers, public.game_results,
  public.async_submissions, public.result_overrides to authenticated;

;
