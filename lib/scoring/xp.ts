import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export const RANKS = [
  { minXp: 10000, name: "Legend" },
  { minXp: 5000, name: "Kage" },
  { minXp: 3000, name: "ANBU" },
  { minXp: 1500, name: "Jonin" },
  { minXp: 500, name: "Chunin" },
  { minXp: 100, name: "Genin" },
  { minXp: 0, name: "Academy" },
] as const;

export function calculateRank(xp: number): string {
  for (const rank of RANKS) {
    if (xp >= rank.minXp) {
      return rank.name;
    }
  }
  return "Academy";
}

export async function awardXp(
  supabase: SupabaseClient<Database>,
  userId: string,
  amount: number,
): Promise<{ xp: number; rank: string } | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp, rank")
    .eq("user_id", userId)
    .single();

  if (!profile) return null;

  const newXp = Math.max(0, (profile.xp ?? 0) + amount);
  const newRank = calculateRank(newXp);

  await supabase
    .from("profiles")
    .update({ xp: newXp, rank: newRank, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  return { xp: newXp, rank: newRank };
}
