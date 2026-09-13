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
