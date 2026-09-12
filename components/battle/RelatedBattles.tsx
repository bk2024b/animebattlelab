import Link from "next/link";
import type { BattleView } from "@/lib/battle/types";

export function RelatedBattles({
  battles,
}: {
  battles: BattleView["relatedBattles"];
}) {
  return (
    <section className="mx-auto max-w-[720px] px-6 py-10">
      <h2 className="font-display text-xl font-semibold md:text-2xl">
        Related battles
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {battles.map((b) => (
          <Link
            key={b.slug}
            href={`/battles/${b.slug}`}
            className="rounded-card border border-border bg-surface-1 p-4 transition-colors hover:border-accent/40"
          >
            <p className="text-sm font-medium">{b.label}</p>
            <p className="mt-1 text-xs text-text-tertiary">
              {b.votes.toLocaleString()} votes
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
