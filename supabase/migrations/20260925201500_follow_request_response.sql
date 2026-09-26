create or replace function public.respond_to_follow_request(
  p_follower_id uuid,
  p_accept boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user_id uuid := auth.uid();
  requester_name text;
begin
  if target_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_accept then
    update public.noir_follows
    set status = 'accepted'
    where follower_id = p_follower_id
      and following_id = target_user_id
      and status = 'pending';
  else
    delete from public.noir_follows
    where follower_id = p_follower_id
      and following_id = target_user_id
      and status = 'pending';
  end if;

  if not found then
    return false;
  end if;

  if p_accept then
    select coalesce(nullif(profile.name, ''), nullif(profile.username, ''), 'Bir üye')
    into requester_name
    from public.noir_profiles profile
    where profile.id = target_user_id;

    insert into public.noir_notifications (
      user_id, actor_id, type, title, content, is_read
    ) values (
      p_follower_id,
      target_user_id,
      'follow',
      'Takip isteği kabul edildi',
      coalesce(requester_name, 'Bir üye') || ' takip isteğini kabul etti.',
      false
    );
  end if;

  return true;
end;
$$;

revoke all on function public.respond_to_follow_request(uuid, boolean) from public, anon;
grant execute on function public.respond_to_follow_request(uuid, boolean) to authenticated;
