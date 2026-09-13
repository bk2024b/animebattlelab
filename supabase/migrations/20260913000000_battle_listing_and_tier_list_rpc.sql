-- ============================================================
-- ANIME BATTLE LAB — Battle/anime tagging + tier list publish RPC
-- Adds what /battles (list+filter) and /tier-lists/create need
-- on top of 20260912000000_init_schema.sql.
-- ============================================================

-- ------------------------------------------------------------
-- BATTLE_ANIME — denormalized tag table for fast, indexed filtering.
-- A battle can tag 1 or 2 anime (crossovers tag both). Kept in sync
-- automatically whenever a battle's fighters change, so the app never
-- has to join through character_forms -> characters -> anime just to
-- filter a list (PRD §39-40, §70-71 — cross-anime battles at scale).
-- ------------------------------------------------------------
create table public.battle_anime (
  battle_id uuid not null references public.battles(id) on delete cascade,
  anime_id uuid not null references public.anime(id) on delete cascade,
  primary key (battle_id, anime_id)
);

create index battle_anime_anime_id_idx on public.battle_anime(anime_id);

alter table public.battle_anime enable row level security;

create policy "battle_anime_select_all" on public.battle_anime for select using (true);
-- No direct write policy: rows are only ever written by sync_battle_anime_tags()
-- below, which runs as SECURITY DEFINER and bypasses RLS.

create or replace function public.sync_battle_anime_tags()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  delete from public.battle_anime where battle_id = new.id;

  insert into public.battle_anime (battle_id, anime_id)
  select distinct new.id, ch.anime_id
  from public.character_forms cf
  join public.characters ch on ch.id = cf.character_id
  where cf.id in (new.fighter_a_form_id, new.fighter_b_form_id);

  return new;
end;
$$;

create trigger battles_sync_anime_tags
  after insert or update of fighter_a_form_id, fighter_b_form_id on public.battles
  for each row execute function public.sync_battle_anime_tags();

-- ------------------------------------------------------------
-- CREATE_TIER_LIST — one atomic round trip for the whole builder
-- (tier_lists + tier_list_tiers + tier_list_items) instead of N
-- sequential client inserts. SECURITY DEFINER so it can write across
-- three tables in one transaction, but it independently re-checks
-- auth.uid() and always writes rows owned by the caller — it never
-- trusts a user_id passed in from the client.
-- ------------------------------------------------------------
create or replace function public.create_tier_list(
  p_title text,
  p_description text,
  p_anime_id uuid,
  p_visibility visibility_type,
  p_tiers jsonb -- [{ name: text, position: int, items: [{ character_form_id: uuid, position: int }] }]
)
returns table (id uuid, slug text)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_tier_list_id uuid;
  v_base_slug text;
  v_slug text;
  v_suffix int := 0;
  v_tier jsonb;
  v_tier_id uuid;
  v_item jsonb;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_title is null or length(trim(p_title)) = 0 then
    raise exception 'title_required';
  end if;

  if jsonb_array_length(p_tiers) = 0 then
    raise exception 'at_least_one_tier_required';
  end if;

  v_base_slug := trim(both '-' from regexp_replace(lower(trim(p_title)), '[^a-z0-9]+', '-', 'g'));
  if v_base_slug = '' then
    v_base_slug := 'tier-list';
  end if;
  v_slug := v_base_slug;

  while exists (
    select 1 from public.tier_lists tl where tl.user_id = v_user_id and tl.slug = v_slug
  ) loop
    v_suffix := v_suffix + 1;
    v_slug := v_base_slug || '-' || v_suffix;
  end loop;

  insert into public.tier_lists (user_id, anime_id, slug, title, description, visibility)
  values (v_user_id, p_anime_id, v_slug, trim(p_title), p_description, p_visibility)
  returning tier_lists.id into v_tier_list_id;

  for v_tier in select * from jsonb_array_elements(p_tiers)
  loop
    insert into public.tier_list_tiers (tier_list_id, name, position)
    values (v_tier_list_id, v_tier ->> 'name', (v_tier ->> 'position')::smallint)
    returning tier_list_tiers.id into v_tier_id;

    for v_item in select * from jsonb_array_elements(coalesce(v_tier -> 'items', '[]'::jsonb))
    loop
      insert into public.tier_list_items (tier_id, character_form_id, position)
      values (v_tier_id, (v_item ->> 'character_form_id')::uuid, (v_item ->> 'position')::smallint);
    end loop;
  end loop;

  return query select v_tier_list_id, v_slug;
end;
$$;

-- Only logged-in users may call this; RLS on the underlying tables is
-- bypassed intentionally inside the function body (see comment above),
-- so this grant is the actual access boundary.
revoke all on function public.create_tier_list(text, text, uuid, visibility_type, jsonb) from public;
grant execute on function public.create_tier_list(text, text, uuid, visibility_type, jsonb) to authenticated;

-- ------------------------------------------------------------
-- Backfill: tag any battles that existed before this migration.
-- (Harmless no-op on a fresh database with zero battles.)
-- ------------------------------------------------------------
insert into public.battle_anime (battle_id, anime_id)
select distinct b.id, ch.anime_id
from public.battles b
join public.character_forms cf
  on cf.id in (b.fighter_a_form_id, b.fighter_b_form_id)
join public.characters ch on ch.id = cf.character_id
on conflict do nothing;
