alter table public.noir_profiles
  add column if not exists cover_image text,
  add column if not exists interests text[] not null default '{}'::text[],
  add column if not exists looking_for text[] not null default '{}'::text[],
  add column if not exists boundaries text[] not null default '{}'::text[];

alter table public.noir_profiles
  drop constraint if exists noir_profiles_interests_limit,
  add constraint noir_profiles_interests_limit check (cardinality(interests) <= 20),
  drop constraint if exists noir_profiles_looking_for_limit,
  add constraint noir_profiles_looking_for_limit check (cardinality(looking_for) <= 20),
  drop constraint if exists noir_profiles_boundaries_limit,
  add constraint noir_profiles_boundaries_limit check (cardinality(boundaries) <= 20);
