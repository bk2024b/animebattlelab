"use client";

import { useState } from "react";
import type { MockBattle } from "@/lib/mock/battle";

const DIFFICULTIES = [
  { key: "no_diff", label: "No Diff" },
  { key: "low_diff", label: "Low Diff" },
  { key: "mid_diff", label: "Mid Diff" },
  { key: "high_diff", label: "High Diff" },
  { key: "extreme_diff", label: "Extreme Diff" },
] as const;

export function VotePanel({ battle }: { battle: MockBattle }) {
  const [choice, setChoice] = useState<"a" | "b" | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);

  const baseA = battle.voteACount;
  const baseB = battle.voteBCount;
  const totalBase = baseA + baseB;

  // Optimistic local tally — the real vote count comes from the server once wired up.
  const totalVotes = totalBase + (choice ? 1 : 0);
  const voteA = baseA + (choice === "a" ? 1 : 0);
  const voteB = baseB + (choice === "b" ? 1 : 0);
  const pctA = Math.round((voteA / totalVotes) * 100);
  const pctB = 100 - pctA;

  const leader = pctA >= pctB ? "a" : "b";

  return (
    <section className="mx-auto max-w-[560px] px-6">
      <h2 className="text-center font-display text-xl font-semibold md:text-2xl">
        Who wins?
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setChoice("a")}
          aria-pressed={choice === "a"}
          className={`rounded-lg border px-4 py-4 text-sm font-semibold transition-all ${
            choice === "a"
              ? "border-accent bg-accent/10 text-accent glow-accent"
              : "border-border bg-surface-1 text-text-primary hover:border-accent/40"
          }`}
        >
          {battle.fighterA.name}
        </button>
        <button
          type="button"
          onClick={() => setChoice("b")}
          aria-pressed={choice === "b"}
          className={`rounded-lg border px-4 py-4 text-sm font-semibold transition-all ${
            choice === "b"
              ? "border-accent bg-accent/10 text-accent glow-accent"
              : "border-border bg-surface-1 text-text-primary hover:border-accent/40"
          }`}
        >
          {battle.fighterB.name}
        </button>
      </div>

      {choice && (
        <div className="mt-6 animate-[fadeIn_0.3s_ease]">
          <p className="text-center text-xs uppercase tracking-wide text-text-tertiary">
            Community verdict
          </p>
          <p className="mt-1 text-center font-display text-lg font-semibold">
            {leader === "a" ? battle.fighterA.name : battle.fighterB.name}
          </p>

          <div className="mt-3 flex h-2 overflow-hidden rounded-pill bg-surface-2">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${pctA}%` }}
            />
            <div
              className="h-full bg-[#7C5CFF] transition-all duration-500"
              style={{ width: `${pctB}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-sm text-text-secondary">
            <span>{pctA}%</span>
            <span>{pctB}%</span>
          </div>
          <p className="mt-1 text-center text-xs text-text-tertiary">
            {totalVotes.toLocaleString()} votes
          </p>

          <div className="mt-6">
            <p className="text-center text-sm text-text-secondary">
              How difficult is the win?
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setDifficulty(d.key)}
                  aria-pressed={difficulty === d.key}
                  className={`rounded-pill border px-3 py-1.5 text-xs font-medium transition-colors ${
                    difficulty === d.key
                      ? "border-accent text-accent"
                      : "border-border text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {difficulty && (
            <a
              href="#debate"
              className="mt-6 block rounded-pill bg-accent px-4 py-3 text-center text-sm font-semibold text-bg hover:opacity-90"
            >
              Defend your choice
            </a>
          )}
        </div>
      )}
    </section>
  );
}
