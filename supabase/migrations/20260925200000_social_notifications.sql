alter table public.noir_follows
  add column if not exists status text not null default 'accepted';

alter table public.noir_follows
  drop constraint if exists noir_follows_status_check,
  add constraint noir_follows_status_check check (status in ('pending', 'accepted'));

create index if not exists noir_follows_follower_status_idx
  on public.noir_follows (follower_id, status);

create index if not exists noir_notifications_user_created_idx
  on public.noir_notifications (user_id, created_at desc);

create index if not exists noir_notifications_user_unread_idx
  on public.noir_notifications (user_id, created_at desc)
  where is_read = false;

do $$
declare
  constraint_row record;
begin
  for constraint_row in
    select conname
    from pg_constraint
    where conrelid = 'public.noir_notifications'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%type%'
  loop
    execute format(
      'alter table public.noir_notifications drop constraint %I',
      constraint_row.conname
    );
  end loop;
end;
$$;

alter table public.noir_notifications
  add constraint noir_notifications_type_check check (
    type in (
      'ppv_unlock', 'event_reminder', 'event_approval', 'chat_message',
      'forum_reply', 'kyc', 'system', 'like', 'comment', 'follow', 'follow_request'
    )
  );

create or replace function public.noir_set_follow_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_is_private boolean;
begin
  if new.follower_id = new.following_id then
    raise exception 'Members cannot follow themselves';
  end if;

  select coalesce(profile.is_private, false)
  into target_is_private
  from public.noir_profiles profile
  where profile.id = new.following_id;

  new.status := case when target_is_private then 'pending' else 'accepted' end;
  return new;
end;
$$;

drop trigger if exists noir_follows_set_status on public.noir_follows;
create trigger noir_follows_set_status
before insert or update of following_id on public.noir_follows
for each row execute function public.noir_set_follow_status();

create or replace function public.noir_emit_social_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient_id uuid;
  actor_id uuid;
  actor_name text;
  notification_type text;
  notification_title text;
  notification_content text;
begin
  if tg_table_name = 'noir_post_likes' then
    actor_id := new.user_id;
  elsif tg_table_name = 'noir_post_comments' then
    actor_id := new.user_id;
  elsif tg_table_name = 'noir_follows' then
    actor_id := new.follower_id;
  end if;

  select coalesce(nullif(profile.name, ''), nullif(profile.username, ''), 'Bir üye')
  into actor_name
  from public.noir_profiles profile
  where profile.id = actor_id;

  actor_name := coalesce(actor_name, 'Bir üye');

  if tg_table_name = 'noir_post_likes' then
    select post.author_id into recipient_id
    from public.noir_posts post
    where post.id = new.post_id;
    notification_type := 'like';
    notification_title := 'Yeni beğeni';
    notification_content := actor_name || ' gönderini beğendi.';
  elsif tg_table_name = 'noir_post_comments' then
    select post.author_id into recipient_id
    from public.noir_posts post
    where post.id = new.post_id;
    notification_type := 'comment';
    notification_title := 'Yeni yorum';
    notification_content := actor_name || ' gönderine yorum yaptı: ' || left(new.content, 100);
  elsif tg_table_name = 'noir_follows' then
    recipient_id := new.following_id;
    notification_type := case when new.status = 'pending' then 'follow_request' else 'follow' end;
    notification_title := case when new.status = 'pending' then 'Yeni takip isteği' else 'Yeni takipçi' end;
    notification_content := case
      when new.status = 'pending' then actor_name || ' seni takip etmek istiyor.'
      else actor_name || ' seni takip etmeye başladı.'
    end;
  end if;

  if recipient_id is not null and recipient_id <> actor_id then
    insert into public.noir_notifications (
      user_id, actor_id, type, title, content, is_read
    ) values (
      recipient_id,
      actor_id,
      notification_type,
      notification_title,
      notification_content,
      false
    );
  end if;

  return new;
end;
$$;

create or replace function public.noir_emit_message_notifications()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_name text;
begin
  select coalesce(nullif(profile.name, ''), nullif(profile.username, ''), 'Bir üye')
  into actor_name
  from public.noir_profiles profile
  where profile.id = new.sender_id;

  insert into public.noir_notifications (
    user_id, actor_id, type, title, content, is_read
  )
  select
    participant.user_id,
    new.sender_id,
    'chat_message',
    'Yeni mesaj',
    coalesce(actor_name, 'Bir üye') || ': ' || left(coalesce(new.content, 'Yeni bir medya gönderdi.'), 100),
    false
  from public.noir_conversation_participants participant
  where participant.conversation_id = new.conversation_id
    and participant.user_id <> new.sender_id;

  return new;
end;
$$;

drop trigger if exists noir_post_likes_notify on public.noir_post_likes;
create trigger noir_post_likes_notify
after insert on public.noir_post_likes
for each row execute function public.noir_emit_social_notification();

drop trigger if exists noir_post_comments_notify on public.noir_post_comments;
create trigger noir_post_comments_notify
after insert on public.noir_post_comments
for each row execute function public.noir_emit_social_notification();

drop trigger if exists noir_follows_notify on public.noir_follows;
create trigger noir_follows_notify
after insert on public.noir_follows
for each row execute function public.noir_emit_social_notification();

drop trigger if exists noir_messages_notify on public.noir_messages;
create trigger noir_messages_notify
after insert on public.noir_messages
for each row execute function public.noir_emit_message_notifications();

alter table public.noir_notifications enable row level security;

drop policy if exists "Members read own notifications" on public.noir_notifications;
create policy "Members read own notifications"
on public.noir_notifications
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Members update own notifications" on public.noir_notifications;
create policy "Members update own notifications"
on public.noir_notifications
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant select, update on public.noir_notifications to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.noir_notifications;
exception when duplicate_object then
  null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.noir_messages;
exception when duplicate_object then
  null;
end;
$$;
