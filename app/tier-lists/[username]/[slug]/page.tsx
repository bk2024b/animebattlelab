import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { getTierListByUsernameAndSlug } from "@/lib/queries/tier-lists";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}): Promise<Metadata> {
  const { username, slug } = await params;
  const tierList = await getTierListByUsernameAndSlug(username, slug);
  if (!tierList) return {};
  return {
    title: tierList.title,
    description: tierList.description ?? `A tier list by @${username}.`,
  };
}

export default async function TierListPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const tierList = await getTierListByUsernameAndSlug(username, slug);
  if (!tierList) notFound();

  return (
    <>
      <Header />
      <main className="flex-1 pb-24 md:pb-10">
        <div className="mx-auto max-w-[720px] px-6 py-10">
          <p className="text-xs text-text-tertiary">
            {tierList.animeLabel} · by @{username}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold md:text-3xl">
            {tierList.title}
          </h1>
          {tierList.description && (
            <p className="mt-2 text-sm text-text-secondary">
              {tierList.description}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2">
            {tierList.tiers.map((tier) => (
              <div
                key={tier.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface-1 p-3"
              >
                <span className="flex w-14 shrink-0 items-center justify-center rounded-md bg-surface-2 py-1.5 text-center text-sm font-semibold">
                  {tier.name}
                </span>
                <div className="flex flex-1 flex-wrap gap-2">
                  {tier.items.map((item) => (
                    <span
                      key={item.id}
                      className="flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2 py-1 text-xs"
                    >
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded text-[9px] font-semibold text-bg"
                        style={{
                          background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                        }}
                      >
                        {item.initials}
                      </span>
                      {item.name}
                    </span>
                  ))}
                  {tier.items.length === 0 && (
                    <span className="text-xs text-text-tertiary">Empty</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
