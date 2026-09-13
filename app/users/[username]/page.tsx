import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { getUserProfile } from "@/lib/queries/profiles";
import { initialsFor } from "@/lib/characters/appearance";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await getUserProfile(username);
  if (!profile) return {};

  return {
    title: `@${profile.username} — ${profile.rank} Power Scaler`,
    description: `Check out @${profile.username}'s anime power scaling profile, tier lists, and battle debate arguments on Anime Battle Lab.`,
  };
}

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { username } = await params;
  const { tab = "tier-lists" } = await searchParams;
  const profile = await getUserProfile(username);

  if (!profile) {
    notFound();
  }

  const initials = initialsFor(profile.displayName ?? profile.username);

  // Progress to next rank
  const xpCurrent = profile.xp;
  const xpTarget = profile.nextRank?.minXp ?? 10000;
  const progressPct = Math.min(100, Math.round((xpCurrent / xpTarget) * 100));

  return (
    <>
      <Header />
      <main className="flex-1 pb-24 md:pb-12">
        <div className="mx-auto max-w-[960px] px-6 py-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-text-tertiary">
            <Link href="/" className="hover:text-text-secondary">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <Link href="/rankings" className="hover:text-text-secondary">
              Scalers
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-text-secondary">@{profile.username}</span>
          </nav>

          {/* Player Card (Design System §46-47) */}
          <div className="mt-6 rounded-card border border-border bg-surface-1 p-6 md:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                {/* Avatar plate */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/30 to-[#7C5CFF]/30 font-display text-2xl font-bold text-accent border border-accent/40 shadow-inner">
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-pill bg-accent px-2.5 py-0.5 text-xs font-bold text-bg uppercase tracking-wide">
                      {profile.rank}
                    </span>
                    {profile.role !== "user" && (
                      <span className="rounded-pill bg-surface-3 px-2 py-0.5 text-[10px] font-medium text-text-tertiary uppercase">
                        {profile.role}
                      </span>
                    )}
                  </div>
                  <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
                    {profile.displayName ?? profile.username}
                  </h1>
                  <p className="text-xs text-text-tertiary">
                    @{profile.username} · Member since{" "}
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* XP Pill */}
              <div className="rounded-xl border border-border bg-surface-2 p-4 text-center sm:text-right">
                <span className="block text-xs text-text-tertiary uppercase tracking-wider">
                  Power XP
                </span>
                <span className="font-display text-2xl font-bold text-accent">
                  {profile.xp.toLocaleString()} XP
                </span>
              </div>
            </div>

            {/* Next rank progression bar */}
            {profile.nextRank && (
              <div className="mt-6 border-t border-border/60 pt-4">
                <div className="flex justify-between text-xs text-text-tertiary">
                  <span>
                    Current: <strong>{profile.rank}</strong>
                  </span>
                  <span>
                    Next Rank:{" "}
                    <strong className="text-text-primary">
                      {profile.nextRank.name} ({profile.nextRank.minXp} XP)
                    </strong>
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-pill bg-surface-2">
                  <div
                    className="h-full rounded-pill bg-accent transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Profile Statistics Counter Grid */}
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border/60 pt-5 text-center">
              <div className="rounded-lg bg-surface-2/60 p-3">
                <span className="block font-display text-xl font-bold text-text-primary">
                  {profile.stats.votesCount}
                </span>
                <span className="text-[11px] text-text-tertiary uppercase">
                  Battles Voted
                </span>
              </div>
              <div className="rounded-lg bg-surface-2/60 p-3">
                <span className="block font-display text-xl font-bold text-text-primary">
                  {profile.stats.argumentsCount}
                </span>
                <span className="text-[11px] text-text-tertiary uppercase">
                  Debate Arguments
                </span>
              </div>
              <div className="rounded-lg bg-surface-2/60 p-3">
                <span className="block font-display text-xl font-bold text-text-primary">
                  {profile.stats.tierListsCount}
                </span>
                <span className="text-[11px] text-text-tertiary uppercase">
                  Tier Lists
                </span>
              </div>
            </div>
          </div>

          {/* Activity Tabs */}
          <div className="mt-10">
            <div className="flex border-b border-border text-sm">
              <Link
                href={`/users/${profile.username}?tab=tier-lists`}
                className={`border-b-2 px-6 py-3 font-medium transition-colors ${
                  tab === "tier-lists"
                    ? "border-accent text-text-primary font-semibold"
                    : "border-transparent text-text-tertiary hover:text-text-secondary"
                }`}
              >
                Tier Lists ({profile.tierLists.length})
              </Link>
              <Link
                href={`/users/${profile.username}?tab=arguments`}
                className={`border-b-2 px-6 py-3 font-medium transition-colors ${
                  tab === "arguments"
                    ? "border-accent text-text-primary font-semibold"
                    : "border-transparent text-text-tertiary hover:text-text-secondary"
                }`}
              >
                Arguments & Debates ({profile.arguments.length})
              </Link>
            </div>

            {/* Tab: Tier Lists */}
            {tab === "tier-lists" && (
              <div className="pt-6">
                {profile.tierLists.length === 0 ? (
                  <div className="rounded-card border border-border bg-surface-1 p-8 text-center text-xs text-text-tertiary">
                    No public tier lists created yet.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {profile.tierLists.map((tl) => (
                      <Link
                        key={tl.id}
                        href={`/tier-lists/${profile.username}/${tl.slug}`}
                        className="rounded-card border border-border bg-surface-1 p-5 transition-colors hover:border-accent/40"
                      >
                        <p className="text-xs text-text-tertiary">
                          {tl.animeName ?? "Anime"}
                        </p>
                        <p className="mt-1 font-display text-base font-semibold">
                          {tl.title}
                        </p>
                        <p className="mt-3 text-xs text-text-secondary">
                          Published{" "}
                          {new Date(tl.createdAt).toLocaleDateString()}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Arguments */}
            {tab === "arguments" && (
              <div className="pt-6 space-y-3">
                {profile.arguments.length === 0 ? (
                  <div className="rounded-card border border-border bg-surface-1 p-8 text-center text-xs text-text-tertiary">
                    No debate arguments published yet.
                  </div>
                ) : (
                  profile.arguments.map((arg) => (
                    <div
                      key={arg.id}
                      className="rounded-card border border-border bg-surface-1 p-5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <Link
                          href={`/battles/${arg.battleSlug}`}
                          className="font-display font-semibold text-text-primary hover:text-accent"
                        >
                          {arg.battleTitle}
                        </Link>
                        <span className="text-accent font-semibold">
                          ↑ {arg.upvotes} upvotes
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-text-secondary leading-relaxed">
                        &ldquo;{arg.content}&rdquo;
                      </p>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-text-tertiary">
                        <span>Voted for Fighter {arg.fighterChoice.toUpperCase()}</span>
                        <span>{new Date(arg.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
