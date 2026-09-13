"use client";

import { useState } from "react";
import Link from "next/link";
import type { CharacterDetail, CharacterFormDetail } from "@/lib/queries/characters";

export function CharacterProfileView({ character }: { character: CharacterDetail }) {
  const defaultForm = character.forms.find((f) => f.isDefault) ?? character.forms[0];
  const [selectedFormId, setSelectedFormId] = useState<string>(
    defaultForm?.id ?? character.forms[0]?.id ?? "",
  );

  const currentForm: CharacterFormDetail | undefined =
    character.forms.find((f) => f.id === selectedFormId) ?? character.forms[0];

  const stats = [
    { label: "Power", value: currentForm?.powerScore ?? 0 },
    { label: "Speed", value: currentForm?.speedScore ?? 0 },
    { label: "Durability", value: currentForm?.durabilityScore ?? 0 },
    { label: "Intelligence", value: currentForm?.iqScore ?? 0 },
    { label: "Battle IQ", value: currentForm?.battleIqScore ?? 0 },
    { label: "Hax / Abilities", value: currentForm?.haxScore ?? 0 },
    { label: "Stamina", value: currentForm?.staminaScore ?? 0 },
    { label: "Experience", value: currentForm?.experienceScore ?? 0 },
  ];

  const avgStat = currentForm
    ? Math.round(
        (currentForm.powerScore +
          currentForm.speedScore +
          currentForm.durabilityScore +
          currentForm.iqScore +
          currentForm.battleIqScore +
          currentForm.haxScore +
          currentForm.staminaScore +
          currentForm.experienceScore) /
          8,
      )
    : 80;

  const tier = avgStat >= 95 ? "S+" : avgStat >= 90 ? "S" : avgStat >= 80 ? "A" : "B";

  return (
    <div className="mx-auto max-w-[960px] px-6 py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-text-tertiary">
        <Link href="/" className="hover:text-text-secondary">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <Link href="/characters" className="hover:text-text-secondary">
          Characters
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-text-secondary">{character.name}</span>
      </nav>

      {/* Hero Header */}
      <div className="mt-6 flex flex-col gap-6 rounded-card border border-border bg-surface-1 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
        <div className="flex items-center gap-5">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-bold text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${character.gradientFrom}, ${character.gradientTo})`,
            }}
          >
            {character.initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-pill border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                {tier} Tier
              </span>
              <span className="text-xs text-text-tertiary">
                {character.animeName}
              </span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
              {character.name}
            </h1>
            <p className="mt-1 text-xs text-text-secondary">
              Active Form:{" "}
              <strong className="text-text-primary">
                {currentForm?.name}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/battles"
            className="rounded-pill bg-accent px-5 py-2.5 text-center text-xs font-semibold text-bg transition-opacity hover:opacity-90"
          >
            Fight in Arena
          </Link>
          <Link
            href="/tier-lists/create"
            className="rounded-pill border border-border px-5 py-2.5 text-center text-xs font-medium text-text-primary hover:border-accent"
          >
            Add to Tier List
          </Link>
        </div>
      </div>

      {/* Forms Timeline / Switcher (PRD §16, Design System §40) */}
      {character.forms.length > 1 && (
        <div className="mt-6 rounded-xl border border-border bg-surface-1 p-4">
          <p className="text-xs font-semibold tracking-wider text-text-tertiary uppercase">
            Transformations & Forms
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {character.forms.map((form) => {
              const active = form.id === selectedFormId;
              return (
                <button
                  key={form.id}
                  type="button"
                  onClick={() => setSelectedFormId(form.id)}
                  className={`rounded-pill border px-4 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? "border-accent bg-accent text-bg font-semibold"
                      : "border-border bg-surface-2 text-text-secondary hover:border-border/80 hover:text-text-primary"
                  }`}
                >
                  {form.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Stats + Abilities */}
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {/* Stats Column */}
        <div className="rounded-card border border-border bg-surface-1 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              Power Scaling Stats
            </h2>
            <span className="text-xs text-text-tertiary">Scale 0–100</span>
          </div>

          <div className="mt-6 space-y-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">{stat.label}</span>
                  <span className="font-display font-semibold text-text-primary">
                    {stat.value}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-pill bg-surface-2">
                  <div
                    className="h-full rounded-pill bg-accent transition-all duration-300"
                    style={{ width: `${stat.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Abilities & Feats Column */}
        <div className="space-y-6">
          {/* Abilities */}
          <div className="rounded-card border border-border bg-surface-1 p-6">
            <h2 className="font-display text-lg font-semibold">
              Techniques & Abilities
            </h2>
            {(!currentForm?.abilities || currentForm.abilities.length === 0) ? (
              <p className="mt-4 text-xs text-text-tertiary">
                No specific abilities documented for this form yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {currentForm.abilities.map((ab) => (
                  <div
                    key={ab.id}
                    className="rounded-lg border border-border/80 bg-surface-2 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-display text-xs font-semibold text-text-primary">
                        {ab.name}
                      </p>
                      {ab.category && (
                        <span className="rounded-pill bg-surface-3 px-2 py-0.5 text-[10px] text-text-tertiary">
                          {ab.category}
                        </span>
                      )}
                    </div>
                    {ab.description && (
                      <p className="mt-1 text-xs text-text-secondary">
                        {ab.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feats */}
          <div className="rounded-card border border-border bg-surface-1 p-6">
            <h2 className="font-display text-lg font-semibold">
              Verified Feats & Lore
            </h2>
            {(!currentForm?.feats || currentForm.feats.length === 0) ? (
              <p className="mt-4 text-xs text-text-tertiary">
                No feats documented for this form yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {currentForm.feats.map((ft) => (
                  <div
                    key={ft.id}
                    className="rounded-lg border border-border/80 bg-surface-2 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-display text-xs font-semibold text-text-primary">
                        {ft.title}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {ft.verified && (
                          <span className="text-[10px] font-medium text-accent">
                            ✓ Verified
                          </span>
                        )}
                        <span className="rounded-pill bg-surface-3 px-2 py-0.5 text-[10px] text-text-tertiary uppercase">
                          {ft.sourceType}
                        </span>
                      </div>
                    </div>
                    {ft.description && (
                      <p className="mt-1 text-xs text-text-secondary">
                        {ft.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Matchup History Section (PRD §17) */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-semibold">
          Community Matchups
        </h2>
        <p className="mt-1 text-xs text-text-secondary">
          Historical battles featuring {character.name} in the Arena.
        </p>

        {character.matchups.length === 0 ? (
          <div className="mt-4 rounded-card border border-border bg-surface-1 p-6 text-center text-xs text-text-tertiary">
            No public matchups recorded for this character yet.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {character.matchups.map((m) => (
              <Link
                key={m.slug}
                href={`/battles/${m.slug}`}
                className="flex items-center justify-between rounded-card border border-border bg-surface-1 p-4 transition-colors hover:border-accent/40"
              >
                <div>
                  <p className="text-xs text-text-tertiary">{m.opponentAnime}</p>
                  <p className="mt-1 font-display text-sm font-semibold">
                    vs {m.opponentName}
                  </p>
                  <p className="text-[11px] text-text-secondary">
                    {m.opponentFormName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-display text-sm font-bold text-accent">
                    {m.winRatePct}%
                  </span>
                  <p className="text-[10px] text-text-tertiary">
                    {m.voteCount + m.opponentVoteCount} votes
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
