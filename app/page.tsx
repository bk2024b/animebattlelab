import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* HERO — Design System §20-21 */}
        <section className="relative overflow-hidden border-b border-border px-6 py-20 md:py-36">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 0%, color-mix(in srgb, var(--color-accent) 10%, transparent), transparent)",
            }}
          />
          <div className="mx-auto flex max-w-[1200px] flex-col items-center text-center">
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              WHO REALLY WINS?
            </h1>
            <p className="mt-5 max-w-xl text-base text-text-secondary md:text-lg">
              Debate anime matchups. Build tier lists. Prove your scaling.
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/battles"
                className="rounded-pill bg-accent px-6 py-3 text-center text-sm font-semibold text-bg hover:opacity-90"
              >
                Start a Battle
              </Link>
              <Link
                href="/characters"
                className="rounded-pill border border-border px-6 py-3 text-center text-sm font-medium text-text-primary hover:border-accent/50"
              >
                Explore Characters
              </Link>
            </div>
          </div>
        </section>

        {/* TRENDING BATTLES */}
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <h2 className="font-display text-xl font-semibold md:text-2xl">
            Trending Battles
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/battles/madara-vs-aizen"
              className="rounded-card border border-border bg-surface-1 p-5 transition-colors hover:border-accent/40"
            >
              <p className="text-xs text-text-tertiary">Naruto × Bleach</p>
              <p className="mt-2 font-display text-base font-semibold">
                Madara vs Aizen
              </p>
              <div className="mt-3 flex h-1.5 overflow-hidden rounded-pill bg-surface-2">
                <div className="h-full w-[38%] bg-accent" />
                <div className="h-full w-[62%] bg-[#7C5CFF]" />
              </div>
              <p className="mt-2 text-xs text-text-tertiary">
                2,481 votes · High diff
              </p>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
