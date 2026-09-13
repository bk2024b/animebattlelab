"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardXp } from "@/lib/scoring/xp";

export type BattleActionState = { error: string | null };

const DIFFICULTIES = [
  "no_diff",
  "low_diff",
  "mid_diff",
  "high_diff",
  "extreme_diff",
] as const;

export async function castVoteAction(
  battleId: string,
  battleSlug: string,
  fighterChoice: "a" | "b" | "draw",
  difficulty: (typeof DIFFICULTIES)[number] | null,
): Promise<BattleActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "not_authenticated" };
  }

  // Unique (battle_id, user_id) constraint means a second vote from the same
  // user updates their existing choice rather than creating a duplicate row.
  const { error } = await supabase.from("battle_votes").upsert(
    {
      battle_id: battleId,
      user_id: user.id,
      fighter_choice: fighterChoice,
      difficulty,
    },
    { onConflict: "battle_id,user_id" },
  );

  if (error) {
    return { error: error.message };
  }

  // Award 2 XP on vote (PRD §23)
  await awardXp(supabase, user.id, 2);

  revalidatePath(`/battles/${battleSlug}`);
  return { error: null };
}

export async function submitArgumentAction(
  battleId: string,
  battleSlug: string,
  content: string,
  fighterChoice: "a" | "b",
): Promise<BattleActionState> {
  const trimmed = content.trim();
  if (trimmed.length < 1 || trimmed.length > 1500) {
    return { error: "Argument must be between 1 and 1500 characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "not_authenticated" };
  }

  const { error } = await supabase.from("arguments").insert({
    battle_id: battleId,
    user_id: user.id,
    content: trimmed,
    fighter_choice: fighterChoice,
  });

  if (error) {
    return { error: error.message };
  }

  // Award 10 XP for publishing an argument (PRD §23)
  await awardXp(supabase, user.id, 10);

  revalidatePath(`/battles/${battleSlug}`);
  return { error: null };
}

export async function voteOnArgumentAction(
  argumentId: string,
  battleSlug: string,
  vote: 1 | -1,
): Promise<BattleActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "not_authenticated" };
  }

  const { error } = await supabase.from("argument_votes").upsert(
    { argument_id: argumentId, user_id: user.id, vote },
    { onConflict: "argument_id,user_id" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/battles/${battleSlug}`);
  return { error: null };
}
