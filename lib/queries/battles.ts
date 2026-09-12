import { createClient } from "@/lib/supabase/server";
import type { BattleView, FighterView, ArgumentView } from "@/lib/battle/types";

// Deterministic gradient per form so the placeholder plate stays stable
// across renders without storing a color in the DB (Design System §20/§58 —
// no licensed artwork in brand-owned surfaces).
const GRADIENTS: [string, string][] = [
  ["#22D07A", "#0f6b3d"],
  ["#7C5CFF", "#3d2b8f"],
  ["#F5B942", "#8a611f"],
  ["#5C9DFF", "#264a8f"],
];

function gradientFor(id: string): [string, string] {
  const idx = id.charCodeAt(0) % GRADIENTS.length;
  return GRADIENTS[idx];
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

type FormRow = {
  id: string;
  name: string;
  power_score: number | null;
  speed_score: number | null;
  durability_score: number | null;
  iq_score: number | null;
  battle_iq_score: number | null;
  hax_score: number | null;
  stamina_score: number | null;
  experience_score: number | null;
  characters: {
    name: string;
    anime: { name: string } | null;
  } | null;
};

function mapFighter(form: FormRow): FighterView {
  const [gradientFrom, gradientTo] = gradientFor(form.id);
  const characterName = form.characters?.name ?? form.name;
  return {
    formId: form.id,
    name: characterName,
    formName: form.name,
    anime: form.characters?.anime?.name ?? "",
    initials: initialsFor(characterName),
    gradientFrom,
    gradientTo,
    stats: {
      power: form.power_score ?? 0,
      speed: form.speed_score ?? 0,
      durability: form.durability_score ?? 0,
      iq: form.iq_score ?? 0,
      battleIq: form.battle_iq_score ?? 0,
      hax: form.hax_score ?? 0,
      stamina: form.stamina_score ?? 0,
      experience: form.experience_score ?? 0,
    },
  };
}

export async function getBattleBySlug(slug: string): Promise<BattleView | null> {
  const supabase = await createClient();

  const { data: battle, error } = await supabase
    .from("battles")
    .select(
      `
      id, slug, vote_a_count, vote_b_count, draw_count,
      battle_conditions ( location, knowledge, prep_time, speed_equalized, verse_equalized ),
      fighter_a:character_forms!battles_fighter_a_form_id_fkey (
        id, name, power_score, speed_score, durability_score, iq_score,
        battle_iq_score, hax_score, stamina_score, experience_score,
        characters ( name, anime:anime_id ( name, id ) )
      ),
      fighter_b:character_forms!battles_fighter_b_form_id_fkey (
        id, name, power_score, speed_score, durability_score, iq_score,
        battle_iq_score, hax_score, stamina_score, experience_score,
        characters ( name, anime:anime_id ( name, id ) )
      )
    `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !battle) return null;

  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id ?? null;

  let currentUserVote: BattleView["currentUserVote"] = null;
  if (userId) {
    const { data: existingVote } = await supabase
      .from("battle_votes")
      .select("fighter_choice")
      .eq("battle_id", battle.id)
      .eq("user_id", userId)
      .maybeSingle();
    currentUserVote = existingVote?.fighter_choice ?? null;
  }

  const { data: argumentRows } = await supabase
    .from("arguments")
    .select(
      "id, content, fighter_choice, upvotes, downvotes, created_at, profiles ( username, rank )",
    )
    .eq("battle_id", battle.id)
    .eq("is_removed", false)
    .order("upvotes", { ascending: false })
    .limit(20);

  const args: ArgumentView[] = (argumentRows ?? []).map((row) => ({
    id: row.id,
    username: row.profiles?.username ?? "unknown",
    rank: row.profiles?.rank ?? "Academy",
    content: row.content,
    fighterChoice: row.fighter_choice as "a" | "b",
    upvotes: row.upvotes,
    downvotes: row.downvotes,
    replyCount: 0, // threaded replies are a post-MVP feature (PRD §37 argument_votes/replies)
    createdAt: new Date(row.created_at).toLocaleDateString(),
  }));

  // Related battles: other published battles sharing an anime with either fighter.
  const animeId = (battle.fighter_a as any)?.characters?.anime?.id;
  let relatedBattles: BattleView["relatedBattles"] = [];
  if (animeId) {
    const { data: related } = await supabase
      .from("battles")
      .select(
        "slug, vote_a_count, vote_b_count, fighter_a:character_forms!battles_fighter_a_form_id_fkey(characters(name, anime_id)), fighter_b:character_forms!battles_fighter_b_form_id_fkey(characters(name))",
      )
      .neq("slug", slug)
      .eq("status", "published")
      .limit(3);

    relatedBattles = (related ?? []).map((r: any) => ({
      slug: r.slug,
      label: `${r.fighter_a?.characters?.name ?? "?"} vs ${r.fighter_b?.characters?.name ?? "?"}`,
      votes: (r.vote_a_count ?? 0) + (r.vote_b_count ?? 0),
    }));
  }

  const conditions = Array.isArray(battle.battle_conditions)
    ? battle.battle_conditions[0]
    : battle.battle_conditions;

  return {
    id: battle.id,
    slug: battle.slug,
    animeLabel: [
      (battle.fighter_a as any)?.characters?.anime?.name,
      (battle.fighter_b as any)?.characters?.anime?.name,
    ]
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .join(" × "),
    fighterA: mapFighter(battle.fighter_a as any),
    fighterB: mapFighter(battle.fighter_b as any),
    voteACount: battle.vote_a_count,
    voteBCount: battle.vote_b_count,
    drawCount: battle.draw_count,
    conditions: {
      location: conditions?.location ?? "Unspecified",
      knowledge: conditions?.knowledge ?? "standard",
      prepTime: conditions?.prep_time ?? "None",
      speedEqualized: conditions?.speed_equalized ?? false,
      verseEqualized: conditions?.verse_equalized ?? false,
    },
    arguments: args,
    relatedBattles,
    currentUserVote,
  };
}
