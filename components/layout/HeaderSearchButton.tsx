"use client";

import { useState } from "react";
import { SearchCommand } from "@/components/layout/SearchCommand";

export function HeaderSearchButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-pill border border-border bg-surface-1 px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent/50 hover:text-text-primary"
      >
        <span>⌕ Search</span>
        <kbd className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-text-tertiary">
          ⌘K
        </kbd>
      </button>

      <SearchCommand isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
