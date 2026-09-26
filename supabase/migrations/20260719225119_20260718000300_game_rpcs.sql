create or replace function private.normalize_tr(value text)
returns text
language sql
immutable
security invoker
set search_path = ''
as $$
  select trim(regexp_replace(
    translate(lower(coalesce(value, '')), 'Ã§ÄŸÄ±Ã¶ÅŸÃ¼Ã¢Ã®Ã»', 'cgiosuaiu'),
    '[^[:alnum:][:space:]]', ' ', 'g'
  ))
$$;

create or replace function private.canonical_answer(value text)
returns text
language plpgsql
immutable
security invoker
set search_path = ''
as $$
declare normalized text := regexp_replace(private.normalize_tr(value), '\s+', ' ', 'g');
begin
  return case
    when normalized in ('film', 'sinema', 'film izlemek') then 'film'
    when normalized in ('sarilmak', 'sarilma') then 'sarilmak'
    when normalized in ('konusmak', 'sohbet etmek') then 'konusmak'
    when normalized in ('gezmek', 'disari cikmak', 'gezmeye cikmak') then 'gezmek'
    when normalized in ('yalniz kalmak', 'kafa dinlemek', 'tek basina kalmak') then 'yalniz kalmak'
    when normalized in ('evde kalmak', 'evde vakit gecirmek') then 'evde kalmak'
    else normalized
  end;
end;
$$;

create or replace function private.answer_score(
  kind public.question_type,
  self_text text,
  self_json jsonb,
  guess_text text,
  guess_json jsonb
)
returns numeric
language plpgsql
immutable
security invoker
set search_path = ''
as $$
declare
  left_value text := coalesce(self_json->>'value', self_text, '');
  right_value text := coalesce(guess_json->>'value', guess_text, '');
  normalized_left text;
  normalized_right text;
  max_length integer;
  distance_score numeric;
  word_score numeric;
  difference integer;
begin
  if kind = 'scale' then
    difference := abs(left_value::integer - right_value::integer);
    return case difference when 0 then 1 when 1 then .75 when 2 then .4 else 0 end;
  end if;
  if kind in ('single_choice', 'boolean', 'date', 'special_day') then
    return case when private.canonical_answer(left_value) = private.canonical_answer(right_value) then 1 else 0 end;
  end if;
  if kind = 'multi_choice' then
    with left_tokens as (
      select unnest(string_to_array(private.canonical_answer(left_value), '|')) token
    ), right_tokens as (
      select unnest(string_to_array(private.canonical_answer(right_value), '|')) token
    ), stats as (
      select
        (select count(*) from (select token from left_tokens intersect select token from right_tokens) i)::numeric intersection_count,
        (select count(*) from (select token from left_tokens union select token from right_tokens) u)::numeric union_count
    )
    select case when union_count = 0 then 1 else intersection_count / union_count end into word_score from stats;
    return case when word_score >= .99 then 1 when word_score >= .5 then .6 else 0 end;
  end if;

  normalized_left := private.canonical_answer(left_value);
  normalized_right := private.canonical_answer(right_value);
  if normalized_left = normalized_right then return 1; end if;
  max_length := greatest(char_length(normalized_left), char_length(normalized_right));
  if max_length = 0 then return 1; end if;
  distance_score := 1 - (
    extensions.levenshtein(
      substring(normalized_left from 1 for 255),
      substring(normalized_right from 1 for 255)
    )::numeric / greatest(1, least(max_length, 255))
  );
  with left_words as (
    select distinct unnest(regexp_split_to_array(normalized_left, '\s+')) word
  ), right_words as (
    select distinct unnest(regexp_split_to_array(normalized_right, '\s+')) word
  ), stats as (
    select
      (select count(*) from (select word from left_words intersect select word from right_words) i)::numeric intersection_count,
      (select count(*) from (select word from left_words union select word from right_words) u)::numeric union_count
  )
  select case when union_count = 0 then 1 else intersection_count / union_count end into word_score from stats;
  return case
    when greatest(distance_score, word_score) >= .82 then 1
    when greatest(distance_score, word_score) >= .55 then .6
    else 0
  end;
end;
$$;

create or replace function private.recalculate_result(target_room_id uuid)
returns public.game_results
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  item record;
  item_score numeric;
  effective_match public.match_type;
  weighted_score numeric := 0;
  total_weight numeric := 0;
  matched integer := 0;
  partial integer := 0;
  different integer := 0;
  comparisons jsonb := '[]'::jsonb;
  participant_stats jsonb;
  category_stats jsonb;
  result_row public.game_results%rowtype;
begin
  for item in
    select rq.*, self_answer.answer_text self_text, self_answer.answer_json self_json,
      guess_answer.answer_text guess_text, guess_answer.answer_json guess_json,
      target.display_name target_name, guesser.display_name guesser_name,
      override.override_type
    from public.room_questions rq
    join public.answers self_answer on self_answer.room_question_id = rq.id and self_answer.answer_role = 'self'
    join public.answers guess_answer on guess_answer.room_question_id = rq.id and guess_answer.answer_role = 'guess'
    join public.participants target on target.id = rq.target_participant_id
    join public.participants guesser on guesser.id = rq.guesser_participant_id
    left join public.result_overrides override on override.room_question_id = rq.id
    where rq.room_id = target_room_id
    order by rq.position
  loop
    item_score := private.answer_score(
      item.question_type_snapshot, item.self_text, item.self_json, item.guess_text, item.guess_json
    );
    if item.override_type = 'match' then item_score := 1; end if;
    if item.override_type = 'different' then item_score := 0; end if;
    effective_match := case when item_score = 1 then 'match'::public.match_type
      when item_score > 0 then 'partial'::public.match_type else 'different'::public.match_type end;
    matched := matched + case when effective_match = 'match' then 1 else 0 end;
    partial := partial + case when effective_match = 'partial' then 1 else 0 end;
    different := different + case when effective_match = 'different' then 1 else 0 end;
    weighted_score := weighted_score + item_score * item.weight_snapshot;
    total_weight := total_weight + item.weight_snapshot;
    comparisons := comparisons || jsonb_build_array(jsonb_build_object(
      'roomQuestionId', item.id,
      'position', item.position,
      'prompt', item.question_text_snapshot,
      'category', item.category_name_snapshot,
      'targetName', item.target_name,
      'guesserName', item.guesser_name,
      'selfAnswer', coalesce(item.self_json->>'value', item.self_text, ''),
      'guessAnswer', coalesce(item.guess_json->>'value', item.guess_text, ''),
      'score', round(item_score * 100, 2),
      'matchType', effective_match
    ));
  end loop;
  if jsonb_array_length(comparisons) = 0 then
    raise exception 'RESULT_NOT_READY' using errcode = 'P0001';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'score', score) order by name), '[]'::jsonb)
  into participant_stats
  from (
    select entry->>'guesserName' name, round(avg((entry->>'score')::numeric), 2) score
    from jsonb_array_elements(comparisons) entry group by entry->>'guesserName'
  ) stats;
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'score', score) order by name), '[]'::jsonb)
  into category_stats
  from (
    select entry->>'category' name, round(avg((entry->>'score')::numeric), 2) score
    from jsonb_array_elements(comparisons) entry group by entry->>'category'
  ) stats;

  insert into public.game_results(
    room_id, score, total_weight, matched_count, partial_count, different_count, result_json, calculated_at
  ) values (
    target_room_id,
    round(case when total_weight = 0 then 0 else weighted_score / total_weight * 100 end, 3),
    total_weight, matched, partial, different,
    jsonb_build_object('comparisons', comparisons, 'byParticipant', participant_stats, 'byCategory', category_stats),
    now()
  )
  on conflict (room_id) do update set
    score = excluded.score,
    total_weight = excluded.total_weight,
    matched_count = excluded.matched_count,
    partial_count = excluded.partial_count,
    different_count = excluded.different_count,
    result_json = excluded.result_json,
    calculated_at = excluded.calculated_at
  returning * into result_row;
  return result_row;
end;
$$;

create or replace function public.get_active_question(room_code text, requested_position integer default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  target_room public.rooms%rowtype;
  v_participant_id uuid;
  target_question public.room_questions%rowtype;
  my_answer public.answers%rowtype;
  draft_value text;
  partner_answered boolean;
  role_value public.answer_role;
  target_name text;
  selected_position integer;
  drafted_count integer;
  missing_positions integer[];
  participant_completed boolean;
begin
  select * into target_room from public.rooms
    where public_code = upper(trim(room_code)) and deleted_at is null and expires_at > now();
  if not found then raise exception 'ROOM_NOT_FOUND' using errcode = 'P0002'; end if;
  if target_room.status not in ('in_progress', 'paused') then
    raise exception 'GAME_NOT_ACTIVE' using errcode = 'P0001';
  end if;
  v_participant_id := private.current_participant_id(target_room.id);
  if v_participant_id is null then raise exception 'ROOM_ACCESS_DENIED' using errcode = '42501'; end if;
  if target_room.play_mode = 'live' then
    selected_position := target_room.current_question_position;
  elsif requested_position is not null then
    selected_position := requested_position;
  else
    select coalesce(min(rq.position), 1) into selected_position
    from public.room_questions rq
    where rq.room_id = target_room.id
      and not exists (
        select 1 from public.answers a
        where a.room_question_id = rq.id and a.participant_id = v_participant_id
      );
  end if;
  if selected_position not between 1 and target_room.question_count then
    raise exception 'INVALID_QUESTION_POSITION' using errcode = '22023';
  end if;
  select * into target_question from public.room_questions
    where room_id = target_room.id and position = selected_position;
  if not found then raise exception 'QUESTION_NOT_FOUND' using errcode = 'P0002'; end if;
  role_value := case when target_question.target_participant_id = v_participant_id then 'self'::public.answer_role
    when target_question.guesser_participant_id = v_participant_id then 'guess'::public.answer_role
    else null end;
  if role_value is null then raise exception 'QUESTION_ACCESS_DENIED' using errcode = '42501'; end if;
  select * into my_answer from public.answers
    where room_question_id = target_question.id and answers.participant_id = v_participant_id;
  select ad.answer_json->>'value' into draft_value from public.answer_drafts ad
    where ad.room_question_id = target_question.id and ad.participant_id = v_participant_id;
  select exists (
    select 1 from public.answers a
    where a.room_question_id = target_question.id and a.participant_id <> v_participant_id
  ) into partner_answered;
  select display_name into target_name from public.participants where id = target_question.target_participant_id;
  select count(*)::integer into drafted_count
  from public.answer_drafts ad
  join public.room_questions rq on rq.id = ad.room_question_id
  where rq.room_id = target_room.id and ad.participant_id = v_participant_id;
  select coalesce(array_agg(rq.position order by rq.position), '{}'::integer[]) into missing_positions
  from public.room_questions rq
  where rq.room_id = target_room.id
    and not exists (
      select 1 from public.answer_drafts ad
      where ad.room_question_id = rq.id and ad.participant_id = v_participant_id
    )
    and not exists (
      select 1 from public.answers a
      where a.room_question_id = rq.id and a.participant_id = v_participant_id
    );
  select exists (
    select 1 from public.async_submissions s
    where s.room_id = target_room.id and s.participant_id = v_participant_id
  ) into participant_completed;
  return jsonb_build_object(
    'roomId', target_room.id,
    'roomQuestionId', target_question.id,
    'position', target_question.position,
    'questionCount', target_room.question_count,
    'roundVersion', target_room.round_version,
    'roundStatus', target_room.round_status,
    'prompt', target_question.question_text_snapshot,
    'questionType', target_question.question_type_snapshot,
    'options', target_question.options_snapshot,
    'role', role_value,
    'targetDisplayName', target_name,
    'myAnswerLocked', my_answer.id is not null,
    'partnerAnswered', partner_answered,
    'deadlineAt', target_room.question_deadline_at,
    'playMode', target_room.play_mode,
    'draftValue', draft_value,
    'draftedCount', drafted_count,
    'missingPositions', to_jsonb(missing_positions),
    'participantCompleted', participant_completed
  );
end;
$$;

create or replace function public.save_answer_draft(
  room_code text,
  room_question_id uuid,
  answer_text text,
  answer_json jsonb,
  client_version bigint
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare target_room public.rooms%rowtype; v_participant_id uuid;
begin
  select * into target_room from public.rooms where public_code = upper(trim(room_code)) for update;
  if not found or target_room.play_mode <> 'async' or target_room.status <> 'in_progress' then
    raise exception 'DRAFT_NOT_ALLOWED' using errcode = 'P0001';
  end if;
  v_participant_id := private.current_participant_id(target_room.id);
  if v_participant_id is null then raise exception 'ROOM_ACCESS_DENIED' using errcode = '42501'; end if;
  if not exists (
    select 1 from public.room_questions rq where rq.id = save_answer_draft.room_question_id and rq.room_id = target_room.id
      and v_participant_id in (rq.target_participant_id, rq.guesser_participant_id)
  ) then raise exception 'QUESTION_ACCESS_DENIED' using errcode = '42501'; end if;
  if exists (select 1 from public.answers a where a.room_question_id = save_answer_draft.room_question_id and a.participant_id = v_participant_id) then
    raise exception 'ANSWER_ALREADY_LOCKED' using errcode = 'P0001';
  end if;
  insert into public.answer_drafts(room_question_id, participant_id, answer_text, answer_json, client_version, updated_at)
  values (save_answer_draft.room_question_id, v_participant_id, left(answer_text, 500), coalesce(answer_json, '{}'::jsonb), save_answer_draft.client_version, now())
  on conflict on constraint answer_drafts_room_question_id_participant_id_key do update set
    answer_text = excluded.answer_text,
    answer_json = excluded.answer_json,
    client_version = excluded.client_version,
    updated_at = now()
  where public.answer_drafts.client_version <= excluded.client_version;
  return jsonb_build_object('savedAt', now());
end;
$$;

create or replace function public.lock_answer(
  room_code text,
  request_id uuid,
  answer_text text,
  answer_json jsonb,
  room_question_id uuid default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  target_room public.rooms%rowtype;
  v_participant_id uuid;
  target_question public.room_questions%rowtype;
  role_value public.answer_role;
  answer_count integer;
begin
  if exists (
    select 1 from public.answers a
    join public.participant_sessions ps on ps.participant_id = a.participant_id
    where a.request_id = lock_answer.request_id and ps.auth_user_id = (select auth.uid()) and ps.revoked_at is null
  ) then
    select r.* into target_room from public.rooms r
    join public.room_questions rq on rq.room_id = r.id
    join public.answers a on a.room_question_id = rq.id
    where a.request_id = lock_answer.request_id;
    return jsonb_build_object('roomStatus', target_room.status, 'roundVersion', target_room.round_version, 'idempotent', true);
  end if;

  select * into target_room from public.rooms where public_code = upper(trim(room_code)) for update;
  if not found then raise exception 'ROOM_NOT_FOUND' using errcode = 'P0002'; end if;
  if target_room.status <> 'in_progress' then raise exception 'GAME_NOT_ACTIVE' using errcode = 'P0001'; end if;
  if target_room.play_mode <> 'live' then raise exception 'LIVE_LOCK_ONLY' using errcode = 'P0001'; end if;
  v_participant_id := private.current_participant_id(target_room.id);
  if v_participant_id is null then raise exception 'ROOM_ACCESS_DENIED' using errcode = '42501'; end if;
  select * into target_question from public.room_questions
    where room_id = target_room.id and position = target_room.current_question_position;
  if lock_answer.room_question_id is not null and lock_answer.room_question_id <> target_question.id then
    raise exception 'INACTIVE_QUESTION' using errcode = 'P0001';
  end if;
  if not found then raise exception 'QUESTION_NOT_FOUND' using errcode = 'P0002'; end if;
  role_value := case when target_question.target_participant_id = v_participant_id then 'self'::public.answer_role
    when target_question.guesser_participant_id = v_participant_id then 'guess'::public.answer_role else null end;
  if role_value is null then raise exception 'QUESTION_ACCESS_DENIED' using errcode = '42501'; end if;
  if coalesce(char_length(answer_text), char_length(answer_json->>'value'), 0) > 500 then
    raise exception 'ANSWER_TOO_LONG' using errcode = '22001';
  end if;

  insert into public.answers(
    room_question_id, participant_id, answer_role, answer_text, answer_json,
    request_id, round_number, submitted_at, locked_at
  ) values (
    target_question.id, v_participant_id, role_value, left(answer_text, 500),
    coalesce(answer_json, '{}'::jsonb), lock_answer.request_id,
    target_room.round_version, now(), now()
  );
  delete from public.answer_drafts ad
    where ad.room_question_id = target_question.id and ad.participant_id = v_participant_id;

  select count(*) into answer_count from public.answers a where a.room_question_id = target_question.id;
  if answer_count = 1 then
    update public.rooms set round_status = 'one_answer_received' where id = target_room.id
    returning * into target_room;
    perform private.broadcast_room(target_room.id, 'ANSWER_LOCKED', target_room.round_version);
  elsif answer_count = 2 then
    if target_room.current_question_position = target_room.question_count then
      update public.rooms set
        round_status = 'both_answers_received',
        round_version = round_version + 1,
        status = 'completed',
        completed_at = now(),
        expires_at = least(expires_at, now() + interval '7 days')
        where id = target_room.id returning * into target_room;
      update public.participants set completed_at = now() where room_id = target_room.id;
      perform private.recalculate_result(target_room.id);
      perform private.broadcast_room(target_room.id, 'GAME_COMPLETED', target_room.round_version);
    else
      update public.rooms set
        round_status = 'waiting_for_answers',
        round_version = round_version + 1,
        current_question_position = current_question_position + 1,
        question_started_at = now(),
        question_deadline_at = case when question_time_limit_seconds is null then null
          else now() + make_interval(secs => question_time_limit_seconds) end
        where id = target_room.id returning * into target_room;
      perform private.broadcast_room(target_room.id, 'ROUND_ADVANCED', target_room.round_version);
    end if;
  else
    raise exception 'ROUND_ANSWER_INVARIANT' using errcode = '23514';
  end if;
  return jsonb_build_object('roomStatus', target_room.status, 'roundVersion', target_room.round_version);
end;
$$;

create or replace function public.lock_async_answers(room_code text, request_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  target_room public.rooms%rowtype;
  v_participant_id uuid;
  submission_count integer;
  missing_positions integer[];
begin
  select * into target_room
  from public.rooms
  where public_code = upper(trim(room_code))
  for update;
  if not found then raise exception 'ROOM_NOT_FOUND' using errcode = 'P0002'; end if;
  if target_room.play_mode <> 'async' or target_room.status <> 'in_progress' then
    raise exception 'ASYNC_SUBMISSION_NOT_ALLOWED' using errcode = 'P0001';
  end if;
  v_participant_id := private.current_participant_id(target_room.id);
  if v_participant_id is null then raise exception 'ROOM_ACCESS_DENIED' using errcode = '42501'; end if;

  if exists (
    select 1 from public.async_submissions s
    where s.room_id = target_room.id and s.participant_id = v_participant_id
  ) then
    return jsonb_build_object(
      'roomStatus', target_room.status,
      'roundVersion', target_room.round_version,
      'idempotent', true
    );
  end if;

  select coalesce(array_agg(rq.position order by rq.position), '{}'::integer[])
  into missing_positions
  from public.room_questions rq
  where rq.room_id = target_room.id
    and not exists (
      select 1 from public.answer_drafts ad
      where ad.room_question_id = rq.id
        and ad.participant_id = v_participant_id
        and coalesce(nullif(trim(ad.answer_text), ''), nullif(trim(ad.answer_json->>'value'), '')) is not null
    );
  if cardinality(missing_positions) > 0 then
    raise exception 'MISSING_DRAFTS:%', array_to_string(missing_positions, ',') using errcode = 'P0001';
  end if;

  insert into public.async_submissions(room_id, participant_id, request_id)
  values (target_room.id, v_participant_id, lock_async_answers.request_id);

  insert into public.answers(
    room_question_id, participant_id, answer_role, answer_text, answer_json,
    request_id, round_number, submitted_at, locked_at
  )
  select
    rq.id,
    v_participant_id,
    case
      when rq.target_participant_id = v_participant_id then 'self'::public.answer_role
      else 'guess'::public.answer_role
    end,
    left(ad.answer_text, 500),
    ad.answer_json,
    gen_random_uuid(),
    target_room.round_version,
    now(),
    now()
  from public.room_questions rq
  join public.answer_drafts ad
    on ad.room_question_id = rq.id and ad.participant_id = v_participant_id
  where rq.room_id = target_room.id;

  delete from public.answer_drafts ad
  using public.room_questions rq
  where ad.room_question_id = rq.id
    and rq.room_id = target_room.id
    and ad.participant_id = v_participant_id;
  update public.participants set completed_at = now() where id = v_participant_id;

  select count(*)::integer into submission_count
  from public.async_submissions s
  where s.room_id = target_room.id;
  if submission_count = 2 then
    update public.rooms set
      status = 'completed',
      round_status = 'both_answers_received',
      completed_at = now(),
      round_version = round_version + 1,
      expires_at = least(expires_at, now() + interval '7 days')
    where id = target_room.id
    returning * into target_room;
    perform private.recalculate_result(target_room.id);
    perform private.broadcast_room(target_room.id, 'GAME_COMPLETED', target_room.round_version);
  else
    perform private.broadcast_room(target_room.id, 'ANSWER_LOCKED', target_room.round_version);
  end if;

  return jsonb_build_object('roomStatus', target_room.status, 'roundVersion', target_room.round_version);
end;
$$;

create or replace function public.get_game_results(room_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare target_room public.rooms%rowtype; result_row public.game_results%rowtype; names jsonb;
begin
  select * into target_room from public.rooms where public_code = upper(trim(room_code)) and deleted_at is null;
  if not found then raise exception 'ROOM_NOT_FOUND' using errcode = 'P0002'; end if;
  if private.current_participant_id(target_room.id) is null then raise exception 'ROOM_ACCESS_DENIED' using errcode = '42501'; end if;
  if target_room.status <> 'completed' then raise exception 'RESULT_NOT_READY' using errcode = 'P0001'; end if;
  select * into result_row from public.game_results where room_id = target_room.id;
  select jsonb_agg(display_name order by role) into names from public.participants where room_id = target_room.id;
  return jsonb_build_object(
    'roomId', target_room.id, 'code', target_room.public_code, 'playerNames', names,
    'score', result_row.score, 'matchedCount', result_row.matched_count,
    'partialCount', result_row.partial_count, 'differentCount', result_row.different_count,
    'calculatedAt', result_row.calculated_at,
    'comparisons', result_row.result_json->'comparisons',
    'byParticipant', result_row.result_json->'byParticipant',
    'byCategory', result_row.result_json->'byCategory'
  );
end;
$$;

create or replace function public.override_result(
  room_code text,
  room_question_id uuid,
  override_type text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare target_room public.rooms%rowtype; v_participant_id uuid;
begin
  select * into target_room from public.rooms where public_code = upper(trim(room_code)) for update;
  v_participant_id := private.current_participant_id(target_room.id);
  if v_participant_id is null or target_room.status <> 'completed' then
    raise exception 'OVERRIDE_NOT_ALLOWED' using errcode = '42501';
  end if;
  if override_result.override_type not in ('match', 'different') then raise exception 'INVALID_OVERRIDE' using errcode = '22023'; end if;
  if not exists (select 1 from public.room_questions where id = override_result.room_question_id and room_id = target_room.id) then
    raise exception 'QUESTION_NOT_FOUND' using errcode = 'P0002';
  end if;
  insert into public.result_overrides(room_id, room_question_id, override_type, created_by_participant_id)
  values (target_room.id, override_result.room_question_id, override_result.override_type::public.match_type, v_participant_id)
  on conflict on constraint result_overrides_room_id_room_question_id_key do update set
    override_type = excluded.override_type,
    created_by_participant_id = excluded.created_by_participant_id,
    created_at = now();
  perform private.recalculate_result(target_room.id);
  return public.get_game_results(target_room.public_code);
end;
$$;

revoke all on function public.get_active_question(text,integer) from public, anon;
revoke all on function public.save_answer_draft(text,uuid,text,jsonb,bigint) from public, anon;
revoke all on function public.lock_answer(text,uuid,text,jsonb,uuid) from public, anon;
revoke all on function public.lock_async_answers(text,uuid) from public, anon;
revoke all on function public.get_game_results(text) from public, anon;
revoke all on function public.override_result(text,uuid,text) from public, anon;
grant execute on function public.get_active_question(text,integer) to authenticated;
grant execute on function public.save_answer_draft(text,uuid,text,jsonb,bigint) to authenticated;
grant execute on function public.lock_answer(text,uuid,text,jsonb,uuid) to authenticated;
grant execute on function public.lock_async_answers(text,uuid) to authenticated;
grant execute on function public.get_game_results(text) to authenticated;
grant execute on function public.override_result(text,uuid,text) to authenticated;

;
