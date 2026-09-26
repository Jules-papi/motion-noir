create or replace function private.can_access_realtime_topic(target_topic text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.rooms r
    join public.participants p on p.room_id = r.id
    join public.participant_sessions ps on ps.participant_id = p.id
    where ps.auth_user_id = (select auth.uid())
      and ps.revoked_at is null
      and r.deleted_at is null
      and ('room:' || r.realtime_topic) = target_topic
  )
$$;

revoke all on function private.can_access_realtime_topic(text) from public, anon, authenticated;
grant execute on function private.can_access_realtime_topic(text) to authenticated;

do $$
begin
  if to_regclass('realtime.messages') is not null
    and to_regprocedure('realtime.topic()') is not null then
    execute $policy$
      create policy "room members receive private broadcasts"
      on realtime.messages
      for select
      to authenticated
      using (
        realtime.messages.extension = 'broadcast'
        and (select private.can_access_realtime_topic(realtime.topic()))
      )
    $policy$;
    execute $policy$
      create policy "room members send private broadcasts"
      on realtime.messages
      for insert
      to authenticated
      with check (
        realtime.messages.extension = 'broadcast'
        and (select private.can_access_realtime_topic(realtime.topic()))
      )
    $policy$;
  end if;
end;
$$;

create or replace function public.admin_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then raise exception 'ADMIN_REQUIRED' using errcode = '42501'; end if;
  return jsonb_build_object(
    'totalRooms', (select count(*) from public.rooms),
    'activeRooms', (select count(*) from public.rooms where status in ('waiting_for_partner', 'waiting_for_ready', 'in_progress', 'paused')),
    'completedRooms', (select count(*) from public.rooms where status = 'completed'),
    'dailyRooms', (select count(*) from public.rooms where created_at >= current_date),
    'monthlyRooms', (select count(*) from public.rooms where created_at >= date_trunc('month', now())),
    'expiredRooms', (select count(*) from public.rooms where expires_at <= now()),
    'categories', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id, 'name', name, 'slug', slug, 'isActive', is_active
      ) order by id)
      from public.categories
    ), '[]'::jsonb),
    'testTypes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id, 'name', name, 'slug', slug, 'description', description, 'isActive', is_active
      ) order by id)
      from public.test_types
    ), '[]'::jsonb),
    'testTypeStats', coalesce((
      select jsonb_agg(jsonb_build_object('name', name, 'count', room_count) order by room_count desc)
      from (
        select tt.name, count(r.id) room_count
        from public.test_types tt left join public.rooms r on r.test_type_id = tt.id
        group by tt.id, tt.name
      ) stats
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.admin_list_questions()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then raise exception 'ADMIN_REQUIRED' using errcode = '42501'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', q.id, 'questionText', q.question_text, 'questionType', q.question_type,
      'isActive', q.is_active, 'categoryName', c.name, 'testTypeName', tt.name
    ) order by q.id desc)
    from public.questions q
    join public.categories c on c.id = q.category_id
    join public.test_types tt on tt.id = q.test_type_id
  ), '[]'::jsonb);
end;
$$;

create or replace function public.admin_upsert_question(payload jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare result public.questions%rowtype;
begin
  if not private.is_admin() then raise exception 'ADMIN_REQUIRED' using errcode = '42501'; end if;
  if payload ? 'id' then
    update public.questions set
      question_text = coalesce(payload->>'questionText', question_text),
      question_type = coalesce((payload->>'questionType')::public.question_type, question_type),
      test_type_id = coalesce((payload->>'testTypeId')::bigint, test_type_id),
      category_id = coalesce((payload->>'categoryId')::bigint, category_id),
      options_json = coalesce(payload->'options', options_json),
      weight = coalesce((payload->>'weight')::numeric, weight),
      is_sensitive = coalesce((payload->>'isSensitive')::boolean, is_sensitive),
      is_active = coalesce((payload->>'isActive')::boolean, is_active),
      updated_at = now()
    where id = (payload->>'id')::bigint returning * into result;
  else
    insert into public.questions(
      question_text, question_type, test_type_id, category_id,
      options_json, weight, is_sensitive, is_active
    ) values (
      payload->>'questionText',
      coalesce((payload->>'questionType')::public.question_type, 'short_text'),
      (payload->>'testTypeId')::bigint,
      (payload->>'categoryId')::bigint,
      coalesce(payload->'options', '[]'::jsonb),
      coalesce((payload->>'weight')::numeric, 1),
      coalesce((payload->>'isSensitive')::boolean, false),
      coalesce((payload->>'isActive')::boolean, true)
    ) returning * into result;
  end if;
  if result.id is null then raise exception 'QUESTION_NOT_FOUND' using errcode = 'P0002'; end if;
  return to_jsonb(result);
end;
$$;

create or replace function public.admin_upsert_category(payload jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare result public.categories%rowtype;
begin
  if not private.is_admin() then raise exception 'ADMIN_REQUIRED' using errcode = '42501'; end if;
  insert into public.categories(id, name, slug, is_active)
  overriding system value
  values (
    coalesce((payload->>'id')::bigint, nextval(pg_get_serial_sequence('public.categories', 'id'))),
    payload->>'name', payload->>'slug', coalesce((payload->>'isActive')::boolean, true)
  )
  on conflict (id) do update set name = excluded.name, slug = excluded.slug, is_active = excluded.is_active
  returning * into result;
  return to_jsonb(result);
end;
$$;

create or replace function public.admin_upsert_test_type(payload jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare result public.test_types%rowtype;
begin
  if not private.is_admin() then raise exception 'ADMIN_REQUIRED' using errcode = '42501'; end if;
  insert into public.test_types(id, name, slug, description, is_active)
  overriding system value
  values (
    coalesce((payload->>'id')::bigint, nextval(pg_get_serial_sequence('public.test_types', 'id'))),
    payload->>'name', payload->>'slug', payload->>'description',
    coalesce((payload->>'isActive')::boolean, true)
  )
  on conflict (id) do update set
    name = excluded.name, slug = excluded.slug,
    description = excluded.description, is_active = excluded.is_active
  returning * into result;
  return to_jsonb(result);
end;
$$;

create or replace function private.cleanup_expired_rooms()
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare deleted_count integer;
begin
  with deleted as (
    delete from public.rooms
    where expires_at <= now() or (status = 'deleted' and deleted_at <= now() - interval '1 hour')
    returning 1
  )
  select count(*) into deleted_count from deleted;
  return deleted_count;
end;
$$;

create or replace function public.admin_cleanup_expired()
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare deleted_count integer;
begin
  if not private.is_admin() then raise exception 'ADMIN_REQUIRED' using errcode = '42501'; end if;
  deleted_count := private.cleanup_expired_rooms();
  return jsonb_build_object('deletedCount', deleted_count);
end;
$$;

create extension if not exists pg_cron with schema extensions;
select cron.schedule(
  'cleanup-expired-couple-game-rooms',
  '17 * * * *',
  $$select private.cleanup_expired_rooms();$$
)
where not exists (
  select 1 from cron.job where jobname = 'cleanup-expired-couple-game-rooms'
);

revoke all on function public.admin_overview() from public, anon;
revoke all on function public.admin_list_questions() from public, anon;
revoke all on function public.admin_upsert_question(jsonb) from public, anon;
revoke all on function public.admin_upsert_category(jsonb) from public, anon;
revoke all on function public.admin_upsert_test_type(jsonb) from public, anon;
revoke all on function public.admin_cleanup_expired() from public, anon;
grant execute on function public.admin_overview() to authenticated;
grant execute on function public.admin_list_questions() to authenticated;
grant execute on function public.admin_upsert_question(jsonb) to authenticated;
grant execute on function public.admin_upsert_category(jsonb) to authenticated;
grant execute on function public.admin_upsert_test_type(jsonb) to authenticated;
grant execute on function public.admin_cleanup_expired() to authenticated;

;
