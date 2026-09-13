"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { awardXp } from "@/lib/scoring/xp";

export type PublishTierListState = { error: string | null };

export type TierPayload = {
  name: string;
  position: number;
  items: { characterFormId: string; position: number }[];
};

export async function publishTierListAction(payload: {
  title: string;
  description: string;
  animeId: string;
  visibility: "public" | "unlisted" | "private";
  tiers: TierPayload[];
}): Promise<PublishTierListState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "not_authenticated" };
  }

  if (!payload.title.trim()) {
    return { error: "Give your tier list a title." };
  }

  const hasAnyItem = payload.tiers.some((t) => t.items.length > 0);
  if (!hasAnyItem) {
    return { error: "Place at least one character before publishing." };
  }

  // Single round trip, atomic — see create_tier_list() in
  // supabase/migrations/20260913000000_battle_listing_and_tier_list_rpc.sql
  const { data, error } = await supabase.rpc("create_tier_list", {
    p_title: payload.title,
    p_description: payload.description || null,
    p_anime_id: payload.animeId,
    p_visibility: payload.visibility,
    p_tiers: payload.tiers.map((t) => ({
      name: t.name,
      position: t.position,
      items: t.items.map((i) => ({
        character_form_id: i.characterFormId,
        position: i.position,
      })),
    })),
  });

  if (error || !data || data.length === 0) {
    return { error: error?.message ?? "Something went wrong." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("user_id", user.id)
    .single();

  const slug = data[0].slug;

  // Award 15 XP for publishing a tier list (PRD §23)
  await awardXp(supabase, user.id, 15);

  redirect(`/tier-lists/${profile?.username}/${slug}`);
}
