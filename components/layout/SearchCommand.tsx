"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type SearchResult = {
  type: "character" | "battle" | "anime";
  title: string;
  subtitle: string;
  href: string;
};

export function SearchCommand({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const supabase = createClient();
        const trimmed = query.trim();

        const [charsRes, battlesRes, animeRes] = await Promise.all([
          supabase
            .from("characters")
            .select("slug, name, anime:anime_id ( name )")
            .ilike("name", `%${trimmed}%`)
            .eq("is_published", true)
            .limit(5),
          supabase
            .from("battles")
            .select(`
              slug,
              fighter_a:character_forms!battles_fighter_a_form_id_fkey ( characters ( name ) ),
              fighter_b:character_forms!battles_fighter_b_form_id_fkey ( characters ( name ) )
            `)
            .ilike("slug", `%${trimmed.toLowerCase().replace(/\s+/g, "-")}%`)
            .eq("status", "published")
            .limit(5),
          supabase
            .from("anime")
            .select("slug, name")
            .ilike("name", `%${trimmed}%`)
            .eq("is_published", true)
            .limit(3),
        ]);

        const items: SearchResult[] = [];

        (charsRes.data ?? []).forEach((c: any) => {
          items.push({
            type: "character",
            title: c.name,
            subtitle: `Character · ${c.anime?.name ?? "Anime"}`,
            href: `/characters/${c.slug}`,
          });
        });

        (battlesRes.data ?? []).forEach((b: any) => {
          const nameA = b.fighter_a?.characters?.name ?? "Fighter A";
          const nameB = b.fighter_b?.characters?.name ?? "Fighter B";
          items.push({
            type: "battle",
            title: `${nameA} vs ${nameB}`,
            subtitle: "Battle Matchup",
            href: `/battles/${b.slug}`,
          });
        });

        (animeRes.data ?? []).forEach((a: any) => {
          items.push({
            type: "anime",
            title: a.name,
            subtitle: "Anime Universe",
            href: `/battles?anime=${a.slug}`,
          });
        });

        setResults(items);
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-20 backdrop-blur-sm">
      <div className="w-full max-w-[560px] overflow-hidden rounded-card border border-border bg-surface-1 shadow-2xl">
        {/* Search input */}
        <div className="flex items-center border-b border-border px-4 py-3">
          <span className="mr-3 text-sm text-text-tertiary">⌕</span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search characters, battles, anime... (ESC to close)"
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-xs text-text-tertiary hover:text-text-primary"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto p-2">
          {isPending && (
            <div className="py-8 text-center text-xs text-text-tertiary">
              Searching...
            </div>
          )}

          {!isPending && query && results.length === 0 && (
            <div className="py-8 text-center text-xs text-text-tertiary">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {!isPending && !query && (
            <div className="py-6 text-center text-xs text-text-tertiary">
              Type something to search across characters, matchups, and anime.
            </div>
          )}

          {!isPending && results.length > 0 && (
            <div className="space-y-1">
              {results.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(r.href);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs transition-colors hover:bg-surface-2"
                >
                  <div>
                    <p className="font-display font-semibold text-text-primary">
                      {r.title}
                    </p>
                    <p className="text-[11px] text-text-tertiary">
                      {r.subtitle}
                    </p>
                  </div>
                  <span className="rounded-pill bg-surface-3 px-2 py-0.5 text-[10px] text-text-tertiary uppercase">
                    {r.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
