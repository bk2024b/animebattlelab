"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { gradientFor, initialsFor } from "@/lib/characters/appearance";
import { publishTierListAction } from "@/lib/tier-list/actions";
import type { AnimeOption } from "@/lib/queries/anime";

type PoolItem = {
  formId: string;
  name: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
};

type Tier = { id: string; name: string; items: PoolItem[] };

const DEFAULT_TIER_NAMES = ["S+", "S", "A", "B", "C", "D"];

let localIdCounter = 0;
function localId() {
  localIdCounter += 1;
  return `tier-${localIdCounter}`;
}

export function TierListBuilder({
  animeOptions,
}: {
  animeOptions: AnimeOption[];
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [animeId, setAnimeId] = useState<string | null>(null);
  const [pool, setPool] = useState<PoolItem[]>([]);
  const [tiers, setTiers] = useState<Tier[]>(
    DEFAULT_TIER_NAMES.map((name) => ({ id: localId(), name, items: [] })),
  );
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [loadingPool, setLoadingPool] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "unlisted" | "private">(
    "public",
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function chooseAnime(id: string) {
    setAnimeId(id);
    setLoadingPool(true);
    // Public read (RLS allows published rows to anyone) — safe to query
    // straight from the browser, no round trip through a Route Handler needed.
    const supabase = createClient();
    const { data } = await supabase
      .from("character_forms")
      .select("id, name, characters!inner ( name, anime_id, is_published )")
      .eq("characters.anime_id", id)
      .eq("characters.is_published", true);

    const items: PoolItem[] = (data ?? []).map((row: any) => {
      const characterName = row.characters?.name ?? row.name;
      const [gradientFrom, gradientTo] = gradientFor(row.id);
      return {
        formId: row.id,
        name: characterName,
        initials: initialsFor(characterName),
        gradientFrom,
        gradientTo,
      };
    });
    setPool(items);
    setLoadingPool(false);
    setStep(2);
  }

  function findLocation(formId: string): { tierIndex: number } | "pool" | null {
    if (pool.some((i) => i.formId === formId)) return "pool";
    const tierIndex = tiers.findIndex((t) => t.items.some((i) => i.formId === formId));
    return tierIndex >= 0 ? { tierIndex } : null;
  }

  function moveToTier(formId: string, targetTierIndex: number) {
    let item: PoolItem | undefined;
    setPool((prev) => {
      const found = prev.find((i) => i.formId === formId);
      if (found) item = found;
      return prev.filter((i) => i.formId !== formId);
    });
    setTiers((prev) => {
      const withRemoved = prev.map((t) => ({
        ...t,
        items: t.items.filter((i) => {
          if (i.formId === formId) {
            item = i;
            return false;
          }
          return true;
        }),
      }));
      if (!item) return withRemoved;
      return withRemoved.map((t, idx) =>
        idx === targetTierIndex ? { ...t, items: [...t.items, item!] } : t,
      );
    });
    setSelectedFormId(null);
  }

  function moveToPool(formId: string) {
    let item: PoolItem | undefined;
    setTiers((prev) =>
      prev.map((t) => ({
        ...t,
        items: t.items.filter((i) => {
          if (i.formId === formId) {
            item = i;
            return false;
          }
          return true;
        }),
      })),
    );
    if (item) setPool((prev) => [...prev, item!]);
    setSelectedFormId(null);
  }

  function handleChipTap(formId: string) {
    // Mobile fallback (Design System §20 — "drag & drop tactile ou déplacement
    // via actions"): tap a pool character to select it, then tap a tier to drop it.
    setSelectedFormId((prev) => (prev === formId ? null : formId));
  }

  function handleTierTap(tierIndex: number) {
    if (selectedFormId) moveToTier(selectedFormId, tierIndex);
  }

  function handleDrop(e: React.DragEvent, tierIndex: number) {
    e.preventDefault();
    const formId = e.dataTransfer.getData("text/plain");
    if (formId) moveToTier(formId, tierIndex);
  }

  function addTier() {
    setTiers((prev) => [...prev, { id: localId(), name: "New Tier", items: [] }]);
  }

  function removeTier(tierIndex: number) {
    setTiers((prev) => {
      const removed = prev[tierIndex];
      setPool((p) => [...p, ...removed.items]);
      return prev.filter((_, i) => i !== tierIndex);
    });
  }

  function renameTier(tierIndex: number, name: string) {
    setTiers((prev) => prev.map((t, i) => (i === tierIndex ? { ...t, name } : t)));
  }

  function publish() {
    if (!animeId) return;
    setError(null);
    startTransition(async () => {
      const result = await publishTierListAction({
        title,
        description,
        animeId,
        visibility,
        tiers: tiers.map((t, tIdx) => ({
          name: t.name,
          position: tIdx,
          items: t.items.map((it, iIdx) => ({
            characterFormId: it.formId,
            position: iIdx,
          })),
        })),
      });
      // A successful call redirects server-side and never returns here.
      if (result?.error === "not_authenticated") {
        setError("You need to be signed in to publish.");
      } else if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mt-8">
      {step === 1 && (
        <div>
          <p className="text-sm text-text-secondary">Choose an anime</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {animeOptions.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => chooseAnime(a.id)}
                className="rounded-pill border border-border px-4 py-2 text-sm hover:border-accent/50"
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          {loadingPool ? (
            <p className="text-sm text-text-tertiary">Loading characters...</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
              {/* Characters pool */}
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-text-tertiary">
                  Characters
                </p>
                <div className="flex flex-wrap gap-2 md:flex-col">
                  {pool.map((item) => (
                    <button
                      key={item.formId}
                      type="button"
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData("text/plain", item.formId)
                      }
                      onClick={() => handleChipTap(item.formId)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        selectedFormId === item.formId
                          ? "border-accent text-accent"
                          : "border-border text-text-primary hover:border-accent/40"
                      }`}
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold text-bg"
                        style={{
                          background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                        }}
                      >
                        {item.initials}
                      </span>
                      {item.name}
                    </button>
                  ))}
                  {pool.length === 0 && (
                    <p className="text-xs text-text-tertiary">
                      All characters placed.
                    </p>
                  )}
                </div>
              </div>

              {/* Tier board */}
              <div className="flex flex-col gap-2">
                {tiers.map((tier, tierIndex) => (
                  <div
                    key={tier.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, tierIndex)}
                    onClick={() => handleTierTap(tierIndex)}
                    className="flex items-start gap-3 rounded-lg border border-border bg-surface-1 p-3"
                  >
                    <input
                      value={tier.name}
                      onChange={(e) => renameTier(tierIndex, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-14 shrink-0 rounded-md border border-border bg-surface-2 px-2 py-1 text-center text-sm font-semibold outline-none focus:border-accent"
                    />
                    <div className="flex min-h-[40px] flex-1 flex-wrap gap-2">
                      {tier.items.map((item) => (
                        <button
                          key={item.formId}
                          type="button"
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            e.dataTransfer.setData("text/plain", item.formId);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveToPool(item.formId);
                          }}
                          title="Tap to remove"
                          className="flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2 py-1 text-xs hover:border-error/50"
                        >
                          <span
                            className="flex h-5 w-5 items-center justify-center rounded text-[9px] font-semibold text-bg"
                            style={{
                              background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                            }}
                          >
                            {item.initials}
                          </span>
                          {item.name}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTier(tierIndex);
                      }}
                      className="text-xs text-text-tertiary hover:text-error"
                      aria-label="Remove tier"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTier}
                  className="self-start rounded-pill border border-dashed border-border px-3 py-1.5 text-xs text-text-secondary hover:border-accent/50 hover:text-text-primary"
                >
                  + Add tier
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setStep(3)}
            className="mt-6 rounded-pill bg-accent px-4 py-2.5 text-sm font-semibold text-bg hover:opacity-90"
          >
            Continue
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-md">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-text-secondary">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                placeholder="My Naruto Top 30"
                className="mt-1 w-full rounded-md border border-border bg-surface-1 px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full resize-none rounded-md border border-border bg-surface-1 px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary">Visibility</label>
              <div className="mt-1 flex gap-2">
                {(["public", "unlisted", "private"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisibility(v)}
                    className={`rounded-pill border px-3 py-1.5 text-xs capitalize transition-colors ${
                      visibility === v
                        ? "border-accent text-accent"
                        : "border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-pill border border-border px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={publish}
                disabled={pending || !title.trim()}
                className="flex-1 rounded-pill bg-accent px-4 py-2.5 text-sm font-semibold text-bg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pending ? "Publishing..." : "Publish tier list"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
