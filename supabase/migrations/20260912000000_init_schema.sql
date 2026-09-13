-- ============================================================
-- ANIME BATTLE LAB — Initial Schema & RLS Policies
-- Matches types/database.ts & PRD MVP specifications
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
create type public.user_role as enum ('user', 'editor', 'moderator', 'admin');
create type public.visibility_type as enum ('public', 'unlisted', 'private');
create type public.fighter_choice as enum ('a', 'b', 'draw');
create type public.difficulty_level as enum ('no_diff', 'low_diff', 'mid_diff', 'high_diff', 'extreme_diff');
create type public.source_type as enum ('manga', 'anime', 'databook', 'official', 'other');
create type public.battle_status as enum ('draft', 'published', 'archived');

-- ------------------------------------------------------------
-- PROFILES (Linked to auth.users)
-- ------------------------------------------------------------
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  role public.user_role not null default 'user',
  xp int not null default 0,
  rank text not null default 'Academy',
  prediction_accuracy numeric(5, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "profiles_select_public" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = user_id);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_username text;
begin
  v_username := coalesce(
    new.raw_user_meta_data ->> 'username',
    'scaler_' || substr(new.id::text, 1, 8)
  );

  insert into public.profiles (user_id, username, display_name)
  values (new.id, v_username, v_username)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- ANIME
-- ------------------------------------------------------------
create table public.anime (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  cover_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.anime enable row level security;
create policy "anime_select_published" on public.anime for select using (is_published = true);

-- ------------------------------------------------------------
-- CHARACTERS
-- ------------------------------------------------------------
create table public.characters (
  id uuid primary key default gen_random_uuid(),
  anime_id uuid not null references public.anime(id) on delete cascade,
  slug text unique not null,
  name text not null,
  description text,
  image_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index characters_anime_id_idx on public.characters(anime_id);
create index characters_slug_idx on public.characters(slug);

alter table public.characters enable row level security;
create policy "characters_select_published" on public.characters for select using (is_published = true);

-- ------------------------------------------------------------
-- CHARACTER FORMS (Specific forms with 8 core power stats)
-- ------------------------------------------------------------
create table public.character_forms (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  image_url text,
  power_score smallint check (power_score between 0 and 100),
  speed_score smallint check (speed_score between 0 and 100),
  durability_score smallint check (durability_score between 0 and 100),
  iq_score smallint check (iq_score between 0 and 100),
  battle_iq_score smallint check (battle_iq_score between 0 and 100),
  hax_score smallint check (hax_score between 0 and 100),
  stamina_score smallint check (stamina_score between 0 and 100),
  experience_score smallint check (experience_score between 0 and 100),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (character_id, slug)
);

create index character_forms_character_id_idx on public.character_forms(character_id);

alter table public.character_forms enable row level security;
create policy "character_forms_select_all" on public.character_forms for select using (true);

-- ------------------------------------------------------------
-- ABILITIES
-- ------------------------------------------------------------
create table public.abilities (
  id uuid primary key default gen_random_uuid(),
  character_form_id uuid not null references public.character_forms(id) on delete cascade,
  name text not null,
  description text,
  category text
);

create index abilities_form_id_idx on public.abilities(character_form_id);

alter table public.abilities enable row level security;
create policy "abilities_select_all" on public.abilities for select using (true);

-- ------------------------------------------------------------
-- FEATS
-- ------------------------------------------------------------
create table public.feats (
  id uuid primary key default gen_random_uuid(),
  character_form_id uuid not null references public.character_forms(id) on delete cascade,
  title text not null,
  description text,
  source_type public.source_type not null default 'other',
  source_reference text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index feats_form_id_idx on public.feats(character_form_id);

alter table public.feats enable row level security;
create policy "feats_select_all" on public.feats for select using (true);

-- ------------------------------------------------------------
-- BATTLES
-- ------------------------------------------------------------
create table public.battles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  fighter_a_form_id uuid not null references public.character_forms(id) on delete restrict,
  fighter_b_form_id uuid not null references public.character_forms(id) on delete restrict,
  status public.battle_status not null default 'draft',
  created_by uuid references auth.users(id) on delete set null,
  vote_a_count int not null default 0,
  vote_b_count int not null default 0,
  draw_count int not null default 0,
  comment_count int not null default 0,
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index battles_slug_idx on public.battles(slug);
create index battles_status_idx on public.battles(status);

alter table public.battles enable row level security;
create policy "battles_select_published" on public.battles for select using (status = 'published');

-- ------------------------------------------------------------
-- BATTLE CONDITIONS
-- ------------------------------------------------------------
create table public.battle_conditions (
  battle_id uuid primary key references public.battles(id) on delete cascade,
  location text,
  distance text,
  knowledge text default 'standard',
  prep_time text default 'None',
  speed_equalized boolean not null default false,
  verse_equalized boolean not null default true,
  special_rules text
);

alter table public.battle_conditions enable row level security;
create policy "battle_conditions_select_all" on public.battle_conditions for select using (true);

-- ------------------------------------------------------------
-- BATTLE VOTES
-- ------------------------------------------------------------
create table public.battle_votes (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  fighter_choice public.fighter_choice not null,
  difficulty public.difficulty_level,
  created_at timestamptz not null default now(),
  unique (battle_id, user_id)
);

create index battle_votes_battle_id_idx on public.battle_votes(battle_id);
create index battle_votes_user_id_idx on public.battle_votes(user_id);

alter table public.battle_votes enable row level security;
create policy "battle_votes_select_all" on public.battle_votes for select using (true);
create policy "battle_votes_insert_own" on public.battle_votes for insert with check (auth.uid() = user_id);
create policy "battle_votes_update_own" on public.battle_votes for update using (auth.uid() = user_id);

-- Trigger to maintain vote counters on battles
create or replace function public.sync_battle_vote_counts()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_battle_id uuid;
begin
  v_battle_id := coalesce(new.battle_id, old.battle_id);

  update public.battles
  set
    vote_a_count = (select count(*) from public.battle_votes where battle_id = v_battle_id and fighter_choice = 'a'),
    vote_b_count = (select count(*) from public.battle_votes where battle_id = v_battle_id and fighter_choice = 'b'),
    draw_count   = (select count(*) from public.battle_votes where battle_id = v_battle_id and fighter_choice = 'draw'),
    updated_at   = now()
  where id = v_battle_id;

  return coalesce(new, old);
end;
$$;

create trigger battle_votes_sync_counts
  after insert or update or delete on public.battle_votes
  for each row execute function public.sync_battle_vote_counts();

-- ------------------------------------------------------------
-- ARGUMENTS
-- ------------------------------------------------------------
create table public.arguments (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  fighter_choice public.fighter_choice not null,
  upvotes int not null default 0,
  downvotes int not null default 0,
  is_removed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index arguments_battle_id_idx on public.arguments(battle_id);
create index arguments_user_id_idx on public.arguments(user_id);

alter table public.arguments enable row level security;
create policy "arguments_select_active" on public.arguments for select using (is_removed = false);
create policy "arguments_insert_own" on public.arguments for insert with check (auth.uid() = user_id);
create policy "arguments_update_own" on public.arguments for update using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- ARGUMENT VOTES
-- ------------------------------------------------------------
create table public.argument_votes (
  id uuid primary key default gen_random_uuid(),
  argument_id uuid not null references public.arguments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vote smallint not null check (vote in (1, -1)),
  created_at timestamptz not null default now(),
  unique (argument_id, user_id)
);

alter table public.argument_votes enable row level security;
create policy "argument_votes_select_all" on public.argument_votes for select using (true);
create policy "argument_votes_insert_own" on public.argument_votes for insert with check (auth.uid() = user_id);
create policy "argument_votes_update_own" on public.argument_votes for update using (auth.uid() = user_id);
create policy "argument_votes_delete_own" on public.argument_votes for delete using (auth.uid() = user_id);

-- Trigger to sync argument upvotes/downvotes
create or replace function public.sync_argument_vote_counts()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_arg_id uuid;
begin
  v_arg_id := coalesce(new.argument_id, old.argument_id);

  update public.arguments
  set
    upvotes   = (select coalesce(count(*), 0) from public.argument_votes where argument_id = v_arg_id and vote = 1),
    downvotes = (select coalesce(count(*), 0) from public.argument_votes where argument_id = v_arg_id and vote = -1),
    updated_at = now()
  where id = v_arg_id;

  return coalesce(new, old);
end;
$$;

create trigger argument_votes_sync_counts
  after insert or update or delete on public.argument_votes
  for each row execute function public.sync_argument_vote_counts();

-- ------------------------------------------------------------
-- TIER LISTS
-- ------------------------------------------------------------
create table public.tier_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  anime_id uuid references public.anime(id) on delete set null,
  slug text not null,
  title text not null,
  description text,
  visibility public.visibility_type not null default 'public',
  view_count int not null default 0,
  like_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

create index tier_lists_user_id_idx on public.tier_lists(user_id);
create index tier_lists_anime_id_idx on public.tier_lists(anime_id);

alter table public.tier_lists enable row level security;
create policy "tier_lists_select_public" on public.tier_lists
  for select using (visibility = 'public' or auth.uid() = user_id);
create policy "tier_lists_insert_own" on public.tier_lists
  for insert with check (auth.uid() = user_id);
create policy "tier_lists_update_own" on public.tier_lists
  for update using (auth.uid() = user_id);
create policy "tier_lists_delete_own" on public.tier_lists
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- TIER LIST TIERS & ITEMS
-- ------------------------------------------------------------
create table public.tier_list_tiers (
  id uuid primary key default gen_random_uuid(),
  tier_list_id uuid not null references public.tier_lists(id) on delete cascade,
  name text not null,
  position smallint not null default 0
);

create index tier_list_tiers_list_id_idx on public.tier_list_tiers(tier_list_id);

alter table public.tier_list_tiers enable row level security;
create policy "tier_list_tiers_select_all" on public.tier_list_tiers for select using (true);

create table public.tier_list_items (
  id uuid primary key default gen_random_uuid(),
  tier_id uuid not null references public.tier_list_tiers(id) on delete cascade,
  character_form_id uuid not null references public.character_forms(id) on delete cascade,
  position smallint not null default 0
);

create index tier_list_items_tier_id_idx on public.tier_list_items(tier_id);

alter table public.tier_list_items enable row level security;
create policy "tier_list_items_select_all" on public.tier_list_items for select using (true);
