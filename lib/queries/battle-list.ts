import { createClient } from "@/lib/supabase/server";

export type BattleSort = "popular" | "recent" | "controversial";

export type BattleSummary = {
  slug: string;
  fighterAName: string;
  fighterBName: string;
  animeLabel: string;
  voteACount: number;
  voteBCount: number;
  createdAt: string;
};

export async function getBattlesList(params: {
  animeSlug?: string;
  sort?: BattleSort;
  limit?: number;
}): Promise<BattleSummary[]> {
  const { animeSlug, sort = "popular", limit = 20 } = params;
  const supabase = await createClient();

  let battleIds: string[] | null = null;
  if (animeSlug) {
    // battle_anime is the denormalized tag table synced by a DB trigger —
    // filtering through it avoids joining battles -> character_forms ->
    // characters -> anime on every list request (PRD §39-40 performance).
    const { data: anime } = await supabase
      .from("anime")
      .select("id")
      .eq("slug", animeSlug)
      .single();
    if (!anime) return [];

    const { data: tagged } = await supabase
      .from("battle_anime")
      .select("battle_id")
      .eq("anime_id", anime.id);
    battleIds = (tagged ?? []).map((t) => t.battle_id);
    if (battleIds.length === 0) return [];
  }

  let query = supabase
    .from("battles")
    .select(
      `
      slug, vote_a_count, vote_b_count, created_at,
      fighter_a:character_forms!battles_fighter_a_form_id_fkey ( characters ( name, anime:anime_id ( name ) ) ),
      fighter_b:character_forms!battles_fighter_b_form_id_fkey ( characters ( name, anime:anime_id ( name ) ) )
    `,
    )
    .eq("status", "published")
    .limit(limit);

  if (battleIds) query = query.in("id", battleIds);

  if (sort === "recent") {
    query = query.order("created_at", { ascending: false });
  } else {
    // "popular" and "controversial" both need vote totals computed in JS
    // (Postgres can't easily express "closest tie" as a plain order-by
    // across two columns without a generated column) — fine at this scale,
    // revisit with a materialized column if the list grows past a page.
    query = query.order("vote_a_count", { ascending: false });
  }

  const { data } = await query;
  let rows = (data ?? []) as any[];

  if (sort === "popular") {
    rows.sort(
      (a, b) => b.vote_a_count + b.vote_b_count - (a.vote_a_count + a.vote_b_count),
    );
  } else if (sort === "controversial") {
    rows.sort((a, b) => {
      const marginA = Math.abs(a.vote_a_count - a.vote_b_count);
      const marginB = Math.abs(b.vote_a_count - b.vote_b_count);
      return marginA - marginB;
    });
  }

  return rows.map((b) => {
    const animeA = b.fighter_a?.characters?.anime?.name;
    const animeB = b.fighter_b?.characters?.anime?.name;
    const animeLabel =
      animeA === animeB ? animeA : [animeA, animeB].filter(Boolean).join(" × ");
    return {
      slug: b.slug,
      fighterAName: b.fighter_a?.characters?.name ?? "?",
      fighterBName: b.fighter_b?.characters?.name ?? "?",
      animeLabel: animeLabel ?? "",
      voteACount: b.vote_a_count,
      voteBCount: b.vote_b_count,
      createdAt: b.created_at,
    };
  });
}
