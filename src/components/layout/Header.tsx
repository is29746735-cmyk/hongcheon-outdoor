import Link from "next/link";
import { NAV_LINKS, SITE } from "@/constants";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-forest-600">
          🏕️ {SITE.name}
        </Link>
        <nav className="flex gap-6 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-neutral-700 transition-colors hover:text-forest-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
