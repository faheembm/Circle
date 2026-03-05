-- ============================================================
-- CIRCLE — Supabase Schema
-- Safe execution order version
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

create type group_role as enum ('admin','member');
create type message_type as enum ('group','direct');

-- ============================================================
-- PROFILES
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  is_private boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "profiles_public_read"
on profiles for select using (true);

create policy "profiles_update_own"
on profiles for update using (auth.uid() = id);

create policy "profiles_insert_own"
on profiles for insert with check (auth.uid() = id);

-- ============================================================
-- FOLLOWS
-- ============================================================

create table follows (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(follower_id,following_id)
);

alter table follows enable row level security;

create policy "follows_read"
on follows for select using (true);

create policy "follows_manage"
on follows for all using (auth.uid() = follower_id);

-- ============================================================
-- GROUPS
-- ============================================================

create table groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  avatar_url text,
  is_official boolean default false,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table groups enable row level security;

create policy "groups_read"
on groups for select using (true);

create policy "groups_create"
on groups for insert with check (auth.uid() is not null);

-- ============================================================
-- GROUP MEMBERS
-- ============================================================

create table group_members (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role group_role default 'member',
  joined_at timestamptz default now(),
  unique(group_id,user_id)
);

alter table group_members enable row level security;

create policy "members_read"
on group_members for select using (true);

create policy "members_join"
on group_members for insert with check (auth.uid() = user_id);

create policy "members_leave"
on group_members for delete using (auth.uid() = user_id);

-- ============================================================
-- GROUP ADMIN UPDATE POLICY
-- ============================================================

create policy "group_admin_update"
on groups for update using (
  exists (
    select 1 from group_members
    where group_id = groups.id
    and user_id = auth.uid()
    and role = 'admin'
  )
);

-- ============================================================
-- MESSAGES
-- ============================================================

create table messages (
  id uuid primary key default uuid_generate_v4(),
  type message_type not null,
  group_id uuid references groups(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  receiver_id uuid references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  is_deleted boolean default false,

  constraint check_target check (
    (type='group' and group_id is not null and receiver_id is null) OR
    (type='direct' and receiver_id is not null and group_id is null)
  )
);

alter table messages enable row level security;

create policy "messages_read"
on messages for select using (
  (type='group' AND exists(
    select 1 from group_members
    where group_members.group_id = messages.group_id
    and user_id = auth.uid()
  ))
  OR
  (type='direct' AND (sender_id = auth.uid() OR receiver_id = auth.uid()))
);

create policy "messages_insert"
on messages for insert with check (auth.uid() = sender_id);

create policy "messages_update"
on messages for update using (auth.uid() = sender_id);

-- ============================================================
-- CIRCLES (SOCIAL)
-- ============================================================

create table circles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  avatar_url text,
  is_private boolean default true,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table circles enable row level security;

create policy "circles_read"
on circles for select using (is_private = false);

create policy "circles_create"
on circles for insert with check (auth.uid() = created_by);

-- ============================================================
-- CIRCLE MEMBERS
-- ============================================================

create table circle_members (
  id uuid primary key default uuid_generate_v4(),
  circle_id uuid not null references circles(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role group_role default 'member',
  joined_at timestamptz default now(),
  unique(circle_id, user_id)
);

alter table circle_members enable row level security;

create policy "circle_members_read"
on circle_members for select using (
  exists (
    select 1 from circle_members cm
    where cm.circle_id = circle_members.circle_id
    and cm.user_id = auth.uid()
  )
  or exists (
    select 1 from circles c
    where c.id = circle_members.circle_id
    and c.is_private = false
  )
);

create policy "circle_members_join_public"
on circle_members for insert with check (
  auth.uid() = user_id and exists (
    select 1 from circles c
    where c.id = circle_members.circle_id
    and c.is_private = false
  )
);

create policy "circle_members_leave"
on circle_members for delete using (auth.uid() = user_id);

create policy "circles_member_read"
on circles for select using (
  exists (
    select 1 from circle_members
    where circle_members.circle_id = circles.id
    and circle_members.user_id = auth.uid()
  )
);

-- ============================================================
-- FOLLOW REQUESTS
-- ============================================================

create table follow_requests (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid not null references profiles(id) on delete cascade,
  target_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(requester_id, target_id)
);

alter table follow_requests enable row level security;

create policy "follow_requests_read"
on follow_requests for select using (
  auth.uid() = requester_id or auth.uid() = target_id
);

create policy "follow_requests_create"
on follow_requests for insert with check (auth.uid() = requester_id);

create policy "follow_requests_update_target"
on follow_requests for update using (auth.uid() = target_id);

-- ============================================================
-- CIRCLE INVITES
-- ============================================================

create table circle_invites (
  id uuid primary key default uuid_generate_v4(),
  circle_id uuid not null references circles(id) on delete cascade,
  inviter_id uuid not null references profiles(id) on delete cascade,
  invitee_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(circle_id, invitee_id)
);

alter table circle_invites enable row level security;

create policy "circle_invites_read"
on circle_invites for select using (
  auth.uid() = inviter_id or auth.uid() = invitee_id
);

create policy "circle_invites_create"
on circle_invites for insert with check (
  auth.uid() = inviter_id and exists (
    select 1 from circle_members
    where circle_members.circle_id = circle_invites.circle_id
    and circle_members.user_id = auth.uid()
    and circle_members.role = 'admin'
  )
);

create policy "circle_invites_update"
on circle_invites for update using (auth.uid() = invitee_id);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_messages_group on messages(group_id,created_at desc);
create index idx_messages_dm on messages(sender_id,receiver_id,created_at desc);
create index idx_followers on follows(follower_id);
create index idx_following on follows(following_id);
create index idx_group_members_group on group_members(group_id);
create index idx_group_members_user on group_members(user_id);
create index idx_circles_private on circles(is_private);
create index idx_circle_members_circle on circle_members(circle_id);
create index idx_circle_members_user on circle_members(user_id);
create index idx_follow_requests_target on follow_requests(target_id,status);
create index idx_circle_invites_invitee on circle_invites(invitee_id,status);

-- ============================================================
-- REALTIME
-- ============================================================

alter publication supabase_realtime add table messages;

-- ============================================================
-- FUNCTIONS
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated
before update on profiles
for each row execute function update_updated_at();

create trigger groups_updated
before update on groups
for each row execute function update_updated_at();

create trigger circles_updated
before update on circles
for each row execute function update_updated_at();

create trigger messages_updated
before update on messages
for each row execute function update_updated_at();

create trigger follow_requests_updated
before update on follow_requests
for each row execute function update_updated_at();

create trigger circle_invites_updated
before update on circle_invites
for each row execute function update_updated_at();

-- ============================================================
-- AUTO PROFILE CREATION
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles(id,username,display_name)
  values(
    new.id,
    split_part(new.email,'@',1),
    split_part(new.email,'@',1)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger create_profile_on_signup
after insert on auth.users
for each row execute function handle_new_user();

-- ============================================================
-- OFFICIAL GROUP
-- ============================================================

insert into groups(name,description,is_official)
values('General','Welcome to Circle community',true);
