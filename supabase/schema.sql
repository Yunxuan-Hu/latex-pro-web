create table if not exists public.projects (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled project',
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.projects to authenticated;

drop policy if exists "Users can read their own projects" on public.projects;
create policy "Users can read their own projects"
  on public.projects
  for select
  using (auth.uid() = owner_id);

drop policy if exists "Users can insert their own projects" on public.projects;
create policy "Users can insert their own projects"
  on public.projects
  for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Users can update their own projects" on public.projects;
create policy "Users can update their own projects"
  on public.projects
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Users can delete their own projects" on public.projects;
create policy "Users can delete their own projects"
  on public.projects
  for delete
  using (auth.uid() = owner_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();
