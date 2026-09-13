import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { getTopScalers, getTopCharacters } from "@/lib/queries/rankings";

export const metadata: Metadata = {
  title: "Leaderboards & Rankings — Anime Battle Lab",
  description:
    "Explore the top power scalers, ranking leaderboards, and the strongest characters across all anime universes.",
};

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "scalers" } = await searchParams;

  const [scalers, characters] = await Promise.all([
    getTopScalers(50),
    getTopCharacters(25),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1 pb-24 md:pb-12">
        {/* Banner */}
        <div className="border-b border-border bg-surface-1/40 px-6 py-10">
          <div className="mx-auto max-w-[1200px]">
            <p className="text-xs font-semibold tracking-wider text-accent uppercase">
              Hall of Fame
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">
              Power Scalers & Rankings
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Community standings, top debate analysts, and overall character
              scaling power.
            </p>

            {/* Tab switch */}
            <div className="mt-6 flex items-center gap-2">
              <Link
                href="/rankings?tab=scalers"
                className={`rounded-pill px-5 py-2 text-xs font-semibold transition-colors ${
                  tab === "scalers"
                    ? "bg-accent text-bg"
                    : "border border-border bg-surface-1 text-text-secondary hover:text-text-primary"
                }`}
              >
                Top Power Scalers
              </Link>
              <Link
                href="/rankings?tab=characters"
                className={`rounded-pill px-5 py-2 text-xs font-semibold transition-colors ${
                  tab === "characters"
                    ? "bg-accent text-bg"
                    : "border border-border bg-surface-1 text-text-secondary hover:text-text-primary"
                }`}
              >
                Strongest Characters
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-[1200px] px-6 pt-8">
          {tab === "scalers" && (
            <div className="overflow-hidden rounded-card border border-border bg-surface-1">
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 border-b border-border/80 bg-surface-2/60 px-6 py-3 text-xs font-semibold text-text-tertiary uppercase">
                <span>#</span>
                <span>Power Scaler</span>
                <span className="hidden sm:inline">Rank</span>
                <span className="text-right">Total XP</span>
              </div>

              {scalers.length === 0 ? (
                <div className="p-12 text-center text-xs text-text-tertiary">
                  No scalers ranked yet. Be the first by registering and voting!
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {scalers.map((s) => (
                    <Link
                      key={s.userId}
                      href={`/users/${s.username}`}
                      className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-surface-2/60"
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          s.rankPosition === 1
                            ? "bg-[#F5B942] text-bg"
                            : s.rankPosition === 2
                            ? "bg-text-secondary text-bg"
                            : s.rankPosition === 3
                            ? "bg-[#CD7F32] text-bg"
                            : "text-text-tertiary"
                        }`}
                      >
                        {s.rankPosition}
                      </span>
                      <div>
                        <p className="font-display text-sm font-semibold text-text-primary">
                          {s.displayName ?? s.username}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          @{s.username}
                        </p>
                      </div>
                      <span className="hidden sm:inline rounded-pill border border-border bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-accent">
                        {s.rank}
                      </span>
                      <span className="text-right font-display text-sm font-bold text-accent">
                        {s.xp.toLocaleString()} XP
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "characters" && (
            <div className="overflow-hidden rounded-card border border-border bg-surface-1">
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 border-b border-border/80 bg-surface-2/60 px-6 py-3 text-xs font-semibold text-text-tertiary uppercase">
                <span>#</span>
                <span>Fighter</span>
                <span className="hidden sm:inline">Universe</span>
                <span className="text-right">Power Score</span>
              </div>

              <div className="divide-y divide-border/60">
                {characters.map((c) => (
                  <Link
                    key={c.id + c.defaultFormName}
                    href={`/characters/${c.slug}`}
                    className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-surface-2/60"
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        c.rankPosition === 1
                          ? "bg-[#F5B942] text-bg"
                          : c.rankPosition === 2
                          ? "bg-text-secondary text-bg"
                          : c.rankPosition === 3
                          ? "bg-[#CD7F32] text-bg"
                          : "text-text-tertiary"
                      }`}
                    >
                      {c.rankPosition}
                    </span>
                    <div>
                      <p className="font-display text-sm font-semibold text-text-primary">
                        {c.name}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {c.defaultFormName}
                      </p>
                    </div>
                    <span className="hidden sm:inline text-xs text-text-secondary">
                      {c.animeName}
                    </span>
                    <div className="text-right">
                      <span className="font-display text-sm font-bold text-accent">
                        {c.powerScore}
                      </span>
                      <span className="text-[10px] text-text-tertiary block sm:inline sm:ml-1">
                        / 100
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
