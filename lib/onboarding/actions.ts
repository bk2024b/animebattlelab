"use server";

import { createClient } from "@/lib/supabase/server";
import { awardXp } from "@/lib/scoring/xp";

export async function completeOnboardingAction(): Promise<{ success: boolean; xpAwarded: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, xpAwarded: 0 };
  }

  // Award 10 XP for completing onboarding (PRD §23, §24, §57)
  await awardXp(supabase, user.id, 10);

  return { success: true, xpAwarded: 10 };
}
