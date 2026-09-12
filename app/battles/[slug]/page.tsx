import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { FighterPlate } from "@/components/battle/FighterPlate";
import { VotePanel } from "@/components/battle/VotePanel";
import { ConditionsPanel } from "@/components/battle/ConditionsPanel";
import { StatComparison } from "@/components/battle/StatComparison";
import { DebateSection } from "@/components/battle/DebateSection";
import { RelatedBattles } from "@/components/battle/RelatedBattles";
import { getBattleBySlug } from "@/lib/queries/battles";
import { createClient } from "@/lib/supabase/server";

// This route reads the session cookie (for vote state + auth-gated actions),
// which makes it dynamically rendered by default — Next.js opts out of the
// static cache automatically the moment cookies() is touched downstream.
// Battle *content* (fighters/stats) barely changes, so a later optimization
// is to split that into a cached query and keep only vote state dynamic
// (PRD §56 cache architecture).

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const battle = await getBattleBySlug(slug);
  if (!battle) return {};

  const title = `${battle.fighterA.name} vs ${battle.fighterB.name} — Who Wins?`;
  const description = `Compare ${battle.fighterA.name} and ${battle.fighterB.name}, vote for the winner, and join the community debate.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
  };
}

export default async function BattlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const battle = await getBattleBySlug(slug);
  if (!battle) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Header />
      <main className="flex-1 pb-24 md:pb-0">
        {/* Breadcrumb — SEO internal linking, Design System §65 */}
        <nav
          aria-label="Breadcrumb"
          className="mx-auto max-w-[720px] px-6 pt-6 text-xs text-text-tertiary"
        >
          <Link href="/" className="hover:text-text-secondary">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <Link href="/battles" className="hover:text-text-secondary">
            Battles
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-text-secondary">
            {battle.fighterA.name} vs {battle.fighterB.name}
          </span>
        </nav>

        {/* Fighters hero */}
        <section className="relative overflow-hidden px-6 py-10 md:py-14">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(90deg, color-mix(in srgb, #22D07A 8%, transparent), transparent 50%, color-mix(in srgb, #7C5CFF 8%, transparent))",
            }}
          />
          <p className="text-center text-xs text-text-tertiary">
            {battle.animeLabel}
          </p>
          <div className="mx-auto mt-4 grid max-w-[640px] grid-cols-[1fr_auto_1fr] items-center gap-4">
            <FighterPlate fighter={battle.fighterA} align="left" />
            <span className="font-display text-sm font-semibold text-text-tertiary">
              VS
            </span>
            <FighterPlate fighter={battle.fighterB} align="right" />
          </div>
        </section>

        <VotePanel battle={battle} isAuthenticated={!!user} />
        <ConditionsPanel conditions={battle.conditions} />
        <StatComparison battle={battle} />
        <DebateSection battle={battle} isAuthenticated={!!user} />
        <RelatedBattles battles={battle.relatedBattles} />
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
