import type { FighterView } from "@/lib/battle/types";

/**
 * Placeholder identity plate — gradient + initials. Real character artwork
 * is licensed IP and stays out of brand-owned surfaces (Design System §20, §58).
 * Swap the inner div for an <Image> once character portraits are sourced
 * per-anime under fair-use/attribution rules.
 */
export function FighterPlate({
  fighter,
  align = "left",
}: {
  fighter: FighterView;
  align?: "left" | "right";
}) {
  const alignmentClasses =
    align === "left"
      ? "md:items-end md:text-right"
      : "md:items-start md:text-left";

  return (
    <div
      className={`flex flex-col items-center gap-3 text-center ${alignmentClasses}`}
    >
      <div
        className="flex h-20 w-20 items-center justify-center rounded-card font-display text-2xl font-semibold text-bg md:h-28 md:w-28 md:text-3xl"
        style={{
          background: `linear-gradient(135deg, ${fighter.gradientFrom}, ${fighter.gradientTo})`,
        }}
      >
        {fighter.initials}
      </div>
      <div>
        <p className="font-display text-lg font-semibold md:text-xl">
          {fighter.name}
        </p>
        <p className="mt-0.5 text-sm text-text-secondary">
          {fighter.formName}
        </p>
        <p className="text-xs text-text-tertiary">{fighter.anime}</p>
      </div>
    </div>
  );
}
