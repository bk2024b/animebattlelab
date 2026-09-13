import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { CharacterProfileView } from "@/components/character/CharacterProfileView";
import { getCharacterDetail } from "@/lib/queries/characters";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const character = await getCharacterDetail(slug);
  if (!character) return {};

  const title = `${character.name} — Power Scaling, Stats & Matchups`;
  const description = `Explore ${character.name} (${character.animeName}) power scaling stats, abilities, forms, and combat history.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
    },
  };
}

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const character = await getCharacterDetail(slug);

  if (!character) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="flex-1 pb-24 md:pb-12">
        <CharacterProfileView character={character} />
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
