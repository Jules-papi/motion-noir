create or replace function private.random_room_code()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  bytes bytea := extensions.gen_random_bytes(8);
  result text := '';
  i integer;
begin
  for i in 0..7 loop
    result := result || substr(alphabet, (get_byte(bytes, i) % length(alphabet)) + 1, 1);
  end loop;
  return result;
end;
$$;

create or replace function private.rate_limit(action_name text, max_attempts integer, window_seconds integer)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_row public.rate_limits%rowtype;
begin
  if current_user_id is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  insert into public.rate_limits(auth_user_id, action_key, attempt_count, window_started_at)
  values (current_user_id, action_name, 1, now())
  on conflict (auth_user_id, action_key) do update
    set attempt_count = case
      when public.rate_limits.window_started_at < now() - make_interval(secs => window_seconds) then 1
      else public.rate_limits.attempt_count + 1 end,
      window_started_at = case
      when public.rate_limits.window_started_at < now() - make_interval(secs => window_seconds) then now()
      else public.rate_limits.window_started_at end
  returning * into current_row;
  if current_row.attempt_count > max_attempts then
    raise exception 'RATE_LIMITED' using errcode = 'P0001';
  end if;
end;
$$;

create or replace function private.assert_safe_custom_question(question_text text)
returns void
language plpgsql
immutable
security invoker
set search_path = ''
as $$
declare
  normalized text := lower(question_text);
begin
  if char_length(trim(question_text)) not between 10 and 220 then
    raise exception 'CUSTOM_QUESTION_LENGTH' using errcode = '22001';
  end if;
  if normalized ~ '(Ã¶ldÃ¼r|tecavÃ¼z|ÅŸantaj|tehdit|Ã§Ä±plak|porno|seks yap|dayak|iÅŸkence)' then
    raise exception 'CUSTOM_QUESTION_UNSAFE' using errcode = '22023';
  end if;
end;
$$;

create or replace function private.broadcast_room(
  target_room_id uuid,
  event_name text,
  event_version bigint
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  topic_value text;
begin
  select realtime_topic into topic_value from public.rooms where id = target_room_id;
  if topic_value is null then return; end if;
  perform realtime.send(
    jsonb_build_object('event', event_name, 'roomId', target_room_id, 'roundVersion', event_version),
    event_name,
    'room:' || topic_value,
    true
  );
end;
$$;

create or replace function private.make_recovery_secret(target_participant_id uuid, expiration timestamptz)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  raw_secret text := translate(encode(extensions.gen_random_bytes(24), 'base64'), '+/=', '-_');
begin
  update public.participant_rejoin_secrets
    set revoked_at = now()
    where participant_id = target_participant_id and revoked_at is null;
  insert into public.participant_rejoin_secrets(participant_id, secret_hash, expires_at)
  values (target_participant_id, extensions.crypt(raw_secret, extensions.gen_salt('bf', 12)), expiration);
  return raw_secret;
end;
$$;

create or replace function public.get_catalog()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'testTypes', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'description', description) order by id)
      from public.test_types where is_active
    ), '[]'::jsonb),
    'categories', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'name', name) order by id)
      from public.categories where is_active
    ), '[]'::jsonb)
  )
$$;

create or replace function public.create_room(payload jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  user_id uuid := (select auth.uid());
  new_room public.rooms%rowtype;
  creator public.participants%rowtype;
  code_value text;
  recovery text;
  origin_value text;
  custom_text jsonb;
  custom_count integer := coalesce(jsonb_array_length(coalesce(payload->'customQuestions', '[]'::jsonb)), 0);
  categories_count integer := coalesce(jsonb_array_length(coalesce(payload->'categoryIds', '[]'::jsonb)), 0);
begin
  if user_id is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  perform private.rate_limit('create_room', 5, 3600);
  if coalesce(payload->>'creatorName', '') !~ '^.{2,40}$'
    or coalesce(payload->>'partnerName', '') !~ '^.{2,40}$' then
    raise exception 'INVALID_NAMES' using errcode = '22023';
  end if;
  if (payload->>'questionCount')::integer not in (10, 20, 30) then
    raise exception 'INVALID_QUESTION_COUNT' using errcode = '22023';
  end if;
  if custom_count > 5 then raise exception 'CUSTOM_QUESTION_LIMIT' using errcode = '22023'; end if;
  if categories_count = 0 then raise exception 'CATEGORY_REQUIRED' using errcode = '22023'; end if;

  loop
    code_value := private.random_room_code();
    exit when not exists (select 1 from public.rooms where public_code = code_value);
  end loop;

  insert into public.rooms(
    public_code, title, test_type_id, creator_name, partner_name, play_mode,
    question_count, selected_category_ids, question_time_limit_seconds, realtime_topic,
    created_by_auth_user_id, password_hash, expires_at
  ) values (
    code_value,
    trim(payload->>'creatorName') || ' & ' || trim(payload->>'partnerName'),
    (payload->>'testTypeId')::bigint,
    trim(payload->>'creatorName'),
    trim(payload->>'partnerName'),
    (payload->>'playMode')::public.play_mode,
    (payload->>'questionCount')::smallint,
    array(select (value #>> '{}')::bigint from jsonb_array_elements(payload->'categoryIds')),
    nullif(payload->>'questionTimeLimitSeconds', '')::smallint,
    encode(extensions.gen_random_bytes(32), 'hex'),
    user_id,
    case when nullif(payload->>'password', '') is null then null
      else extensions.crypt(payload->>'password', extensions.gen_salt('bf', 12)) end,
    now() + make_interval(days => (payload->>'retentionDays')::integer)
  ) returning * into new_room;

  insert into public.participants(room_id, display_name, role)
  values (new_room.id, trim(payload->>'creatorName'), 'creator')
  returning * into creator;
  insert into public.participant_sessions(participant_id, auth_user_id)
  values (creator.id, user_id);

  for custom_text in select value from jsonb_array_elements(coalesce(payload->'customQuestions', '[]'::jsonb))
  loop
    perform private.assert_safe_custom_question(custom_text #>> '{}');
    insert into public.room_custom_questions(room_id, created_by_participant_id, question_text)
    values (new_room.id, creator.id, trim(custom_text #>> '{}'));
  end loop;

  recovery := private.make_recovery_secret(creator.id, new_room.expires_at);
  origin_value := coalesce(
    (current_setting('request.headers', true)::jsonb ->> 'origin'),
    ''
  );
  return jsonb_build_object(
    'code', new_room.public_code,
    'roomId', new_room.id,
    'recoveryCode', recovery,
    'inviteUrl', origin_value || '/join?code=' || new_room.public_code
  );
end;
$$;

create or replace function public.join_room(
  room_code text,
  display_name text,
  room_password text default null,
  captcha_token text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  user_id uuid := (select auth.uid());
  target_room public.rooms%rowtype;
  partner public.participants%rowtype;
  creator public.participants%rowtype;
  recovery text;
  custom_count integer;
  candidate record;
  pos integer := 0;
begin
  if user_id is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  perform private.rate_limit('join:' || upper(trim(room_code)), 12, 900);
  if captcha_token is not null and char_length(captcha_token) > 4096 then
    raise exception 'INVALID_CAPTCHA_TOKEN' using errcode = '22023';
  end if;
  select * into target_room from public.rooms
    where public_code = upper(trim(room_code))
    for update;
  if not found or target_room.deleted_at is not null or target_room.expires_at <= now() then
    raise exception 'ROOM_NOT_FOUND' using errcode = 'P0002';
  end if;
  if target_room.status <> 'waiting_for_partner' then
    raise exception 'ROOM_NOT_JOINABLE' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.participants where room_id = target_room.id having count(*) >= 2) then
    raise exception 'ROOM_FULL' using errcode = 'P0001';
  end if;
  if target_room.password_hash is not null
    and (room_password is null or extensions.crypt(room_password, target_room.password_hash) <> target_room.password_hash) then
    raise exception 'INVALID_ROOM_PASSWORD' using errcode = '42501';
  end if;
  if char_length(trim(display_name)) not between 2 and 40 then
    raise exception 'INVALID_DISPLAY_NAME' using errcode = '22023';
  end if;
  if exists (select 1 from public.participant_sessions where auth_user_id = user_id and revoked_at is null) then
    raise exception 'SESSION_ALREADY_BOUND' using errcode = '23505';
  end if;

  insert into public.participants(room_id, display_name, role)
  values (target_room.id, trim(display_name), 'partner')
  returning * into partner;
  insert into public.participant_sessions(participant_id, auth_user_id)
  values (partner.id, user_id);
  select * into creator from public.participants where room_id = target_room.id and role = 'creator';
  recovery := private.make_recovery_secret(partner.id, target_room.expires_at);

  select count(*) into custom_count from public.room_custom_questions where room_id = target_room.id;
  for candidate in
    with source_questions as (
      select q.id, q.question_text, q.question_type, q.options_json, q.weight, c.name category_name,
        row_number() over (order by extensions.gen_random_bytes(8)) row_number
      from public.questions q
      join public.categories c on c.id = q.category_id
      where q.is_active
        and q.test_type_id = target_room.test_type_id
        and q.category_id = any(target_room.selected_category_ids)
    )
    select id, null::uuid custom_id, question_text, question_type, options_json, weight, category_name, row_number
    from source_questions
    where row_number <= target_room.question_count - custom_count
    union all
    select null::bigint, rcq.id, rcq.question_text, 'custom'::public.question_type,
      '[]'::jsonb, 1::numeric, 'Size Ã¶zel', target_room.question_count - custom_count + row_number() over (order by rcq.created_at)
    from public.room_custom_questions rcq where rcq.room_id = target_room.id
    order by row_number
  loop
    pos := pos + 1;
    insert into public.room_questions(
      room_id, question_id, custom_question_id, position,
      target_participant_id, guesser_participant_id,
      question_text_snapshot, question_type_snapshot, options_snapshot,
      weight_snapshot, category_name_snapshot
    ) values (
      target_room.id, candidate.id, candidate.custom_id, pos,
      case when pos % 2 = 1 then creator.id else partner.id end,
      case when pos % 2 = 1 then partner.id else creator.id end,
      candidate.question_text, candidate.question_type, candidate.options_json,
      candidate.weight, candidate.category_name
    );
  end loop;
  if pos <> target_room.question_count then
    raise exception 'INSUFFICIENT_QUESTIONS' using errcode = 'P0001';
  end if;
  update public.rooms set status = 'waiting_for_ready' where id = target_room.id;
  perform private.broadcast_room(target_room.id, 'PARTNER_JOINED', target_room.round_version);
  return jsonb_build_object('code', target_room.public_code, 'recoveryCode', recovery);
end;
$$;

create or replace function public.rejoin_room(room_code text, recovery_code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  user_id uuid := (select auth.uid());
  target_room public.rooms%rowtype;
  secret_row public.participant_rejoin_secrets%rowtype;
begin
  if user_id is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  perform private.rate_limit('rejoin:' || upper(trim(room_code)), 8, 900);
  select * into target_room from public.rooms
    where public_code = upper(trim(room_code)) and deleted_at is null and expires_at > now()
    for update;
  if not found then raise exception 'ROOM_NOT_FOUND' using errcode = 'P0002'; end if;
  select prs.* into secret_row
  from public.participant_rejoin_secrets prs
  join public.participants p on p.id = prs.participant_id
  where p.room_id = target_room.id
    and prs.revoked_at is null
    and prs.expires_at > now()
    and extensions.crypt(recovery_code, prs.secret_hash) = prs.secret_hash
  for update of prs;
  if not found then raise exception 'INVALID_RECOVERY_CODE' using errcode = '42501'; end if;
  update public.participant_sessions set revoked_at = now()
    where participant_id = secret_row.participant_id and revoked_at is null;
  insert into public.participant_sessions(participant_id, auth_user_id)
  values (secret_row.participant_id, user_id);
  update public.participant_rejoin_secrets set used_at = now() where id = secret_row.id;
  return jsonb_build_object('code', target_room.public_code);
end;
$$;

create or replace function public.get_lobby_state(room_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  target_room public.rooms%rowtype;
  participant_id uuid;
begin
  select * into target_room from public.rooms
    where public_code = upper(trim(room_code)) and deleted_at is null and expires_at > now();
  if not found then raise exception 'ROOM_NOT_FOUND' using errcode = 'P0002'; end if;
  participant_id := private.current_participant_id(target_room.id);
  if participant_id is null then raise exception 'ROOM_ACCESS_DENIED' using errcode = '42501'; end if;
  return jsonb_build_object(
    'roomId', target_room.id,
    'code', target_room.public_code,
    'title', target_room.title,
    'playMode', target_room.play_mode,
    'status', target_room.status,
    'isHost', exists (
      select 1 from public.participants p
      where p.id = participant_id and p.role = 'creator'
    ),
    'participantId', participant_id,
    'realtimeTopic', target_room.realtime_topic,
    'participants', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id, 'displayName', p.display_name, 'role', p.role,
        'isReady', p.is_ready,
        'connectionStatus', case
          when p.last_seen_at > now() - interval '30 seconds' then 'connected'
          when p.last_seen_at > now() - interval '2 minutes' then 'reconnecting'
          else 'offline' end
      ) order by p.role)
      from public.participants p where p.room_id = target_room.id
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.get_room_state(room_code text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$ select public.get_lobby_state(room_code) $$;

create or replace function private.set_ready_state(room_code text, ready_value boolean)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  target_room public.rooms%rowtype;
  participant_id uuid;
begin
  select * into target_room from public.rooms where public_code = upper(trim(room_code)) for update;
  if not found or target_room.status not in ('waiting_for_partner', 'waiting_for_ready') then
    raise exception 'INVALID_ROOM_STATE' using errcode = 'P0001';
  end if;
  participant_id := private.current_participant_id(target_room.id);
  if participant_id is null then raise exception 'ROOM_ACCESS_DENIED' using errcode = '42501'; end if;
  update public.participants
    set is_ready = ready_value, ready_at = case when ready_value then now() else null end
    where id = participant_id;
  perform private.broadcast_room(target_room.id, 'READY_CHANGED', target_room.round_version);
  return public.get_lobby_state(target_room.public_code);
end;
$$;

create or replace function public.set_ready(room_code text)
returns jsonb language sql volatile security definer set search_path = ''
as $$ select private.set_ready_state(room_code, true) $$;

create or replace function public.set_unready(room_code text)
returns jsonb language sql volatile security definer set search_path = ''
as $$ select private.set_ready_state(room_code, false) $$;

create or replace function public.start_game(room_code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  target_room public.rooms%rowtype;
  participant_id uuid;
begin
  select * into target_room from public.rooms where public_code = upper(trim(room_code)) for update;
  if not found then raise exception 'ROOM_NOT_FOUND' using errcode = 'P0002'; end if;
  participant_id := private.current_participant_id(target_room.id);
  if participant_id is null or not exists (
    select 1 from public.participants p where p.id = participant_id and p.role = 'creator'
  ) then
    raise exception 'HOST_ONLY' using errcode = '42501';
  end if;
  if target_room.status <> 'waiting_for_ready'
    or (select count(*) from public.participants where room_id = target_room.id) <> 2
    or exists (select 1 from public.participants where room_id = target_room.id and not is_ready) then
    raise exception 'BOTH_PLAYERS_MUST_BE_READY' using errcode = 'P0001';
  end if;
  update public.rooms set
    status = 'in_progress',
    current_question_position = 1,
    round_status = 'waiting_for_answers',
    round_version = round_version + 1,
    started_at = now(),
    question_started_at = now(),
    question_deadline_at = case when question_time_limit_seconds is null then null
      else now() + make_interval(secs => question_time_limit_seconds) end
    where id = target_room.id
    returning * into target_room;
  perform private.broadcast_room(target_room.id, 'GAME_STARTED', target_room.round_version);
  return jsonb_build_object('status', target_room.status, 'roundVersion', target_room.round_version);
end;
$$;

create or replace function public.heartbeat_room(room_code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  target_room_id uuid;
  v_participant_id uuid;
begin
  select id into target_room_id from public.rooms
    where public_code = upper(trim(room_code)) and deleted_at is null and expires_at > now();
  v_participant_id := private.current_participant_id(target_room_id);
  if v_participant_id is null then raise exception 'ROOM_ACCESS_DENIED' using errcode = '42501'; end if;
  update public.participants set last_seen_at = now() where id = v_participant_id;
  update public.participant_sessions set last_seen_at = now()
    where participant_id = v_participant_id and revoked_at is null;
  return '{"ok":true}'::jsonb;
end;
$$;

create or replace function public.pause_room(room_code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare target_room public.rooms%rowtype; participant_id uuid;
begin
  select * into target_room from public.rooms where public_code = upper(trim(room_code)) for update;
  participant_id := private.current_participant_id(target_room.id);
  if participant_id is null
    or not exists (select 1 from public.participants p where p.id = participant_id and p.role = 'creator')
    or target_room.status <> 'in_progress' then
    raise exception 'INVALID_PAUSE' using errcode = '42501';
  end if;
  update public.rooms set status = 'paused', paused_at = now() where id = target_room.id returning * into target_room;
  perform private.broadcast_room(target_room.id, 'ROOM_PAUSED', target_room.round_version);
  return jsonb_build_object('status', target_room.status);
end;
$$;

create or replace function public.resume_room(room_code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare target_room public.rooms%rowtype; participant_id uuid;
begin
  select * into target_room from public.rooms where public_code = upper(trim(room_code)) for update;
  participant_id := private.current_participant_id(target_room.id);
  if participant_id is null
    or not exists (select 1 from public.participants p where p.id = participant_id and p.role = 'creator')
    or target_room.status <> 'paused' then
    raise exception 'INVALID_RESUME' using errcode = '42501';
  end if;
  update public.rooms set status = 'in_progress', paused_at = null where id = target_room.id returning * into target_room;
  perform private.broadcast_room(target_room.id, 'ROOM_RESUMED', target_room.round_version);
  return jsonb_build_object('status', target_room.status);
end;
$$;

create or replace function public.leave_room(room_code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare target_room_id uuid; v_participant_id uuid;
begin
  select id into target_room_id from public.rooms where public_code = upper(trim(room_code));
  v_participant_id := private.current_participant_id(target_room_id);
  if v_participant_id is null then raise exception 'ROOM_ACCESS_DENIED' using errcode = '42501'; end if;
  update public.participant_sessions set revoked_at = now()
    where participant_id = v_participant_id and auth_user_id = (select auth.uid()) and revoked_at is null;
  return '{"left":true}'::jsonb;
end;
$$;

create or replace function public.delete_room(room_code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare target_room public.rooms%rowtype; participant_id uuid;
begin
  select * into target_room from public.rooms where public_code = upper(trim(room_code)) for update;
  if not found then raise exception 'ROOM_NOT_FOUND' using errcode = 'P0002'; end if;
  participant_id := private.current_participant_id(target_room.id);
  if participant_id is null
    or not exists (select 1 from public.participants p where p.id = participant_id and p.role = 'creator') then
    raise exception 'HOST_ONLY' using errcode = '42501';
  end if;
  perform private.broadcast_room(target_room.id, 'ROOM_DELETED', target_room.round_version);
  update public.rooms set status = 'deleted', deleted_at = now() where id = target_room.id;
  delete from public.rooms where id = target_room.id;
  return '{"deleted":true}'::jsonb;
end;
$$;

revoke all on function public.get_catalog() from public, anon;
revoke all on function public.create_room(jsonb) from public, anon;
revoke all on function public.join_room(text,text,text,text) from public, anon;
revoke all on function public.rejoin_room(text,text) from public, anon;
revoke all on function public.get_lobby_state(text) from public, anon;
revoke all on function public.get_room_state(text) from public, anon;
revoke all on function public.set_ready(text) from public, anon;
revoke all on function public.set_unready(text) from public, anon;
revoke all on function public.start_game(text) from public, anon;
revoke all on function public.heartbeat_room(text) from public, anon;
revoke all on function public.pause_room(text) from public, anon;
revoke all on function public.resume_room(text) from public, anon;
revoke all on function public.leave_room(text) from public, anon;
revoke all on function public.delete_room(text) from public, anon;
grant execute on function public.get_catalog() to authenticated;
grant execute on function public.create_room(jsonb) to authenticated;
grant execute on function public.join_room(text,text,text,text) to authenticated;
grant execute on function public.rejoin_room(text,text) to authenticated;
grant execute on function public.get_lobby_state(text) to authenticated;
grant execute on function public.get_room_state(text) to authenticated;
grant execute on function public.set_ready(text) to authenticated;
grant execute on function public.set_unready(text) to authenticated;
grant execute on function public.start_game(text) to authenticated;
grant execute on function public.heartbeat_room(text) to authenticated;
grant execute on function public.pause_room(text) to authenticated;
grant execute on function public.resume_room(text) to authenticated;
grant execute on function public.leave_room(text) to authenticated;
grant execute on function public.delete_room(text) to authenticated;

;
