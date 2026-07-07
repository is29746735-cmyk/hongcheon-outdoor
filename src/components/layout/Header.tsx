import Link from "next/link";
import { Mountain } from "lucide-react";
import { NAV_LINKS, SITE } from "@/constants";
import AuthButton from "@/components/layout/AuthButton";
import MobileNav from "@/components/layout/MobileNav";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/70 bg-sand-50/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-forest-600 text-white shadow-sm">
            <Mountain size={18} strokeWidth={2.2} />
          </span>
          <span className="hidden text-base font-extrabold tracking-tight text-forest-800 sm:inline">
            {SITE.name}
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {/* 데스크톱(md+): 인라인 메뉴 */}
          <nav className="hidden items-center gap-0.5 text-sm font-semibold md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-2 text-neutral-600 transition-colors hover:bg-forest-50 hover:text-forest-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <AuthButton />
          {/* 모바일(<md): 햄버거 메뉴 */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
