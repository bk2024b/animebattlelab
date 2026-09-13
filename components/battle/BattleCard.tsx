import Link from "next/link";
import type { BattleSummary } from "@/lib/queries/battle-list";

export function BattleCard({ battle }: { battle: BattleSummary }) {
  const total = Math.max(battle.voteACount + battle.voteBCount, 1);
  const pctA = Math.round((battle.voteACount / total) * 100);

  return (
    <Link
      href={`/battles/${battle.slug}`}
      className="rounded-card border border-border bg-surface-1 p-5 transition-colors hover:border-accent/40"
    >
      <p className="text-xs text-text-tertiary">{battle.animeLabel}</p>
      <p className="mt-2 font-display text-base font-semibold">
        {battle.fighterAName} vs {battle.fighterBName}
      </p>
      <div className="mt-3 flex h-1.5 overflow-hidden rounded-pill bg-surface-2">
        <div className="h-full bg-accent" style={{ width: `${pctA}%` }} />
        <div className="h-full bg-[#7C5CFF]" style={{ width: `${100 - pctA}%` }} />
      </div>
      <p className="mt-2 text-xs text-text-tertiary">
        {total.toLocaleString()} votes
      </p>
    </Link>
  );
}
