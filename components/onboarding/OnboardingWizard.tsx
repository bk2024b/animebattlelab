"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { completeOnboardingAction } from "@/lib/onboarding/actions";
import { castVoteAction } from "@/lib/battle/actions";

type AnimeItem = { id: string; slug: string; name: string; description: string | null };
type CharacterItem = { id: string; name: string; animeName: string };
type SampleBattle = {
  id: string;
  slug: string;
  fighterAName: string;
  fighterBName: string;
};

export function OnboardingWizard({
  animeList,
  characters,
  sampleBattle,
}: {
  animeList: AnimeItem[];
  characters: CharacterItem[];
  sampleBattle: SampleBattle | null;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedAnime, setSelectedAnime] = useState<string[]>([]);
  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [votedChoice, setVotedChoice] = useState<"a" | "b" | null>(null);
  const [isPending, startTransition] = useTransition();
  const [xpUnlocked, setXpUnlocked] = useState(false);

  function toggleAnime(slug: string) {
    setSelectedAnime((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  function toggleCharacter(id: string) {
    setSelectedChars((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  function handleVote(choice: "a" | "b") {
    setVotedChoice(choice);
    if (sampleBattle) {
      startTransition(async () => {
        await castVoteAction(sampleBattle.id, sampleBattle.slug, choice, "mid_diff");
      });
    }
  }

  function finishOnboarding() {
    startTransition(async () => {
      await completeOnboardingAction();
      setXpUnlocked(true);
      setStep(4);
    });
  }

  return (
    <div className="mx-auto max-w-[700px] px-6 py-12">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-text-tertiary">
          <span>STEP {step} OF 4</span>
          <span>
            {step === 1 && "Choose Universes"}
            {step === 2 && "Favorite Fighters"}
            {step === 3 && "First Matchup"}
            {step === 4 && "Ready for Battle"}
          </span>
        </div>
        <div className="mt-2 flex h-1.5 gap-1.5 overflow-hidden rounded-pill bg-surface-2">
          <div
            className={`h-full rounded-pill transition-all duration-300 ${
              step >= 1 ? "bg-accent" : "bg-transparent"
            }`}
            style={{ width: "25%" }}
          />
          <div
            className={`h-full rounded-pill transition-all duration-300 ${
              step >= 2 ? "bg-accent" : "bg-transparent"
            }`}
            style={{ width: "25%" }}
          />
          <div
            className={`h-full rounded-pill transition-all duration-300 ${
              step >= 3 ? "bg-accent" : "bg-transparent"
            }`}
            style={{ width: "25%" }}
          />
          <div
            className={`h-full rounded-pill transition-all duration-300 ${
              step >= 4 ? "bg-accent" : "bg-transparent"
            }`}
            style={{ width: "25%" }}
          />
        </div>
      </div>

      {/* STEP 1: Universes */}
      {step === 1 && (
        <div className="rounded-card border border-border bg-surface-1 p-8">
          <h2 className="font-display text-2xl font-semibold">
            Choose your universes
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Select the anime you follow to customize your matchups and feed.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {animeList.map((a) => {
              const active = selectedAnime.includes(a.slug);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleAnime(a.slug)}
                  className={`flex items-start justify-between rounded-xl border p-4 text-left transition-all ${
                    active
                      ? "border-accent bg-accent/5 glow-accent"
                      : "border-border bg-surface-2 hover:border-border/80"
                  }`}
                >
                  <div>
                    <p className="font-display text-base font-semibold">
                      {a.name}
                    </p>
                    <p className="mt-1 text-xs text-text-tertiary">
                      {a.description ?? "Power scaling discussions"}
                    </p>
                  </div>
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                      active
                        ? "border-accent bg-accent text-bg font-bold"
                        : "border-border text-transparent"
                    }`}
                  >
                    ✓
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              disabled={selectedAnime.length === 0}
              onClick={() => setStep(2)}
              className="rounded-pill bg-accent px-6 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Continue ({selectedAnime.length} selected)
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Characters */}
      {step === 2 && (
        <div className="rounded-card border border-border bg-surface-1 p-8">
          <h2 className="font-display text-2xl font-semibold">
            Pick your top fighters
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Select characters you know best to defend them in debates.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {characters.map((c) => {
              const active = selectedChars.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCharacter(c.id)}
                  className={`flex items-center gap-2 rounded-pill border px-4 py-2 text-xs font-medium transition-all ${
                    active
                      ? "border-accent bg-accent text-bg font-semibold"
                      : "border-border bg-surface-2 text-text-primary hover:border-border/80"
                  }`}
                >
                  <span>{c.name}</span>
                  <span
                    className={`text-[10px] ${
                      active ? "text-bg/80" : "text-text-tertiary"
                    }`}
                  >
                    · {c.animeName}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-text-secondary hover:text-text-primary"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-pill bg-accent px-6 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: First Matchup */}
      {step === 3 && (
        <div className="rounded-card border border-border bg-surface-1 p-8 text-center">
          <p className="text-xs font-semibold tracking-wider text-accent uppercase">
            Quick Matchup Demo
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold">
            Who really wins?
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Cast your first vote to learn how debates work and unlock your
            welcome XP.
          </p>

          <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            {/* Fighter A */}
            <button
              type="button"
              onClick={() => handleVote("a")}
              className={`rounded-card border p-6 text-center transition-all ${
                votedChoice === "a"
                  ? "border-accent bg-accent/10 glow-accent"
                  : "border-border bg-surface-2 hover:border-border/80"
              }`}
            >
              <p className="font-display text-xl font-bold">
                {sampleBattle?.fighterAName ?? "Madara Uchiha"}
              </p>
              <span className="mt-3 inline-block rounded-pill border border-border px-3 py-1 text-xs text-text-secondary">
                Vote Fighter A
              </span>
            </button>

            <span className="font-display text-sm font-semibold text-text-tertiary">
              VS
            </span>

            {/* Fighter B */}
            <button
              type="button"
              onClick={() => handleVote("b")}
              className={`rounded-card border p-6 text-center transition-all ${
                votedChoice === "b"
                  ? "border-accent-2 bg-accent-2/10"
                  : "border-border bg-surface-2 hover:border-border/80"
              }`}
            >
              <p className="font-display text-xl font-bold">
                {sampleBattle?.fighterBName ?? "Sosuke Aizen"}
              </p>
              <span className="mt-3 inline-block rounded-pill border border-border px-3 py-1 text-xs text-text-secondary">
                Vote Fighter B
              </span>
            </button>
          </div>

          {votedChoice && (
            <div className="mt-6 rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm text-accent">
              ✓ Vote recorded! In the full arena, you can also defend your
              scaling with arguments and select difficulty (No diff to Extreme
              diff).
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs text-text-secondary hover:text-text-primary"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={!votedChoice || isPending}
              onClick={finishOnboarding}
              className="rounded-pill bg-accent px-6 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {isPending ? "Unlocking XP..." : "Complete Onboarding →"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Complete */}
      {step === 4 && (
        <div className="rounded-card border border-border bg-surface-1 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-2xl text-accent">
            ⚡
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold">
            Welcome to the Lab!
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            You just earned{" "}
            <strong className="text-accent">+10 XP</strong>. Your power scaling
            journey begins at rank <strong className="text-text-primary">Academy</strong>.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/battles"
              className="rounded-pill bg-accent px-6 py-3 text-sm font-semibold text-bg hover:opacity-90"
            >
              Explore Battle Arena
            </Link>
            <Link
              href="/tier-lists/create"
              className="rounded-pill border border-border px-6 py-3 text-sm font-medium text-text-primary hover:border-accent"
            >
              Build a Tier List
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
