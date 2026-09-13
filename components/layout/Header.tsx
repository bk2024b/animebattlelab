import Link from "next/link";
import { HeaderSearchButton } from "@/components/layout/HeaderSearchButton";

const NAV_LINKS = [
  { href: "/battles", label: "Battles" },
  { href: "/characters", label: "Characters" },
  { href: "/tier-lists", label: "Tier Lists" },
  { href: "/rankings", label: "Rankings" },
];

/**
 * Server Component — no client JS shipped for the header shell.
 * Sticky, subtle border-bottom, matches Design System §15.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 hidden h-[72px] border-b border-border bg-bg/85 backdrop-blur-md md:block">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-text-primary"
        >
          ANIME BATTLE LAB
        </Link>

        <nav className="flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <HeaderSearchButton />
          <Link
            href="/tier-lists/create"
            className="rounded-pill bg-accent px-4 py-1.5 text-xs font-semibold text-bg hover:opacity-90"
          >
            + Create
          </Link>
        </div>
      </div>
    </header>
  );
}
