import Link from "next/link";

const ITEMS = [
  { href: "/", label: "Home" },
  { href: "/battles", label: "Battles" },
  { href: "/tier-lists/create", label: "＋ Create" },
  { href: "/characters", label: "Fighters" },
  { href: "/rankings", label: "Rankings" },
];

/** Bottom navigation — mobile only. Server Component, pure links. */
export function MobileNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-[68px] items-center justify-around border-t border-border bg-[#0c0f13]/90 backdrop-blur-md md:hidden"
      aria-label="Primary"
    >
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex flex-col items-center gap-1 px-2 text-[11px] text-text-secondary active:text-accent"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
