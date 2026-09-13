import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Get Started — Anime Battle Lab",
  description: "Customize your power scaling experience and cast your first battle vote.",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding");
  }

  // Fetch published anime
  const { data: animeData } = await supabase
    .from("anime")
    .select("id, slug, name, description")
    .eq("is_published", true)
    .order("name");

  // Fetch published characters
  const { data: characterData } = await supabase
    .from("characters")
    .select("id, name, anime:anime_id ( name )")
    .eq("is_published", true)
    .limit(20);

  // Fetch sample battle for step 3
  const { data: battleData } = await supabase
    .from("battles")
    .select(`
      id, slug,
      fighter_a:character_forms!battles_fighter_a_form_id_fkey ( characters ( name ) ),
      fighter_b:character_forms!battles_fighter_b_form_id_fkey ( characters ( name ) )
    `)
    .eq("slug", "madara-vs-aizen")
    .maybeSingle();

  const characters = (characterData ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    animeName: c.anime?.name ?? "",
  }));

  const sampleBattle = battleData
    ? {
        id: battleData.id,
        slug: battleData.slug,
        fighterAName: (battleData.fighter_a as any)?.characters?.name ?? "Madara",
        fighterBName: (battleData.fighter_b as any)?.characters?.name ?? "Aizen",
      }
    : null;

  return (
    <>
      <Header />
      <main className="flex-1 pb-24 md:pb-12">
        <OnboardingWizard
          animeList={animeData ?? []}
          characters={characters}
          sampleBattle={sampleBattle}
        />
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
