-- ============================================================
-- ANIME BATTLE LAB — Seed data (Madara vs Aizen)
-- Run after 20260912000000_init_schema.sql, e.g.:
--   supabase db reset          (runs migrations + this file automatically)
--   psql "$DATABASE_URL" -f supabase/seed.sql   (manual run)
-- Idempotent: safe to re-run, existing rows are upserted by slug.
-- ============================================================

-- ------------------------------------------------------------
-- ANIME
-- ------------------------------------------------------------
insert into public.anime (slug, name, description, is_published)
values
  ('naruto', 'Naruto', 'Ninja world power scaling — Naruto, Boruto and everything between.', true),
  ('bleach', 'Bleach', 'Soul Reapers, Quincy and the Thousand-Year Blood War.', true)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- CHARACTERS
-- ------------------------------------------------------------
insert into public.characters (anime_id, slug, name, description, is_published)
select a.id, c.slug, c.name, c.description, true
from public.anime a
join (values
  ('naruto', 'madara-uchiha', 'Madara Uchiha', 'Legendary Uchiha founder of Konoha, reincarnated as the Ten-Tails Jinchūriki.'),
  ('bleach', 'sosuke-aizen', 'Sosuke Aizen', 'Former captain of the 5th Division, mastermind behind the Hōgyoku.')
) as c(anime_slug, slug, name, description) on c.anime_slug = a.slug
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- CHARACTER FORMS
-- ------------------------------------------------------------
insert into public.character_forms (
  character_id, slug, name, is_default,
  power_score, speed_score, durability_score, iq_score,
  battle_iq_score, hax_score, stamina_score, experience_score
)
select ch.id, f.slug, f.name, f.is_default,
  f.power, f.speed, f.durability, f.iq, f.battle_iq, f.hax, f.stamina, f.experience
from public.characters ch
join (values
  ('madara-uchiha', 'six-paths', 'Six Paths — Ten-Tails Jinchūriki', true,  98, 94, 96, 97, 99, 100, 95, 98),
  ('sosuke-aizen',  'tybw',       'Thousand-Year Blood War Arc',      true,  96, 99, 92, 98, 99, 100, 94, 97)
) as f(character_slug, slug, name, is_default, power, speed, durability, iq, battle_iq, hax, stamina, experience)
  on f.character_slug = ch.slug
on conflict (character_id, slug) do nothing;

-- ------------------------------------------------------------
-- ABILITIES
-- ------------------------------------------------------------
insert into public.abilities (character_form_id, name, description, category)
select cf.id, ab.name, ab.description, ab.category
from public.character_forms cf
join (values
  ('six-paths', 'Limbo: Border Jail',   'Summons intangible, invisible clones that attack from another dimension.', 'Ninjutsu'),
  ('six-paths', 'Susanoo',              'Full-body chakra avatar granting immense offense and defense.', 'Kekkei Genkai'),
  ('six-paths', 'Rinnegan',             'Grants access to all Six Paths techniques, including gravity and dimensional jutsu.', 'Dojutsu'),
  ('tybw',      'Kyoka Suigetsu',       'Absolute hypnosis — makes every sense lie to anyone who has seen the blade.', 'Zanpakuto'),
  ('tybw',      'Hado 90: Kurohitsugi', 'A near-instant-kill kido spell of overwhelming destructive power.', 'Kido'),
  ('tybw',      'Hōgyoku Fusion',       'Merges with the Hōgyoku for near-limitless adaptive power growth.', 'Special Ability')
) as ab(form_slug, name, description, category) on ab.form_slug = cf.slug;

-- ------------------------------------------------------------
-- FEATS
-- ------------------------------------------------------------
insert into public.feats (character_form_id, title, description, source_type, verified)
select cf.id, ft.title, ft.description, ft.source_type::source_type, true
from public.character_forms cf
join (values
  ('six-paths', 'Tailed Beast Bomb clash',   'Traded blows with a combined Bijudama barrage from all nine Tailed Beasts.', 'anime'),
  ('six-paths', 'Reacted to Minato-tier speed', 'Kept pace with Fourth Hokage-level Hiraishin exchanges during the war.', 'manga'),
  ('tybw',      'One-shot a captain-class opponent', 'Ended a fight against a seated Gotei 13 officer with a single Kurohitsugi.', 'anime'),
  ('tybw',      'No-sold multiple Bankai',   'Tanked and shrugged off several captain Bankai releases without visible injury.', 'manga')
) as ft(form_slug, title, description, source_type) on ft.form_slug = cf.slug;

-- ------------------------------------------------------------
-- BATTLE
-- ------------------------------------------------------------
insert into public.battles (slug, fighter_a_form_id, fighter_b_form_id, status)
select
  'madara-vs-aizen',
  (select id from public.character_forms where slug = 'six-paths'),
  (select id from public.character_forms where slug = 'tybw'),
  'published'
on conflict (slug) do nothing;

insert into public.battle_conditions (
  battle_id, location, knowledge, prep_time, speed_equalized, verse_equalized
)
select b.id, 'Open battlefield', 'standard', 'None', false, true
from public.battles b
where b.slug = 'madara-vs-aizen'
on conflict (battle_id) do nothing;
