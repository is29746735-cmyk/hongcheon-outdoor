"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Fish,
  ShoppingBag,
  Sparkles,
  Tent,
  Utensils,
  X,
} from "lucide-react";
import { useFocusTrap } from "@/lib/useFocusTrap";

/**
 * 용품 진입용 카테고리 바로가기.
 * (원래 홈 인플로우 밴드 GearPromoBand 의 것 — 밴드 폐기 후 여기로 이전)
 */
const GEAR_CATS = [
  { key: "camping", label: "캠핑용품", Icon: Tent },
  { key: "fishing", label: "낚시용품", Icon: Fish },
  { key: "aesthetic", label: "감성 아이템", Icon: Sparkles },
  { key: "food", label: "먹거리", Icon: Utensils },
] as const;

/**
 * 용품 플로팅 도크 — 홈의 커머스 진입점 (2026-08-14 사용자 결정).
 *
 * 홈 배치가 목록 우선이 되면서 인플로우 용품 밴드는 모바일에서 9.7화면
 * 아래(y=7,862/8,955px)로 밀려 사실상 노출 0이었다 → 밴드를 없애고
 * 화면 크기별 도크로 통일했다:
 *
 * - PC(lg+): 우하단 고정 버튼 → 옆에 320px 패널이 열린다(논모달).
 * - 모바일(<lg): 우하단 48px 아이콘 FAB → **바텀시트**(모달)가 열린다.
 *   따라오는 사이드 패널은 좁은 화면을 가리므로 시트로 대체한 것.
 *
 * 공통 원칙: **눌러야만 열린다.** 강제 시작 모달을 폐기했던 원칙(구매 유도가
 * 열람을 방해하지 않는다) 그대로 — 끼어들지 않고 자리만 지킨다.
 *
 * z: 런처 z-40(슬라이드오버 z-50 아래) · 모바일 시트 z-[60](로그인 모달과 같은 층).
 */
export default function GearDock() {
  const [open, setOpen] = useState(false);
  const deskRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // 모바일 시트 포커스 순환. 데스크톱에서는 시트가 display:none 이라
  // 훅의 offsetParent 필터에 걸려 아무 것도 하지 않는다(안전).
  useFocusTrap(open, sheetRef);

  // ESC·바깥 클릭으로 닫기 — 데스크톱 패널·모바일 시트 어느 쪽이든
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (deskRef.current?.contains(t) || sheetRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  // 모바일 시트가 열려 있는 동안 뒤 배경 스크롤 잠금 (데스크톱 논모달 패널은 제외)
  useEffect(() => {
    if (!open) return;
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const content = (
    <>
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
    </>
  );

  const labelRow = (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.08em] text-ember-700">
      <ShoppingBag size={13} strokeWidth={2.4} />
      준비물 · 쿠팡 최저가
    </span>
  );

  return (
    <>
      {/* ── PC(lg+): 우하단 런처 + 논모달 패널 ── */}
      <div ref={deskRef} className="fixed bottom-6 right-6 z-40 hidden lg:block">
        {open ? (
          <section
            id="gear-dock-panel"
            aria-label="용품 준비 바로가기"
            className="w-80 rounded-2xl border border-sand-300 bg-white p-5 shadow-card-hover"
          >
            <div className="flex items-start justify-between gap-2">
              {labelRow}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="용품 패널 닫기"
                className="-mr-2 -mt-2 grid h-10 w-10 place-items-center rounded-sm text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
              >
                <X className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </div>
            {content}
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

      {/* ── 모바일(<lg): 아이콘 FAB — 우하단 점유를 48px 로 최소화 ── */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="용품 준비 열기"
          className="fixed bottom-5 right-4 z-40 grid h-12 w-12 place-items-center rounded-sm bg-ember-600 text-white shadow-card-hover transition-colors hover:bg-ember-700 lg:hidden"
        >
          <ShoppingBag size={20} strokeWidth={2.2} />
        </button>
      )}

      {/* ── 모바일(<lg): 바텀시트 — 사이트 공통 시트 문법(로그인·용품 설명창과 동일) ── */}
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="용품 준비 바로가기"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            ref={sheetRef}
            className="relative z-10 w-full rounded-t-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-2">
              {labelRow}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="용품 시트 닫기"
                className="-mr-2 -mt-2 grid h-10 w-10 place-items-center rounded-sm text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
              >
                <X className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
