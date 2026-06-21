import Link from "next/link";
import { Mountain } from "lucide-react";
import { NAV_LINKS, SITE } from "@/constants";
import AuthButton from "@/components/layout/AuthButton";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/70 bg-sand-50/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-forest-600 text-white shadow-sm">
            <Mountain size={18} strokeWidth={2.2} />
          </span>
          <span className="text-base font-extrabold tracking-tight text-forest-800">
            {SITE.name}
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-1 text-sm font-semibold">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-2 text-neutral-600 transition-colors hover:bg-forest-50 hover:text-forest-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
