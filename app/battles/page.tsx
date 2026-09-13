import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { TierListBuilder } from "@/components/tier-list/TierListBuilder";
import { getPublishedAnime } from "@/lib/queries/anime";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Create a Tier List",
  description: "Build and publish your own anime power scaling tier list.",
};

export default async function CreateTierListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/tier-lists/create");
  }

  const animeOptions = await getPublishedAnime();

  return (
    <>
      <Header />
      <main className="flex-1 pb-24 md:pb-10">
        <div className="mx-auto max-w-[900px] px-6 py-10">
          <h1 className="font-display text-3xl font-semibold">
            Create a tier list
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Pick an anime, drag characters into tiers, publish.
          </p>
          <TierListBuilder animeOptions={animeOptions} />
        </div>
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
