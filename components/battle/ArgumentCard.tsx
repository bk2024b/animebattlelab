"use client";

import { useTransition } from "react";
import { voteOnArgumentAction } from "@/lib/battle/actions";
import type { ArgumentView, BattleView } from "@/lib/battle/types";

export function ArgumentCard({
  argument,
  battle,
  battleSlug,
}: {
  argument: ArgumentView;
  battle: BattleView;
  battleSlug: string;
}) {
  const [pending, startTransition] = useTransition();
  const fighter =
    argument.fighterChoice === "a" ? battle.fighterA : battle.fighterB;
  const accentColor = argument.fighterChoice === "a" ? "#22D07A" : "#7C5CFF";

  function vote(value: 1 | -1) {
    startTransition(async () => {
      await voteOnArgumentAction(argument.id, battleSlug, value);
    });
  }

  return (
    <article className="rounded-card border border-border bg-surface-1 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">@{argument.username}</span>
          <span className="rounded-pill bg-surface-2 px-2 py-0.5 text-xs text-text-tertiary">
            {argument.rank}
          </span>
        </div>
        <span className="text-xs text-text-tertiary">{argument.createdAt}</span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-text-primary">
        {argument.content}
      </p>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <span
          className="rounded-pill px-2.5 py-1 text-xs font-medium"
          style={{ color: accentColor, backgroundColor: `${accentColor}1A` }}
        >
          {fighter.name}
        </span>
        <button
          type="button"
          onClick={() => vote(1)}
          disabled={pending}
          className="flex items-center gap-1 text-text-secondary hover:text-accent disabled:opacity-50"
          aria-label="Upvote"
        >
          ↑ {argument.upvotes}
        </button>
        <button
          type="button"
          onClick={() => vote(-1)}
          disabled={pending}
          className="flex items-center gap-1 text-text-secondary hover:text-error disabled:opacity-50"
          aria-label="Downvote"
        >
          ↓ {argument.downvotes}
        </button>
        <button
          type="button"
          className="ml-auto text-text-secondary hover:text-text-primary"
        >
          Reply · {argument.replyCount}
        </button>
      </div>
    </article>
  );
}
