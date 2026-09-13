import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { BattleCard } from "@/components/battle/BattleCard";
import { getBattlesList, type BattleSort } from "@/lib/queries/battle-list";
import { getPublishedAnime } from "@/lib/queries/anime";

export const metadata: Metadata = {
  title: "Anime Battles — Power Scaling Arena",
  description:
    "Explore community anime matchups, vote on the winner and join the power scaling debates.",
};

const SORT_OPTIONS: { label: string; value: BattleSort }[] = [
  { label: "Popular", value: "popular" },
  { label: "Recent", value: "recent" },
  { label: "Controversial", value: "controversial" },
];

export default async function BattlesPage({
  searchParams,
}: {
  searchParams: Promise<{ anime?: string; sort?: string }>;
}) {
  const { anime: animeSlug, sort: rawSort } = await searchParams;
  const sort: BattleSort =
    rawSort === "recent" || rawSort === "controversial" ? rawSort : "popular";

  const [battles, animeList] = await Promise.all([
    getBattlesList({ animeSlug, sort, limit: 30 }),
    getPublishedAnime(),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1 pb-24 md:pb-12">
        {/* Page Header */}
        <div className="border-b border-border bg-surface-1/40 px-6 py-10">
          <div className="mx-auto max-w-[1200px]">
            <p className="text-xs font-semibold tracking-wider text-accent uppercase">
              Battle Arena
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">
              Anime Matchups
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Vote on community battles, compare stats, and defend your scaling
              arguments.
            </p>

            {/* Filters bar */}
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Anime pills */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/battles?sort=${sort}`}
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
                    href={`/battles?anime=${a.slug}&sort=${sort}`}
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

              {/* Sort selector */}
              <div className="flex items-center gap-1 rounded-pill border border-border bg-surface-1 p-1">
                {SORT_OPTIONS.map((opt) => (
                  <Link
                    key={opt.value}
                    href={`/battles?${animeSlug ? `anime=${animeSlug}&` : ""}sort=${opt.value}`}
                    className={`rounded-pill px-3 py-1 text-xs font-medium transition-colors ${
                      sort === opt.value
                        ? "bg-surface-3 text-text-primary font-semibold"
                        : "text-text-tertiary hover:text-text-secondary"
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Battles Grid */}
        <div className="mx-auto max-w-[1200px] px-6 pt-8">
          {battles.length === 0 ? (
            <div className="rounded-card border border-border bg-surface-1 p-12 text-center">
              <p className="font-display text-lg font-semibold">
                No matchups found
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                There are no published battles matching these criteria yet.
              </p>
              <Link
                href="/battles"
                className="mt-4 inline-block rounded-pill border border-border px-4 py-2 text-xs font-medium text-text-primary hover:border-accent"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {battles.map((b) => (
                <BattleCard key={b.slug} battle={b} />
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
