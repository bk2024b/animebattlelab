import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { TierListCard } from "@/components/tier-list/TierListCard";
import { getPublicTierLists } from "@/lib/queries/tier-lists";
import { getPublishedAnime } from "@/lib/queries/anime";

export const metadata: Metadata = {
  title: "Anime Tier Lists — Power Scaling Rankings",
  description:
    "Browse community tier lists, see who scales S+ tier, and build your own anime rankings.",
};

export default async function TierListsPage({
  searchParams,
}: {
  searchParams: Promise<{ anime?: string }>;
}) {
  const { anime: animeSlug } = await searchParams;

  const [tierLists, animeList] = await Promise.all([
    getPublicTierLists({ animeSlug, limit: 30 }),
    getPublishedAnime(),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1 pb-24 md:pb-12">
        {/* Banner */}
        <div className="border-b border-border bg-surface-1/40 px-6 py-10">
          <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold tracking-wider text-accent uppercase">
                Tier Lists
              </p>
              <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">
                Community Power Rankings
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Rank your favorite anime characters from S+ to D and share your
                scaling with the community.
              </p>
            </div>

            <Link
              href="/tier-lists/create"
              className="inline-flex shrink-0 items-center justify-center rounded-pill bg-accent px-6 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
            >
              + Create a Tier List
            </Link>
          </div>

          {/* Anime Filter */}
          <div className="mx-auto mt-6 flex max-w-[1200px] flex-wrap items-center gap-2">
            <Link
              href="/tier-lists"
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
                href={`/tier-lists?anime=${a.slug}`}
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

        {/* Tier Lists Grid */}
        <div className="mx-auto max-w-[1200px] px-6 pt-8">
          {tierLists.length === 0 ? (
            <div className="rounded-card border border-border bg-surface-1 p-12 text-center">
              <p className="font-display text-lg font-semibold">
                No tier lists yet
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Be the first to create and publish a power scaling tier list!
              </p>
              <Link
                href="/tier-lists/create"
                className="mt-4 inline-block rounded-pill bg-accent px-5 py-2 text-xs font-semibold text-bg hover:opacity-90"
              >
                Build the first tier list
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tierLists.map((tl) => (
                <TierListCard key={tl.id} tierList={tl} />
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
