create table if not exists public.puzzles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  author text,
  description text,
  width integer not null check (width between 2 and 30),
  height integer not null check (height between 2 and 30),
  puzzle_data jsonb not null,
  visibility text not null default 'unlisted' check (visibility in ('unlisted', 'public')),
  edit_token_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists puzzles_slug_idx on public.puzzles (slug);
create index if not exists puzzles_public_created_idx on public.puzzles (created_at desc)
  where visibility = 'public';

alter table public.puzzles enable row level security;

revoke all on table public.puzzles from anon, authenticated;
grant select (id, slug, title, author, description, width, height, puzzle_data, visibility, created_at, updated_at)
  on table public.puzzles to anon, authenticated;

drop policy if exists "Published puzzles are readable" on public.puzzles;
create policy "Published puzzles are readable"
  on public.puzzles for select
  to anon, authenticated
  using (true);

create or replace function public.publish_puzzle(
  p_slug text,
  p_title text,
  p_author text,
  p_description text,
  p_width integer,
  p_height integer,
  p_puzzle_data jsonb,
  p_visibility text,
  p_edit_token_hash text
)
returns table (id uuid, slug text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_visibility not in ('unlisted', 'public') then raise exception 'Invalid puzzle visibility'; end if;
  if length(trim(p_title)) = 0 then raise exception 'Puzzle title is required'; end if;
  if p_width not between 2 and 30 or p_height not between 2 and 30 then raise exception 'Invalid puzzle dimensions'; end if;
  if p_slug !~ '^[A-Za-z0-9]{6}$' then raise exception 'Invalid puzzle slug'; end if;
  if p_edit_token_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid creator token'; end if;
  if jsonb_typeof(p_puzzle_data) <> 'object' or octet_length(p_puzzle_data::text) > 500000 then raise exception 'Invalid puzzle data'; end if;

  return query
    insert into public.puzzles as inserted (
      slug, title, author, description, width, height, puzzle_data, visibility, edit_token_hash
    ) values (
      p_slug, left(p_title, 160), nullif(left(p_author, 120), ''),
      nullif(left(p_description, 1000), ''), p_width, p_height, p_puzzle_data,
      p_visibility, p_edit_token_hash
    )
    returning inserted.id, inserted.slug;
end;
$$;

create or replace function public.update_published_puzzle(
  p_id uuid,
  p_edit_token_hash text,
  p_title text,
  p_author text,
  p_description text,
  p_width integer,
  p_height integer,
  p_puzzle_data jsonb,
  p_visibility text
)
returns table (id uuid, slug text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_visibility not in ('unlisted', 'public') then raise exception 'Invalid puzzle visibility'; end if;
  if length(trim(p_title)) = 0 then raise exception 'Puzzle title is required'; end if;
  if p_width not between 2 and 30 or p_height not between 2 and 30 then raise exception 'Invalid puzzle dimensions'; end if;
  if p_edit_token_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid creator token'; end if;
  if jsonb_typeof(p_puzzle_data) <> 'object' or octet_length(p_puzzle_data::text) > 500000 then raise exception 'Invalid puzzle data'; end if;

  return query
    update public.puzzles as updated
    set title = left(p_title, 160), author = nullif(left(p_author, 120), ''),
        description = nullif(left(p_description, 1000), ''), width = p_width,
        height = p_height, puzzle_data = p_puzzle_data, visibility = p_visibility,
        updated_at = now()
    where updated.id = p_id
      and updated.edit_token_hash = p_edit_token_hash
    returning updated.id, updated.slug;

  if not found then raise exception 'This browser is not authorized to update that puzzle'; end if;
end;
$$;

revoke execute on function public.publish_puzzle(text, text, text, text, integer, integer, jsonb, text, text) from public;
revoke execute on function public.update_published_puzzle(uuid, text, text, text, text, integer, integer, jsonb, text) from public;
grant execute on function public.publish_puzzle(text, text, text, text, integer, integer, jsonb, text, text) to anon, authenticated;
grant execute on function public.update_published_puzzle(uuid, text, text, text, text, integer, integer, jsonb, text) to anon, authenticated;
