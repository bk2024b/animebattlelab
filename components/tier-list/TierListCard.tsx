import Link from "next/link";
import type { TierListSummary } from "@/lib/queries/tier-lists";

export function TierListCard({ tierList }: { tierList: TierListSummary }) {
  return (
    <Link
      href={`/tier-lists/${tierList.username}/${tierList.slug}`}
      className="group flex flex-col justify-between rounded-card border border-border bg-surface-1 p-5 transition-all hover:border-accent/40 hover:bg-surface-2/60"
    >
      <div>
        <div className="flex items-center justify-between text-xs text-text-tertiary">
          <span>{tierList.animeName ?? "Anime"}</span>
          <span className="rounded-pill bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
            {tierList.userRank}
          </span>
        </div>

        <h3 className="mt-2 font-display text-base font-semibold text-text-primary group-hover:text-accent">
          {tierList.title}
        </h3>

        {tierList.description && (
          <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
            {tierList.description}
          </p>
        )}

        {/* Top tier fighter preview chips */}
        <div className="mt-4 flex items-center gap-1.5 overflow-hidden">
          {tierList.topFighters.map((f, i) => (
            <div
              key={i}
              title={f.name}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${f.gradientFrom}, ${f.gradientTo})`,
              }}
            >
              {f.initials}
            </div>
          ))}
          {tierList.itemCount > tierList.topFighters.length && (
            <span className="text-[11px] text-text-tertiary">
              +{tierList.itemCount - tierList.topFighters.length}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-text-tertiary">
        <span>by @{tierList.username}</span>
        <span>{tierList.itemCount} ranked</span>
      </div>
    </Link>
  );
}
