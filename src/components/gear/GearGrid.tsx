"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ShoppingBag,
  X,
  Lightbulb,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import type { GearItem, ShopLink } from "@/data/gear";
import { useFocusTrap } from "@/lib/useFocusTrap";

/** 쇼핑몰 버튼 — url이 있으면 활성 링크, 없으면 '준비 중' 예시 버튼. */
function ShopButton({ shop }: { shop: ShopLink }) {
  if (shop.url) {
    return (
      <a
        href={shop.url}
        target="_blank"
        rel="noopener noreferrer sponsored nofollow"
        className="inline-flex items-center gap-1.5 rounded-xl bg-ember-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ember-600"
      >
        <ShoppingBag size={15} strokeWidth={2.2} />
        {shop.store} 최저가 보기
      </a>
    );
  }
  return (
    <span
      aria-disabled="true"
      title="제휴 링크 준비 중 (예시)"
      className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-sm font-semibold text-neutral-400"
    >
      <ShoppingBag size={15} strokeWidth={2.2} />
      {shop.store}
    </span>
  );
}

function Tags({ tags }: { tags?: string[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span
          key={t}
          className="rounded-full bg-forest-50 px-2.5 py-1 text-xs font-medium text-forest-700"
        >
          #{t}
        </span>
      ))}
    </div>
  );
}

/** 품목 설명창(모달). 배경 블러 + X·바깥클릭·ESC로 닫기. */
function GearModal({ item, onClose }: { item: GearItem; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(true, panelRef);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`${item.name} 설명`}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
        >
          <X className="h-4 w-4" strokeWidth={2.2} />
        </button>

        <h2 className="pr-8 text-xl font-extrabold text-neutral-900">
          {item.name}
        </h2>
        {item.tags && item.tags.length > 0 && (
          <div className="mt-2">
            <Tags tags={item.tags} />
          </div>
        )}

        {item.description && (
          <p className="mt-3 text-sm leading-relaxed text-neutral-700">
            {item.description}
          </p>
        )}

        {item.tips && item.tips.length > 0 && (
          <div className="mt-5">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-neutral-900">
              <Lightbulb size={16} strokeWidth={2.2} className="text-forest-600" />
              구매 팁
            </h3>
            <ul className="mt-2 space-y-1.5">
              {item.tips.map((tip) => (
                <li
                  key={tip}
                  className="flex gap-2 text-sm leading-relaxed text-neutral-600"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-forest-400" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {item.cautions && item.cautions.length > 0 && (
          <div className="mt-5 rounded-xl bg-amber-50 p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-neutral-900">
              <AlertTriangle
                size={16}
                strokeWidth={2.2}
                className="text-[#fe9800]"
              />
              주의
            </h3>
            <ul className="mt-2 space-y-1.5">
              {item.cautions.map((c) => (
                <li
                  key={c}
                  className="flex gap-2 text-sm leading-relaxed text-neutral-700"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#fe9800]" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 border-t border-neutral-200 pt-5">
          <p className="text-xs font-semibold text-neutral-500">구매처</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {item.shops.map((shop) => (
              <ShopButton key={shop.store} shop={shop} />
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-neutral-400">
            쿠팡 파트너스 링크는 준비 중입니다(예시). 이 포스팅은 쿠팡 파트너스
            활동의 일환으로, 구매 시 일정 수수료를 받을 수 있습니다.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** 클릭하면 설명창이 열리는 용품 카드 그리드. /gear 와 상세 페이지에서 공용. */
export default function GearGrid({
  items,
  gridClassName = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
}: {
  items: GearItem[];
  /** 그리드 컬럼 클래스 override (상세 페이지는 2열 등) */
  gridClassName?: string;
}) {
  const [selected, setSelected] = useState<GearItem | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <div className={gridClassName}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(item)}
            aria-haspopup="dialog"
            className="group flex h-full flex-col rounded-2xl bg-white p-5 text-left shadow-card transition hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-600"
          >
            <h3 className="text-base font-bold text-neutral-900">{item.name}</h3>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-neutral-600">
              {item.summary}
            </p>
            {item.tags && item.tags.length > 0 && (
              <div className="mt-3">
                <Tags tags={item.tags} />
              </div>
            )}
            <span className="mt-4 inline-flex items-center gap-0.5 text-sm font-semibold text-forest-600">
              자세히 보기
              <ChevronRight
                size={15}
                strokeWidth={2.4}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </button>
        ))}
      </div>

      {selected && mounted && (
        <GearModal item={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
