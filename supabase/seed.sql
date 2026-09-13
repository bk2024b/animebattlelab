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
  ('bleach', 'Bleach', 'Soul Reapers, Quincy and the Thousand-Year Blood War.', true),
  ('jujutsu-kaisen', 'Jujutsu Kaisen', 'Cursed energy, domain expansions and sorcerer power scaling.', true)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- CHARACTERS
-- ------------------------------------------------------------
insert into public.characters (anime_id, slug, name, description, is_published)
select a.id, c.slug, c.name, c.description, true
from public.anime a
join (values
  ('naruto', 'madara-uchiha', 'Madara Uchiha', 'Legendary Uchiha founder of Konoha, reincarnated as the Ten-Tails Jinchūriki.'),
  ('naruto', 'naruto-uzumaki', 'Naruto Uzumaki', 'Jinchūriki of the Nine-Tails and Seventh Hokage.'),
  ('naruto', 'sasuke-uchiha', 'Sasuke Uchiha', 'Wielder of the Rinnegan, Madara''s chosen successor in power.'),
  ('bleach', 'sosuke-aizen', 'Sosuke Aizen', 'Former captain of the 5th Division, mastermind behind the Hōgyoku.'),
  ('bleach', 'ichigo-kurosaki', 'Ichigo Kurosaki', 'Substitute Soul Reaper wielding Zangetsu''s true form.'),
  ('jujutsu-kaisen', 'satoru-gojo', 'Satoru Gojo', 'The strongest Jujutsu sorcerer, wielder of Limitless and Six Eyes.')
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
  ('madara-uchiha',   'six-paths',    'Six Paths — Ten-Tails Jinchūriki', true,  98, 94, 96, 97, 99, 100, 95, 98),
  ('naruto-uzumaki',  'six-paths',    'Six Paths Sage Mode',              true,  93, 92, 90, 88, 94, 92,  96, 90),
  ('sasuke-uchiha',   'rinnegan',     'Rinnegan — War Arc',               true,  92, 93, 88, 91, 93, 95,  90, 89),
  ('sosuke-aizen',    'tybw',         'Thousand-Year Blood War Arc',      true,  96, 99, 92, 98, 99, 100, 94, 97),
  ('ichigo-kurosaki', 'true-bankai',  'True Bankai — Zangetsu',           true,  91, 95, 87, 85, 90, 88,  89, 86),
  ('satoru-gojo',     'unsealed',     'Unsealed — Limitless',             true,  97, 96, 91, 94, 96, 99,  93, 92)
) as f(character_slug, slug, name, is_default, power, speed, durability, iq, battle_iq, hax, stamina, experience)
  on f.character_slug = ch.slug
on conflict (character_id, slug) do nothing;

-- ------------------------------------------------------------
-- ABILITIES
-- ------------------------------------------------------------
insert into public.abilities (character_form_id, name, description, category)
select cf.id, ab.name, ab.description, ab.category
from public.character_forms cf
join public.characters ch on ch.id = cf.character_id
join (values
  ('madara-uchiha',   'six-paths',   'Limbo: Border Jail',   'Summons intangible, invisible clones that attack from another dimension.', 'Ninjutsu'),
  ('madara-uchiha',   'six-paths',   'Susanoo',              'Full-body chakra avatar granting immense offense and defense.', 'Kekkei Genkai'),
  ('madara-uchiha',   'six-paths',   'Rinnegan',             'Grants access to all Six Paths techniques, including gravity and dimensional jutsu.', 'Dojutsu'),
  ('sosuke-aizen',    'tybw',        'Kyoka Suigetsu',       'Absolute hypnosis — makes every sense lie to anyone who has seen the blade.', 'Zanpakuto'),
  ('sosuke-aizen',    'tybw',        'Hado 90: Kurohitsugi', 'A near-instant-kill kido spell of overwhelming destructive power.', 'Kido'),
  ('sosuke-aizen',    'tybw',        'Hōgyoku Fusion',       'Merges with the Hōgyoku for near-limitless adaptive power growth.', 'Special Ability'),
  ('satoru-gojo',     'unsealed',    'Limitless',            'Manipulates space itself to make any attack that reaches him effectively infinite distance away.', 'Cursed Technique'),
  ('satoru-gojo',     'unsealed',    'Domain Expansion: Unlimited Void', 'Traps opponents in an inescapable domain of infinite information.', 'Domain Expansion')
) as ab(character_slug, form_slug, name, description, category)
  on ab.character_slug = ch.slug and ab.form_slug = cf.slug;

-- ------------------------------------------------------------
-- FEATS
-- ------------------------------------------------------------
insert into public.feats (character_form_id, title, description, source_type, verified)
select cf.id, ft.title, ft.description, ft.source_type::source_type, true
from public.character_forms cf
join public.characters ch on ch.id = cf.character_id
join (values
  ('madara-uchiha',   'six-paths',   'Tailed Beast Bomb clash',   'Traded blows with a combined Bijudama barrage from all nine Tailed Beasts.', 'anime'),
  ('madara-uchiha',   'six-paths',   'Reacted to Minato-tier speed', 'Kept pace with Fourth Hokage-level Hiraishin exchanges during the war.', 'manga'),
  ('sosuke-aizen',    'tybw',        'One-shot a captain-class opponent', 'Ended a fight against a seated Gotei 13 officer with a single Kurohitsugi.', 'anime'),
  ('sosuke-aizen',    'tybw',        'No-sold multiple Bankai',   'Tanked and shrugged off several captain Bankai releases without visible injury.', 'manga'),
  ('satoru-gojo',     'unsealed',    'Solo-defeated a special-grade curse', 'Ended a special-grade threat without releasing Domain Expansion.', 'anime')
) as ft(character_slug, form_slug, title, description, source_type)
  on ft.character_slug = ch.slug and ft.form_slug = cf.slug;

-- ------------------------------------------------------------
-- BATTLES
-- ------------------------------------------------------------
insert into public.battles (slug, fighter_a_form_id, fighter_b_form_id, status)
values
  (
    'madara-vs-aizen',
    (select cf.id from public.character_forms cf join public.characters ch on ch.id = cf.character_id where ch.slug = 'madara-uchiha' and cf.slug = 'six-paths'),
    (select cf.id from public.character_forms cf join public.characters ch on ch.id = cf.character_id where ch.slug = 'sosuke-aizen' and cf.slug = 'tybw'),
    'published'
  ),
  (
    'naruto-vs-sasuke',
    (select cf.id from public.character_forms cf join public.characters ch on ch.id = cf.character_id where ch.slug = 'naruto-uzumaki' and cf.slug = 'six-paths'),
    (select cf.id from public.character_forms cf join public.characters ch on ch.id = cf.character_id where ch.slug = 'sasuke-uchiha' and cf.slug = 'rinnegan'),
    'published'
  ),
  (
    'gojo-vs-ichigo',
    (select cf.id from public.character_forms cf join public.characters ch on ch.id = cf.character_id where ch.slug = 'satoru-gojo' and cf.slug = 'unsealed'),
    (select cf.id from public.character_forms cf join public.characters ch on ch.id = cf.character_id where ch.slug = 'ichigo-kurosaki' and cf.slug = 'true-bankai'),
    'published'
  )
on conflict (slug) do nothing;

insert into public.battle_conditions (battle_id, location, knowledge, prep_time, speed_equalized, verse_equalized)
select b.id, cond.location, cond.knowledge, cond.prep_time, cond.speed_equalized, cond.verse_equalized
from public.battles b
join (values
  ('madara-vs-aizen',  'Open battlefield', 'standard', 'None', false, true),
  ('naruto-vs-sasuke', 'Valley of the End', 'full',     'None', false, false),
  ('gojo-vs-ichigo',   'Open battlefield', 'standard', 'None', false, true)
) as cond(slug, location, knowledge, prep_time, speed_equalized, verse_equalized) on cond.slug = b.slug
on conflict (battle_id) do nothing;
