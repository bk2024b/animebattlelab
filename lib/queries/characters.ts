import { createClient } from "@/lib/supabase/server";
import { gradientFor, initialsFor } from "@/lib/characters/appearance";

export type CharacterFormOption = {
  formId: string;
  name: string;
  formName: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
};

export type CharacterSummary = {
  id: string;
  slug: string;
  name: string;
  animeName: string;
  animeSlug: string;
  defaultFormName: string;
  powerScore: number;
  speedScore: number;
  haxScore: number;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
};

export type CharacterFormDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  powerScore: number;
  speedScore: number;
  durabilityScore: number;
  iqScore: number;
  battleIqScore: number;
  haxScore: number;
  staminaScore: number;
  experienceScore: number;
  abilities: {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
  }[];
  feats: {
    id: string;
    title: string;
    description: string | null;
    sourceType: string;
    verified: boolean;
  }[];
};

export type CharacterMatchupSummary = {
  slug: string;
  opponentName: string;
  opponentFormName: string;
  opponentAnime: string;
  voteCount: number;
  opponentVoteCount: number;
  winRatePct: number;
};

export type CharacterDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  animeName: string;
  animeSlug: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  forms: CharacterFormDetail[];
  matchups: CharacterMatchupSummary[];
};

/** All published character forms for a given anime — used by the Tier List Builder's picker panel. */
export async function getCharacterFormsByAnime(
  animeId: string,
): Promise<CharacterFormOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("character_forms")
    .select("id, name, characters!inner ( name, anime_id, is_published )")
    .eq("characters.anime_id", animeId)
    .eq("characters.is_published", true);

  return (data ?? []).map((row: any) => {
    const characterName = row.characters?.name ?? row.name;
    return {
      formId: row.id,
      name: characterName,
      formName: row.name,
      initials: initialsFor(characterName),
      gradientFrom: gradientFor(row.id)[0],
      gradientTo: gradientFor(row.id)[1],
    };
  });
}

/** Lists all published characters with their default form stats for /characters */
export async function getCharactersList(params?: {
  animeSlug?: string;
  search?: string;
}): Promise<CharacterSummary[]> {
  const supabase = await createClient();

  let query = supabase
    .from("characters")
    .select(`
      id, slug, name,
      anime:anime_id ( id, name, slug ),
      forms:character_forms (
        id, name, is_default, power_score, speed_score, hax_score
      )
    `)
    .eq("is_published", true)
    .order("name");

  if (params?.animeSlug) {
    // Look up anime id
    const { data: a } = await supabase
      .from("anime")
      .select("id")
      .eq("slug", params.animeSlug)
      .single();
    if (a) {
      query = query.eq("anime_id", a.id);
    }
  }

  if (params?.search) {
    query = query.ilike("name", `%${params.search}%`);
  }

  const { data } = await query;

  return (data ?? []).map((c: any) => {
    const forms: any[] = c.forms ?? [];
    const defaultForm = forms.find((f) => f.is_default) ?? forms[0] ?? {};
    const [gradientFrom, gradientTo] = gradientFor(defaultForm.id ?? c.id);

    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      animeName: c.anime?.name ?? "",
      animeSlug: c.anime?.slug ?? "",
      defaultFormName: defaultForm.name ?? "Base",
      powerScore: defaultForm.power_score ?? 80,
      speedScore: defaultForm.speed_score ?? 80,
      haxScore: defaultForm.hax_score ?? 80,
      initials: initialsFor(c.name),
      gradientFrom,
      gradientTo,
    };
  });
}

/** Complete character detail including all forms, stats, abilities, feats, and matchup history */
export async function getCharacterDetail(slug: string): Promise<CharacterDetail | null> {
  const supabase = await createClient();

  const { data: char, error } = await supabase
    .from("characters")
    .select(`
      id, slug, name, description,
      anime:anime_id ( id, name, slug ),
      forms:character_forms (
        id, slug, name, description, is_default,
        power_score, speed_score, durability_score, iq_score,
        battle_iq_score, hax_score, stamina_score, experience_score,
        abilities ( id, name, description, category ),
        feats ( id, title, description, source_type, verified )
      )
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !char) return null;

  const formsList = (char.forms ?? []) as any[];
  const mappedForms: CharacterFormDetail[] = formsList.map((f) => ({
    id: f.id,
    slug: f.slug,
    name: f.name,
    description: f.description,
    isDefault: f.is_default ?? false,
    powerScore: f.power_score ?? 0,
    speedScore: f.speed_score ?? 0,
    durabilityScore: f.durability_score ?? 0,
    iqScore: f.iq_score ?? 0,
    battleIqScore: f.battle_iq_score ?? 0,
    haxScore: f.hax_score ?? 0,
    staminaScore: f.stamina_score ?? 0,
    experienceScore: f.experience_score ?? 0,
    abilities: (f.abilities ?? []).map((ab: any) => ({
      id: ab.id,
      name: ab.name,
      description: ab.description,
      category: ab.category,
    })),
    feats: (f.feats ?? []).map((ft: any) => ({
      id: ft.id,
      title: ft.title,
      description: ft.description,
      sourceType: ft.source_type,
      verified: ft.verified ?? false,
    })),
  }));

  // Fetch matchups featuring any form of this character
  const formIds = mappedForms.map((f) => f.id);
  const { data: battleRows } = await supabase
    .from("battles")
    .select(`
      id, slug, vote_a_count, vote_b_count, fighter_a_form_id, fighter_b_form_id,
      fighter_a:character_forms!battles_fighter_a_form_id_fkey (
        id, name, characters ( name, anime:anime_id ( name ) )
      ),
      fighter_b:character_forms!battles_fighter_b_form_id_fkey (
        id, name, characters ( name, anime:anime_id ( name ) )
      )
    `)
    .eq("status", "published")
    .or(`fighter_a_form_id.in.(${formIds.join(",")}),fighter_b_form_id.in.(${formIds.join(",")})`)
    .limit(10);

  const matchups: CharacterMatchupSummary[] = (battleRows ?? []).map((b: any) => {
    const isFighterA = formIds.includes(b.fighter_a_form_id);
    const opponent = isFighterA ? b.fighter_b : b.fighter_a;
    const myVotes = isFighterA ? b.vote_a_count : b.vote_b_count;
    const oppVotes = isFighterA ? b.vote_b_count : b.vote_a_count;
    const total = Math.max(myVotes + oppVotes, 1);
    const winRatePct = Math.round((myVotes / total) * 100);

    return {
      slug: b.slug,
      opponentName: opponent?.characters?.name ?? "Opponent",
      opponentFormName: opponent?.name ?? "",
      opponentAnime: opponent?.characters?.anime?.name ?? "",
      voteCount: myVotes,
      opponentVoteCount: oppVotes,
      winRatePct,
    };
  });

  const [gradientFrom, gradientTo] = gradientFor(char.id);

  return {
    id: char.id,
    slug: char.slug,
    name: char.name,
    description: char.description,
    animeName: (char.anime as any)?.name ?? "",
    animeSlug: (char.anime as any)?.slug ?? "",
    initials: initialsFor(char.name),
    gradientFrom,
    gradientTo,
    forms: mappedForms,
    matchups,
  };
}
