"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArgumentCard } from "./ArgumentCard";
import { submitArgumentAction } from "@/lib/battle/actions";
import type { BattleView } from "@/lib/battle/types";

const FACTOR_TAGS = [
  "Speed",
  "Power",
  "Hax",
  "Battle IQ",
  "Durability",
  "Experience",
];

const SORTS = ["Top", "Newest", "Controversial"] as const;

export function DebateSection({
  battle,
  isAuthenticated,
}: {
  battle: BattleView;
  isAuthenticated: boolean;
}) {
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Top");
  const [content, setContent] = useState("");
  const [selectedFighter, setSelectedFighter] = useState<"a" | "b" | null>(
    null,
  );
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sorted = useMemo(() => {
    const copy = [...battle.arguments];
    if (sort === "Top") return copy.sort((a, b) => b.upvotes - a.upvotes);
    if (sort === "Controversial")
      return copy.sort(
        (a, b) =>
          Math.min(b.upvotes, b.downvotes) - Math.min(a.upvotes, a.downvotes),
      );
    return copy; // "Newest" — rows already arrive most-recent-first from the query
  }, [battle.arguments, sort]);

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length < 5
          ? [...prev, tag]
          : prev,
    );
  }

  function publish() {
    if (!isAuthenticated) {
      setError("sign_in");
      return;
    }
    if (!content.trim() || !selectedFighter) return;

    setError(null);
    startTransition(async () => {
      const result = await submitArgumentAction(
        battle.id,
        battle.slug,
        content,
        selectedFighter,
      );
      if (result.error === "not_authenticated") {
        setError("sign_in");
        return;
      }
      if (result.error) {
        setError(result.error);
        return;
      }
      setContent("");
      setTags([]);
      setSelectedFighter(null);
      // revalidatePath in the server action refreshes battle.arguments on next render
    });
  }

  return (
    <section id="debate" className="mx-auto max-w-[720px] px-6 py-10">
      <h2 className="font-display text-xl font-semibold md:text-2xl">
        The debate
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        Why does your fighter win?
      </p>

      {/* Composer */}
      <div className="mt-5 rounded-card border border-border bg-surface-1 p-5">
        <div className="mb-3 flex gap-2">
          {(["a", "b"] as const).map((choiceKey) => {
            const fighter =
              choiceKey === "a" ? battle.fighterA : battle.fighterB;
            return (
              <button
                key={choiceKey}
                type="button"
                onClick={() => setSelectedFighter(choiceKey)}
                className={`rounded-pill border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedFighter === choiceKey
                    ? "border-accent text-accent"
                    : "border-border text-text-secondary hover:text-text-primary"
                }`}
              >
                {fighter.name} wins because...
              </button>
            );
          })}
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1500}
          rows={4}
          placeholder="Make your case..."
          className="w-full resize-none rounded-md border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-accent"
        />

        <p className="mt-3 text-xs text-text-tertiary">
          Choose your strongest points (up to 5)
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {FACTOR_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-pill border px-3 py-1 text-xs transition-colors ${
                tags.includes(tag)
                  ? "border-accent text-accent"
                  : "border-border text-text-secondary hover:text-text-primary"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {error === "sign_in" && (
          <p className="mt-3 text-sm text-text-secondary">
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>{" "}
            to publish an argument.
          </p>
        )}
        {error && error !== "sign_in" && (
          <p className="mt-3 text-sm text-error">{error}</p>
        )}

        <button
          type="button"
          onClick={publish}
          disabled={!content.trim() || !selectedFighter || pending}
          className="mt-4 rounded-pill bg-accent px-4 py-2 text-sm font-semibold text-bg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Publishing..." : "Publish argument"}
        </button>
      </div>

      {/* Sort tabs */}
      <div className="mt-8 flex gap-5 border-b border-border text-sm">
        {SORTS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSort(s)}
            className={`border-b-2 pb-2 transition-colors ${
              sort === s
                ? "border-accent text-text-primary"
                : "border-transparent text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {sorted.length === 0 && (
          <p className="py-6 text-center text-sm text-text-tertiary">
            Be the first to make the case.
          </p>
        )}
        {sorted.map((argument) => (
          <ArgumentCard
            key={argument.id}
            argument={argument}
            battle={battle}
            battleSlug={battle.slug}
          />
        ))}
      </div>
    </section>
  );
}
