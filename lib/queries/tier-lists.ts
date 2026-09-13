import { createClient } from "@/lib/supabase/server";
import { gradientFor, initialsFor } from "@/lib/characters/appearance";

export type TierListItemView = {
  id: string;
  name: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
};

export type TierListView = {
  title: string;
  description: string | null;
  username: string;
  animeLabel: string | null;
  tiers: { id: string; name: string; items: TierListItemView[] }[];
};

export type TierListSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  username: string;
  userRank: string;
  animeName: string | null;
  animeSlug: string | null;
  itemCount: number;
  topFighters: { name: string; initials: string; gradientFrom: string; gradientTo: string }[];
  createdAt: string;
};

export async function getPublicTierLists(params?: {
  animeSlug?: string;
  limit?: number;
}): Promise<TierListSummary[]> {
  const supabase = await createClient();

  let query = supabase
    .from("tier_lists")
    .select(`
      id, slug, title, description, created_at,
      profiles:user_id ( username, rank ),
      anime:anime_id ( name, slug ),
      tier_list_tiers (
        id, name, position,
        tier_list_items (
          position,
          character_forms ( id, name, characters ( name ) )
        )
      )
    `)
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(params?.limit ?? 30);

  if (params?.animeSlug) {
    const { data: a } = await supabase
      .from("anime")
      .select("id")
      .eq("slug", params.animeSlug)
      .single();
    if (a) {
      query = query.eq("anime_id", a.id);
    }
  }

  const { data } = await query;

  return (data ?? []).map((tl: any) => {
    const tiers = (tl.tier_list_tiers ?? []).sort((a: any, b: any) => a.position - b.position);
    let totalItems = 0;
    const topFighters: { name: string; initials: string; gradientFrom: string; gradientTo: string }[] = [];

    for (const tier of tiers) {
      const items = (tier.tier_list_items ?? []).sort((a: any, b: any) => a.position - b.position);
      totalItems += items.length;
      if (topFighters.length < 4) {
        for (const it of items) {
          if (topFighters.length >= 4) break;
          const form = it.character_forms;
          const name = form?.characters?.name ?? form?.name ?? "?";
          const [gradientFrom, gradientTo] = gradientFor(form?.id ?? name);
          topFighters.push({ name, initials: initialsFor(name), gradientFrom, gradientTo });
        }
      }
    }

    return {
      id: tl.id,
      slug: tl.slug,
      title: tl.title,
      description: tl.description,
      username: tl.profiles?.username ?? "scaler",
      userRank: tl.profiles?.rank ?? "Academy",
      animeName: tl.anime?.name ?? null,
      animeSlug: tl.anime?.slug ?? null,
      itemCount: totalItems,
      topFighters,
      createdAt: tl.created_at,
    };
  });
}

export async function getTierListByUsernameAndSlug(
  username: string,
  slug: string,
): Promise<TierListView | null> {
  const supabase = await createClient();

  const { data: tierList } = await supabase
    .from("tier_lists")
    .select(
      `
      title, description, visibility,
      profiles!inner ( username ),
      anime ( name ),
      tier_list_tiers (
        id, name, position,
        tier_list_items (
          position,
          character_forms ( id, name, characters ( name ) )
        )
      )
    `,
    )
    .eq("profiles.username", username)
    .eq("slug", slug)
    .single();

  if (!tierList) return null;

  const tiers = ((tierList as any).tier_list_tiers ?? [])
    .sort((a: any, b: any) => a.position - b.position)
    .map((tier: any) => ({
      id: tier.id,
      name: tier.name,
      items: (tier.tier_list_items ?? [])
        .sort((a: any, b: any) => a.position - b.position)
        .map((item: any) => {
          const form = item.character_forms;
          const name = form?.characters?.name ?? form?.name ?? "?";
          const [gradientFrom, gradientTo] = gradientFor(form?.id ?? name);
          return {
            id: form?.id,
            name,
            initials: initialsFor(name),
            gradientFrom,
            gradientTo,
          };
        }),
    }));

  return {
    title: (tierList as any).title,
    description: (tierList as any).description,
    username,
    animeLabel: (tierList as any).anime?.name ?? null,
    tiers,
  };
}
