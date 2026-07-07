"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/constants";

/**
 * 모바일(좁은 화면) 전용 햄버거 메뉴.
 * 데스크톱(md+)에서는 숨겨지고, 헤더의 인라인 네비가 대신 보인다.
 * 버튼을 누르면 네비 항목이 드롭다운으로 펼쳐지고, 바깥 클릭·ESC·항목 선택 시 닫힌다.
 */
export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={open}
        aria-haspopup="menu"
        className="grid h-10 w-10 place-items-center rounded-xl text-neutral-700 transition-colors hover:bg-forest-50 hover:text-forest-700"
      >
        {open ? (
          <X size={20} strokeWidth={2.2} />
        ) : (
          <Menu size={20} strokeWidth={2.2} />
        )}
      </button>

      {open && (
        <nav
          className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card"
          role="menu"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              role="menuitem"
              className="block px-4 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-forest-50 hover:text-forest-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
