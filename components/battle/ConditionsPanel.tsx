import type { MockBattle } from "@/lib/mock/battle";

export function ConditionsPanel({
  conditions,
}: {
  conditions: MockBattle["conditions"];
}) {
  const rows = [
    { label: "Location", value: conditions.location },
    { label: "Knowledge", value: conditions.knowledge },
    { label: "Prep time", value: conditions.prepTime },
    { label: "Speed", value: conditions.speedEqualized ? "Equalized" : "As portrayed" },
    { label: "Verse", value: conditions.verseEqualized ? "Equalized" : "As portrayed" },
  ];

  return (
    <section className="mx-auto max-w-[560px] px-6 py-8">
      <div className="rounded-card border border-border bg-surface-1 p-5">
        <p className="text-sm font-medium text-text-secondary">
          Battle conditions
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-xs text-text-tertiary">{row.label}</dt>
              <dd className="mt-0.5">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
