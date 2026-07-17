"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import type { GearCategory, GearItem } from "@/data/gear";

/**
 * 장소 목록 격자 사이에 자연스럽게 끼어드는 '추천 용품' 인피드 카드 — 커머스 진입점.
 * 강제 시작 모달을 대체한다: 흐름을 막지 않고, 보고 있는 장소 카테고리에 맞춰
 * 관련 용품 하나만 조용히 권한다.
 *
 * 장소 카드(PlaceCard)와 같은 격자 셀·높이(rounded-3xl·shadow-card·aspect-[4/3] 커버)를
 * 쓰되, 광고가 아니라 '추천'으로 읽히도록 엠버 톤 + '추천 용품' 라벨로 구분한다.
 *
 * shops[].url 이 채워지면 CTA가 실제 제휴 링크(새 창)로 전환되고,
 * 그전까지는 용품 페이지의 해당 카테고리로 안내한다.
 */
const GEAR_CAT_LABEL: Record<GearCategory, string> = {
  camping: "캠핑용품",
  fishing: "낚시용품",
  aesthetic: "감성 아이템",
  food: "먹거리",
};

export default function InFeedGearCard({ item }: { item: GearItem }) {
  const label = GEAR_CAT_LABEL[item.category] ?? "추천 용품";
  const buyUrl = item.shops.find((s) => s.url)?.url;

  const ctaClass =
    "mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-sm bg-ember-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ember-600";

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-ember-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-ember-400 hover:shadow-card-hover">
      {/* 커버 — 이미지 슬롯 대체(엠버 그라디언트 + 등고선/그리드 시그니처) */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-ember-500 to-ember-600">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent 0 26px,#fff 26px 27px),repeating-linear-gradient(90deg,transparent 0 26px,#fff 26px 27px)",
          }}
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-sm bg-white/95 px-2.5 py-1 text-xs font-bold text-ember-700 shadow-sm backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
          추천 용품
        </span>
        <div className="absolute inset-0 grid place-items-center">
          <ShoppingBag className="h-12 w-12 text-white/90" strokeWidth={1.6} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ember-600">
          {label} · 쿠팡 최저가
        </span>
        <h3 className="mt-1 text-[15px] font-bold leading-snug text-neutral-900 transition-colors group-hover:text-ember-700">
          {item.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-600">
          {item.summary}
        </p>

        {item.tags && item.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-md bg-sand-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-3.5">
          {buyUrl ? (
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer sponsored nofollow"
              className={ctaClass}
            >
              <ShoppingBag size={16} strokeWidth={2.2} />
              구매하러 가기
            </a>
          ) : (
            <Link href={`/gear#${item.category}`} className={ctaClass}>
              <ShoppingBag size={16} strokeWidth={2.2} />
              용품 보러가기
              <ArrowRight size={15} strokeWidth={2.2} />
            </Link>
          )}
          <p className="mt-2 text-center text-[11px] text-neutral-400">
            쿠팡 파트너스 예시 · 제휴 링크 준비 중
          </p>
        </div>
      </div>
    </div>
  );
}
