import Link from "next/link";
import type { CharacterSummary } from "@/lib/queries/characters";

export function CharacterCard({ character }: { character: CharacterSummary }) {
  return (
    <Link
      href={`/characters/${character.slug}`}
      className="group flex flex-col justify-between rounded-card border border-border bg-surface-1 p-5 transition-all hover:border-accent/50 hover:bg-surface-2/60"
    >
      <div>
        <div className="flex items-center gap-3">
          {/* Avatar plate */}
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold text-white shadow-inner"
            style={{
              background: `linear-gradient(135deg, ${character.gradientFrom}, ${character.gradientTo})`,
            }}
          >
            {character.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-semibold text-text-primary group-hover:text-accent">
              {character.name}
            </p>
            <p className="text-xs text-text-tertiary">{character.animeName}</p>
          </div>
        </div>

        <p className="mt-3 text-xs text-text-secondary">
          Form: <span className="text-text-primary font-medium">{character.defaultFormName}</span>
        </p>
      </div>

      {/* Mini Stat preview */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-center">
        <div>
          <span className="block text-[10px] text-text-tertiary uppercase">Power</span>
          <span className="font-display text-xs font-semibold text-text-primary">
            {character.powerScore}
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-text-tertiary uppercase">Speed</span>
          <span className="font-display text-xs font-semibold text-text-primary">
            {character.speedScore}
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-text-tertiary uppercase">Hax</span>
          <span className="font-display text-xs font-semibold text-accent">
            {character.haxScore}
          </span>
        </div>
      </div>
    </Link>
  );
}
