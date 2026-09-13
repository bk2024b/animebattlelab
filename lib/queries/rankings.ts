import { createClient } from "@/lib/supabase/server";

export type TopScaler = {
  rankPosition: number;
  userId: string;
  username: string;
  displayName: string | null;
  rank: string;
  xp: number;
  predictionAccuracy: number;
};

export type TopCharacter = {
  rankPosition: number;
  id: string;
  slug: string;
  name: string;
  animeName: string;
  defaultFormName: string;
  powerScore: number;
  haxScore: number;
  speedScore: number;
};

export async function getTopScalers(limit: number = 50): Promise<TopScaler[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("user_id, username, display_name, rank, xp, prediction_accuracy")
    .order("xp", { ascending: false })
    .limit(limit);

  return (data ?? []).map((p: any, idx: number) => ({
    rankPosition: idx + 1,
    userId: p.user_id,
    username: p.username,
    displayName: p.display_name,
    rank: p.rank ?? "Academy",
    xp: p.xp ?? 0,
    predictionAccuracy: Number(p.prediction_accuracy ?? 0),
  }));
}

export async function getTopCharacters(limit: number = 20): Promise<TopCharacter[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("character_forms")
    .select(`
      id, name, power_score, hax_score, speed_score,
      characters!inner ( id, slug, name, anime:anime_id ( name ) )
    `)
    .order("power_score", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row: any, idx: number) => ({
    rankPosition: idx + 1,
    id: row.characters?.id ?? row.id,
    slug: row.characters?.slug ?? "",
    name: row.characters?.name ?? row.name,
    animeName: row.characters?.anime?.name ?? "",
    defaultFormName: row.name,
    powerScore: row.power_score ?? 0,
    haxScore: row.hax_score ?? 0,
    speedScore: row.speed_score ?? 0,
  }));
}
