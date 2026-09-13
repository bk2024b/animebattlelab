import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { CharacterCard } from "@/components/character/CharacterCard";
import { getCharactersList } from "@/lib/queries/characters";
import { getPublishedAnime } from "@/lib/queries/anime";

export const metadata: Metadata = {
  title: "Anime Characters — Power Scaling Database",
  description:
    "Explore anime characters, compare their forms and stats across Naruto, Bleach, Jujutsu Kaisen, and more.",
};

export default async function CharactersPage({
  searchParams,
}: {
  searchParams: Promise<{ anime?: string; q?: string }>;
}) {
  const { anime: animeSlug, q: search } = await searchParams;

  const [characters, animeList] = await Promise.all([
    getCharactersList({ animeSlug, search }),
    getPublishedAnime(),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1 pb-24 md:pb-12">
        {/* Header banner */}
        <div className="border-b border-border bg-surface-1/40 px-6 py-10">
          <div className="mx-auto max-w-[1200px]">
            <p className="text-xs font-semibold tracking-wider text-accent uppercase">
              Character Database
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">
              Fighters & Power Scaling
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Browse characters, review forms, compare 8-attribute stats, and
              test them in battle.
            </p>

            {/* Anime Universe Filter */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Link
                href="/characters"
                className={`rounded-pill px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  !animeSlug
                    ? "bg-accent text-bg font-semibold"
                    : "border border-border bg-surface-1 text-text-secondary hover:text-text-primary"
                }`}
              >
                All Universes
              </Link>
              {animeList.map((a) => (
                <Link
                  key={a.id}
                  href={`/characters?anime=${a.slug}`}
                  className={`rounded-pill px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    animeSlug === a.slug
                      ? "bg-accent text-bg font-semibold"
                      : "border border-border bg-surface-1 text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {a.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Characters Grid */}
        <div className="mx-auto max-w-[1200px] px-6 pt-8">
          {characters.length === 0 ? (
            <div className="rounded-card border border-border bg-surface-1 p-12 text-center">
              <p className="font-display text-lg font-semibold">
                No characters found
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                No published characters match your selection.
              </p>
              <Link
                href="/characters"
                className="mt-4 inline-block rounded-pill border border-border px-4 py-2 text-xs font-medium text-text-primary hover:border-accent"
              >
                Clear filter
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {characters.map((c) => (
                <CharacterCard key={c.id} character={c} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
