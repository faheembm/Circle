-- ============================================================
-- RELAY CHAT — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique not null,
  display_name text,
  avatar_url   text,
  bio          text,
  is_private   boolean default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table profiles enable row level security;

create policy "Profiles are publicly readable"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- ============================================================
-- FOLLOWS
-- ============================================================
create table follows (
  id          uuid primary key default uuid_generate_v4(),
  follower_id uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(follower_id, following_id)
);

alter table follows enable row level security;

create policy "Follows are publicly readable"
  on follows for select using (true);

create policy "Users can manage own follows"
  on follows for all using (auth.uid() = follower_id);

-- ============================================================
-- GROUPS
-- ============================================================
create table groups (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  avatar_url  text,
  is_official boolean default false,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table groups enable row level security;

create policy "Groups are publicly readable"
  on groups for select using (true);

create policy "Authenticated users can create groups"
  on groups for insert with check (auth.uid() is not null);

create policy "Group admins can update group"
  on groups for update using (
    exists (
      select 1 from group_members
      where group_id = groups.id
        and user_id = auth.uid()
        and role = 'admin'
    )
  );

-- ============================================================
-- GROUP MEMBERS
-- ============================================================
create type group_role as enum ('admin', 'member');

create table group_members (
  id         uuid primary key default uuid_generate_v4(),
  group_id   uuid not null references groups(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  role       group_role default 'member',
  joined_at  timestamptz default now(),
  unique(group_id, user_id)
);

alter table group_members enable row level security;

create policy "Group members are publicly readable"
  on group_members for select using (true);

create policy "Users can join groups"
  on group_members for insert with check (auth.uid() = user_id);

create policy "Users can leave groups"
  on group_members for delete using (auth.uid() = user_id);

create policy "Admins can manage members"
  on group_members for update using (
    exists (
      select 1 from group_members gm
      where gm.group_id = group_members.group_id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
    )
  );

-- ============================================================
-- MESSAGES
-- ============================================================
create type message_type as enum ('group', 'direct');

create table messages (
  id          uuid primary key default uuid_generate_v4(),
  type        message_type not null,
  group_id    uuid references groups(id) on delete cascade,
  sender_id   uuid not null references profiles(id) on delete cascade,
  receiver_id uuid references profiles(id) on delete cascade,
  content     text not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  is_deleted  boolean default false,

  constraint check_target check (
    (type = 'group' and group_id is not null and receiver_id is null) or
    (type = 'direct' and receiver_id is not null and group_id is null)
  )
);

alter table messages enable row level security;

create policy "Users can read group messages they are member of"
  on messages for select using (
    (type = 'group' and exists (
      select 1 from group_members
      where group_id = messages.group_id and user_id = auth.uid()
    )) or
    (type = 'direct' and (sender_id = auth.uid() or receiver_id = auth.uid()))
  );

create policy "Authenticated users can send messages"
  on messages for insert with check (auth.uid() = sender_id);

create policy "Senders can soft-delete own messages"
  on messages for update using (auth.uid() = sender_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_messages_group_id on messages(group_id, created_at desc);
create index idx_messages_dm on messages(sender_id, receiver_id, created_at desc);
create index idx_follows_follower on follows(follower_id);
create index idx_follows_following on follows(following_id);
create index idx_group_members_group on group_members(group_id);
create index idx_group_members_user on group_members(user_id);

-- ============================================================
-- REALTIME
-- ============================================================
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table group_members;

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-join official group on signup
create or replace function auto_join_official_group()
returns trigger as $$
declare
  official_group_id uuid;
begin
  select id into official_group_id from groups where is_official = true limit 1;
  if official_group_id is not null then
    insert into group_members (group_id, user_id, role)
    values (official_group_id, new.id, 'member')
    on conflict do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created
  after insert on profiles
  for each row execute function auto_join_official_group();

-- Update updated_at timestamps
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();
create trigger groups_updated_at before update on groups
  for each row execute function update_updated_at();
create trigger messages_updated_at before update on messages
  for each row execute function update_updated_at();

-- ============================================================
-- SEED: Official Group
-- ============================================================
insert into groups (name, description, is_official)
values ('General', 'Welcome to Relay — the official community channel.', true);
