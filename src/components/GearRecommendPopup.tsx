"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Tent,
  Fish,
  Sparkles,
  Utensils,
  ShoppingBag,
  ArrowRight,
  X,
  type LucideIcon,
} from "lucide-react";
import { getAllGear, type GearCategory, type GearItem } from "@/data/gear";
import { useFocusTrap } from "@/lib/useFocusTrap";

/**
 * 사이트 첫 진입 시(세션당 1회) 랜덤 용품 하나를 추천하는 팝업 — 커머스 진입점.
 * 쿠팡 파트너스 연결 전 예시 단계: item.shops[].url 이 채워지면 '구매하러 가기'가
 * 자동으로 실제 제휴 링크(새 창)로 연결되고, 그전까지는 용품 페이지로 안내한다.
 *
 * 노출 빈도 = 세션당 1회(SESSION_KEY). '매 방문'으로 바꾸려면 아래 sessionStorage
 * 체크를 제거, '하루 1회'는 localStorage + 날짜 비교로 교체하면 된다.
 */
const SESSION_KEY = "hco:gear-popup-shown";

const CATEGORY: Record<GearCategory, { label: string; Icon: LucideIcon }> = {
  camping: { label: "캠핑용품", Icon: Tent },
  fishing: { label: "낚시용품", Icon: Fish },
  aesthetic: { label: "감성 아이템", Icon: Sparkles },
  food: { label: "먹거리", Icon: Utensils },
};

export default function GearRecommendPopup() {
  const [item, setItem] = useState<GearItem | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(!!item, panelRef);

  // 최초 마운트 시 세션 확인 후 랜덤 추천 (클라이언트 전용 — SSR 플래시 없음)
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // 스토리지 차단(시크릿 모드 등) — 그냥 1회 노출로 진행
    }
    const all = getAllGear();
    if (all.length === 0) return;
    const picked = all[Math.floor(Math.random() * all.length)];
    const timer = setTimeout(() => {
      setItem(picked);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* noop */
      }
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // ESC 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setItem(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [item]);

  if (!item) return null;

  const close = () => setItem(null);
  const { label, Icon } = CATEGORY[item.category];
  const buyUrl = item.shops.find((s) => s.url)?.url;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`오늘의 추천 용품: ${item.name}`}
    >
      {/* 배경 — 클릭하면 닫힘 */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={close}
      />

      {/* 패널 */}
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-sm animate-fade-up overflow-hidden rounded-t-sm border border-sand-300 bg-white shadow-xl sm:rounded-sm"
      >
        {/* 헤더 — 딥그린 + 등고선 시그니처 */}
        <div className="relative overflow-hidden bg-forest-800 px-5 pb-5 pt-4 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg,transparent 0 24px,#fff 24px 25px),repeating-linear-gradient(90deg,transparent 0 24px,#fff 24px 25px)",
            }}
          />
          <div className="relative flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-forest-200">
              오늘의 추천 · 예시
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="닫기"
              className="grid h-7 w-7 place-items-center rounded-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>
          <div className="relative mt-3 flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-white/10 text-white ring-1 ring-white/15">
              <Icon size={22} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <span className="inline-block rounded-sm bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white ring-1 ring-white/15">
                {label}
              </span>
              <h2 className="mt-1 truncate text-lg font-extrabold tracking-tight">
                {item.name}
              </h2>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="px-5 py-5">
          <p className="text-sm leading-relaxed text-neutral-700">
            {item.summary}
          </p>
          {item.tags && item.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="rounded-sm bg-sand-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* 버튼 */}
          <div className="mt-5 flex flex-col gap-2">
            {buyUrl ? (
              <a
                href={buyUrl}
                target="_blank"
                rel="noopener noreferrer sponsored nofollow"
                onClick={close}
                className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-ember-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-ember-600"
              >
                <ShoppingBag size={16} strokeWidth={2.2} />
                구매하러 가기
              </a>
            ) : (
              <Link
                href={`/gear#${item.category}`}
                onClick={close}
                className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-ember-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-ember-600"
              >
                <ShoppingBag size={16} strokeWidth={2.2} />
                구매하러 가기
              </Link>
            )}
            <Link
              href="/gear"
              onClick={close}
              className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-forest-600 px-4 py-3 text-sm font-bold text-forest-700 transition-colors hover:bg-forest-50"
            >
              용품 구경하기
              <ArrowRight size={15} strokeWidth={2.2} />
            </Link>
            <button
              type="button"
              onClick={close}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-neutral-500 transition-colors hover:text-neutral-700"
            >
              창 닫기
            </button>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">
            쿠팡 파트너스 예시입니다. 실제 제휴 링크는 준비 중이며, 연결 시 구매
            금액의 일정 수수료를 받을 수 있습니다.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
