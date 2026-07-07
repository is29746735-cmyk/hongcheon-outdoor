import Link from "next/link";
import { Mountain } from "lucide-react";
import { NAV_LINKS, SITE } from "@/constants";
import AuthButton from "@/components/layout/AuthButton";

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
        {/* 모바일: 메뉴가 폭을 넘으면 가로 스크롤(스크롤바 숨김) — 로고·로그인은 항상 노출 */}
        <div className="flex min-w-0 items-center gap-1">
          <nav className="flex min-w-0 items-center gap-0.5 overflow-x-auto text-sm font-semibold [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 rounded-full px-3 py-2 text-neutral-600 transition-colors hover:bg-forest-50 hover:text-forest-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="shrink-0">
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}
