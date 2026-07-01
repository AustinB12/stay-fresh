-- Profiles table: a public mirror of auth.users so household members can see
-- each other's name / email / avatar without exposing the auth schema.

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user may always read their own profile, and the profile of anyone who
-- shares at least one household with them. The helper runs as SECURITY DEFINER
-- so the membership lookup is not itself restricted by household_members RLS.
create or replace function public.shares_household_with(target uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.household_members a
    join public.household_members b on a.household_id = b.household_id
    where a.user_id = auth.uid()
      and b.user_id = target
  );
$$;

create policy "Read own or co-member profiles"
  on public.profiles for select
  using (id = auth.uid() or public.shares_household_with(id));

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid());

-- Keep profiles in sync with auth.users on sign-up and metadata changes.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update set
    email      = excluded.email,
    full_name  = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.handle_new_user();

-- Backfill existing users.
insert into public.profiles (id, email, full_name, avatar_url)
select
  id,
  email,
  raw_user_meta_data ->> 'full_name',
  raw_user_meta_data ->> 'avatar_url'
from auth.users
on conflict (id) do nothing;
