import { createClient } from "@/lib/supabase/server";
import { RANKS } from "@/lib/scoring/xp";

export type UserProfileView = {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: string;
  xp: number;
  rank: string;
  predictionAccuracy: number;
  createdAt: string;
  nextRank: { name: string; minXp: number } | null;
  stats: {
    votesCount: number;
    argumentsCount: number;
    tierListsCount: number;
  };
  tierLists: {
    id: string;
    slug: string;
    title: string;
    animeName: string | null;
    createdAt: string;
  }[];
  arguments: {
    id: string;
    content: string;
    fighterChoice: string;
    upvotes: number;
    createdAt: string;
    battleSlug: string;
    battleTitle: string;
  }[];
};

export async function getUserProfile(username: string): Promise<UserProfileView | null> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) return null;

  // Next rank calculation
  const currentXp = profile.xp ?? 0;
  // RANKS is ordered descending [Legend 10000, Kage 5000, ... Academy 0]
  const currentRankIdx = RANKS.findIndex((r) => currentXp >= r.minXp);
  const nextRank = currentRankIdx > 0 ? RANKS[currentRankIdx - 1] : null;

  // Counts & activity
  const [votesRes, argsRes, tierListsRes] = await Promise.all([
    supabase
      .from("battle_votes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.user_id),
    supabase
      .from("arguments")
      .select(`
        id, content, fighter_choice, upvotes, created_at,
        battles:battle_id (
          slug,
          fighter_a:character_forms!battles_fighter_a_form_id_fkey ( characters ( name ) ),
          fighter_b:character_forms!battles_fighter_b_form_id_fkey ( characters ( name ) )
        )
      `)
      .eq("user_id", profile.user_id)
      .eq("is_removed", false)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("tier_lists")
      .select(`
        id, slug, title, created_at,
        anime:anime_id ( name )
      `)
      .eq("user_id", profile.user_id)
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const argumentsList = (argsRes.data ?? []).map((a: any) => {
    const battle = a.battles;
    const nameA = battle?.fighter_a?.characters?.name ?? "Fighter A";
    const nameB = battle?.fighter_b?.characters?.name ?? "Fighter B";
    return {
      id: a.id,
      content: a.content,
      fighterChoice: a.fighter_choice,
      upvotes: a.upvotes,
      createdAt: a.created_at,
      battleSlug: battle?.slug ?? "",
      battleTitle: `${nameA} vs ${nameB}`,
    };
  });

  const tierListsList = (tierListsRes.data ?? []).map((tl: any) => ({
    id: tl.id,
    slug: tl.slug,
    title: tl.title,
    animeName: tl.anime?.name ?? null,
    createdAt: tl.created_at,
  }));

  return {
    userId: profile.user_id,
    username: profile.username,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    role: profile.role,
    xp: currentXp,
    rank: profile.rank ?? "Academy",
    predictionAccuracy: Number(profile.prediction_accuracy ?? 0),
    createdAt: profile.created_at,
    nextRank: nextRank ? { name: nextRank.name, minXp: nextRank.minXp } : null,
    stats: {
      votesCount: votesRes.count ?? 0,
      argumentsCount: argumentsList.length,
      tierListsCount: tierListsList.length,
    },
    tierLists: tierListsList,
    arguments: argumentsList,
  };
}
