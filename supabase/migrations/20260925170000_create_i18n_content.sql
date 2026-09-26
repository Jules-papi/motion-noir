-- Major Club translation catalogue.
-- UI can pivot values into TR | EN | NL | DE | FR columns while storage stays scalable.

create table if not exists public.noir_i18n_entries (
  key text primary key,
  namespace text not null default 'common',
  content_type text not null default 'plain'
    check (content_type in ('plain', 'markdown')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.noir_i18n_values (
  entry_key text not null references public.noir_i18n_entries(key) on delete cascade,
  locale text not null check (locale in ('tr', 'en', 'nl', 'de', 'fr')),
  value text not null default '',
  is_published boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (entry_key, locale)
);

create index if not exists noir_i18n_values_published_locale_idx
  on public.noir_i18n_values (locale, entry_key)
  where is_published;

create or replace function public.noir_i18n_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists noir_i18n_entries_set_updated_at on public.noir_i18n_entries;
create trigger noir_i18n_entries_set_updated_at
before update on public.noir_i18n_entries
for each row execute function public.noir_i18n_set_updated_at();

drop trigger if exists noir_i18n_values_set_updated_at on public.noir_i18n_values;
create trigger noir_i18n_values_set_updated_at
before update on public.noir_i18n_values
for each row execute function public.noir_i18n_set_updated_at();

alter table public.noir_i18n_entries enable row level security;
alter table public.noir_i18n_values enable row level security;

create policy "Published translation entries are readable"
on public.noir_i18n_entries
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.noir_i18n_values value
    where value.entry_key = key
      and value.is_published
  )
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Published translation values are readable"
on public.noir_i18n_values
for select
to anon, authenticated
using (
  is_published
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Admins manage translation entries"
on public.noir_i18n_entries
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins manage translation values"
on public.noir_i18n_values
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  and (updated_by is null or updated_by = auth.uid())
);

revoke all on public.noir_i18n_entries from public;
revoke all on public.noir_i18n_values from public;
grant select on public.noir_i18n_entries to anon, authenticated;
grant select on public.noir_i18n_values to anon, authenticated;
grant insert, update, delete on public.noir_i18n_entries to authenticated;
grant insert, update, delete on public.noir_i18n_values to authenticated;

create or replace view public.noir_i18n_matrix
with (security_invoker = true)
as
select
  entry.key,
  entry.namespace,
  entry.content_type,
  entry.description,
  max(value.value) filter (where value.locale = 'tr') as tr,
  max(value.value) filter (where value.locale = 'en') as en,
  max(value.value) filter (where value.locale = 'nl') as nl,
  max(value.value) filter (where value.locale = 'de') as de,
  max(value.value) filter (where value.locale = 'fr') as fr,
  count(*) filter (where value.is_published) as published_locale_count
from public.noir_i18n_entries entry
left join public.noir_i18n_values value on value.entry_key = entry.key
group by entry.key, entry.namespace, entry.content_type, entry.description;

grant select on public.noir_i18n_matrix to anon, authenticated;

