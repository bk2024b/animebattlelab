import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { BattleCard } from "@/components/battle/BattleCard";
import { TierListCard } from "@/components/tier-list/TierListCard";
import { getBattlesList } from "@/lib/queries/battle-list";
import { getTopCharacters } from "@/lib/queries/rankings";
import { getPublicTierLists } from "@/lib/queries/tier-lists";

export default async function HomePage() {
  const [trendingBattles, topCharacters, trendingTierLists] = await Promise.all([
    getBattlesList({ sort: "popular", limit: 6 }),
    getTopCharacters(4),
    getPublicTierLists({ limit: 3 }),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* HERO — Design System §20-21 */}
        <section className="relative overflow-hidden border-b border-border px-6 py-20 md:py-32">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 0%, color-mix(in srgb, var(--color-accent) 12%, transparent), transparent)",
            }}
          />
          <div className="mx-auto flex max-w-[1200px] flex-col items-center text-center">
            <span className="rounded-pill border border-accent/40 bg-accent/10 px-3.5 py-1 text-xs font-semibold text-accent uppercase tracking-wider">
              The Anime Power Scaling Arena
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              WHO REALLY WINS?
            </h1>
            <p className="mt-5 max-w-xl text-base text-text-secondary md:text-lg">
              Debate anime matchups. Build tier lists. Defend your feats and prove
              who scales higher.
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/battles"
                className="rounded-pill bg-accent px-7 py-3.5 text-center text-sm font-semibold text-bg transition-transform hover:scale-[1.02] hover:opacity-95"
              >
                Enter Battle Arena
              </Link>
              <Link
                href="/tier-lists/create"
                className="rounded-pill border border-border bg-surface-1 px-7 py-3.5 text-center text-sm font-medium text-text-primary transition-colors hover:border-accent"
              >
                Build a Tier List
              </Link>
            </div>
          </div>
        </section>

        {/* TRENDING BATTLES */}
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                Community Matchups
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold md:text-3xl">
                Trending Battles
              </h2>
            </div>
            <Link
              href="/battles"
              className="text-xs font-semibold text-text-secondary hover:text-accent"
            >
              View all matchups →
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trendingBattles.map((b) => (
              <BattleCard key={b.slug} battle={b} />
            ))}
          </div>
        </section>

        {/* STRONGEST FIGHTERS PREVIEW */}
        <section className="border-y border-border bg-surface-1/40 py-16">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Power Scaling Rankings
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold md:text-3xl">
                  Strongest Characters
                </h2>
              </div>
              <Link
                href="/characters"
                className="text-xs font-semibold text-text-secondary hover:text-accent"
              >
                Browse all fighters →
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {topCharacters.map((c) => (
                <Link
                  key={c.id + c.defaultFormName}
                  href={`/characters/${c.slug}`}
                  className="group rounded-card border border-border bg-surface-1 p-5 transition-all hover:border-accent/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-tertiary">
                      #{c.rankPosition}
                    </span>
                    <span className="rounded-pill bg-surface-2 px-2 py-0.5 text-[10px] text-text-tertiary">
                      {c.animeName}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold group-hover:text-accent">
                    {c.name}
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {c.defaultFormName}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                    <span className="text-text-tertiary">Power Score</span>
                    <span className="font-display font-bold text-accent">
                      {c.powerScore} / 100
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* TRENDING TIER LISTS */}
        {trendingTierLists.length > 0 && (
          <section className="mx-auto max-w-[1200px] px-6 py-16">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Community Creations
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold md:text-3xl">
                  Trending Tier Lists
                </h2>
              </div>
              <Link
                href="/tier-lists"
                className="text-xs font-semibold text-text-secondary hover:text-accent"
              >
                Explore all tier lists →
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trendingTierLists.map((tl) => (
                <TierListCard key={tl.id} tierList={tl} />
              ))}
            </div>
          </section>
        )}

        {/* CALL TO ACTION */}
        <section className="mx-auto max-w-[1200px] px-6 pb-20">
          <div className="rounded-card border border-border bg-gradient-to-br from-surface-1 via-surface-2 to-surface-1 p-8 text-center md:p-14">
            <h2 className="font-display text-2xl font-bold md:text-4xl">
              Ready to prove who scales higher?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-text-secondary">
              Join debates, predict winners, climb from Academy to Legend rank,
              and build your power scaling reputation.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-pill bg-accent px-8 py-3.5 text-sm font-semibold text-bg hover:opacity-90"
              >
                Create an Account
              </Link>
              <Link
                href="/battles"
                className="rounded-pill border border-border px-8 py-3.5 text-sm font-medium text-text-primary hover:border-accent"
              >
                Browse Battles
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
