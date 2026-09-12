import { STAT_LABELS, type MockBattle } from "@/lib/mock/battle";

export function StatComparison({ battle }: { battle: MockBattle }) {
  const { fighterA, fighterB } = battle;

  return (
    <section className="mx-auto max-w-[720px] px-6 py-10">
      <h2 className="font-display text-xl font-semibold md:text-2xl">
        Head to head
      </h2>

      {/* Desktop: two-column table with comparative bars */}
      <div className="mt-6 hidden md:block">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-6 gap-y-4 text-sm">
          <span className="text-right font-medium text-text-secondary">
            {fighterA.name.split(" ")[0]}
          </span>
          <span />
          <span className="text-left font-medium text-text-secondary">
            {fighterB.name.split(" ")[0]}
          </span>

          {STAT_LABELS.map(({ key, label }) => {
            const a = fighterA.stats[key];
            const b = fighterB.stats[key];
            const max = Math.max(a, b, 1);
            return (
              <div key={key} className="contents">
                <div className="flex items-center justify-end gap-2">
                  <span className="tabular-nums">{a}</span>
                  <div className="h-1.5 w-24 overflow-hidden rounded-pill bg-surface-2">
                    <div
                      className="ml-auto h-full rounded-pill bg-accent"
                      style={{ width: `${(a / max) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-text-tertiary">{label}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-pill bg-surface-2">
                    <div
                      className="h-full rounded-pill bg-[#7C5CFF]"
                      style={{ width: `${(b / max) * 100}%` }}
                    />
                  </div>
                  <span className="tabular-nums">{b}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: one stat per row, stacked bars — Design System §32 */}
      <div className="mt-6 flex flex-col gap-5 md:hidden">
        {STAT_LABELS.map(({ key, label }) => {
          const a = fighterA.stats[key];
          const b = fighterB.stats[key];
          const max = Math.max(a, b, 1);
          return (
            <div key={key}>
              <p className="mb-2 text-xs uppercase tracking-wide text-text-tertiary">
                {label}
              </p>
              <div className="flex items-center gap-2">
                <span className="w-6 text-xs text-text-secondary">
                  {fighterA.initials}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-pill bg-surface-2">
                  <div
                    className="h-full rounded-pill bg-accent"
                    style={{ width: `${(a / max) * 100}%` }}
                  />
                </div>
                <span className="w-7 text-right text-xs tabular-nums">{a}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="w-6 text-xs text-text-secondary">
                  {fighterB.initials}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-pill bg-surface-2">
                  <div
                    className="h-full rounded-pill bg-[#7C5CFF]"
                    style={{ width: `${(b / max) * 100}%` }}
                  />
                </div>
                <span className="w-7 text-right text-xs tabular-nums">{b}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
