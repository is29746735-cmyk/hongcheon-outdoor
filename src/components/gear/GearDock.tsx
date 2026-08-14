"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, X } from "lucide-react";
import { GEAR_CATS } from "@/components/gear/GearPromoBand";

/**
 * 용품 플로팅 도크 — PC(lg+) 전용 커머스 진입점 (2026-08-14 사용자 결정).
 *
 * 홈 배치를 목록 우선으로 바꾸면서 인플로우 용품 밴드가 페이지 맨 아래로
 * 내려갔다. PC 에서는 그 대신 이 도크가 우하단에 고정되어 스크롤을 따라온다.
 * 접힌 상태는 작은 버튼 하나 — **눌러야만 패널이 열린다.** 강제 시작 모달을
 * 폐기했던 원칙(구매 유도가 열람을 방해하지 않는다) 그대로, 끼어들지 않고
 * 자리만 지킨다.
 *
 * 모바일(<lg)은 화면 폭이 좁아 따라오는 패널이 콘텐츠·엄지 영역을 가리므로
 * 이 도크를 렌더하지 않는다 — 대신 인플로우 밴드(GearPromoBand)가 목록 끝에
 * 남는다(PlaceBrowser 참조).
 *
 * z-40: 슬라이드오버(z-50)·로그인 모달(z-60)보다 아래라 상세를 열면 덮인다.
 */
export default function GearDock() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // ESC·바깥 클릭으로 닫기 (MobileNav 와 같은 문법)
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
    <div ref={ref} className="fixed bottom-6 right-6 z-40 hidden lg:block">
      {open ? (
        <section
          id="gear-dock-panel"
          aria-label="용품 준비 바로가기"
          className="w-80 rounded-2xl border border-sand-300 bg-white p-5 shadow-card-hover"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.08em] text-ember-700">
              <ShoppingBag size={13} strokeWidth={2.4} />
              준비물 · 쿠팡 최저가
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="용품 패널 닫기"
              className="-mr-2 -mt-2 grid h-10 w-10 place-items-center rounded-sm text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
            >
              <X className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>

          <h2 className="mt-1 text-lg font-extrabold text-neutral-900">
            떠나기 전, 용품 준비하기
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-neutral-600">
            품목별 구매 팁과 실사용 주의사항을 함께 정리했어요.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {GEAR_CATS.map(({ key, label, Icon }) => (
              <Link
                key={key}
                href={`/gear#${key}`}
                className="group flex min-h-[44px] items-center gap-2 rounded-sm border border-neutral-200 px-3 py-2 transition-colors hover:border-ember-400 hover:bg-ember-50/40"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-sand-100 text-forest-700 transition-colors group-hover:bg-ember-600 group-hover:text-white">
                  <Icon size={16} strokeWidth={2} />
                </span>
                <span className="text-[13px] font-bold text-neutral-800">
                  {label}
                </span>
              </Link>
            ))}
          </div>

          <Link
            href="/gear"
            className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-sm bg-ember-600 px-4 text-sm font-bold text-white transition-colors hover:bg-ember-700"
          >
            용품 전체 보기
            <ArrowRight size={15} strokeWidth={2.4} />
          </Link>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="gear-dock-panel"
          className="inline-flex min-h-[48px] items-center gap-2 rounded-sm bg-ember-600 px-4 text-sm font-bold text-white shadow-card-hover transition-colors hover:bg-ember-700"
        >
          <ShoppingBag size={16} strokeWidth={2.2} />
          용품 준비
        </button>
      )}
    </div>
  );
}
