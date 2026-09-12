import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border py-10 pb-24 md:pb-10">
      <div className="mx-auto max-w-[1200px] px-6 text-sm text-text-tertiary">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Anime Battle Lab</span>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-text-secondary">
              About
            </Link>
            <Link href="/legal" className="hover:text-text-secondary">
              Legal
            </Link>
            <Link href="/contact" className="hover:text-text-secondary">
              Contact
            </Link>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-xs leading-relaxed text-text-tertiary">
          Anime Battle Lab is a fan-made community platform. All characters,
          series and related media are the property of their respective
          copyright holders. Statistics and rankings reflect community and
          editorial opinion, not official information.
        </p>
      </div>
    </footer>
  );
}
