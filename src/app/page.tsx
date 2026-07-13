import type { Metadata } from "next";
import Link from "next/link";
import {
  Tent,
  Fish,
  Sparkles,
  Utensils,
  ArrowRight,
  ShieldCheck,
  Gauge,
  BadgeCheck,
} from "lucide-react";
import OutdoorIndexWidget from "@/components/OutdoorIndexWidget";
import PlaceBrowser from "@/components/PlaceBrowser";
import HeroSearch from "@/components/HeroSearch";
import { getAllPlaces } from "@/data/places";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** 홈 → 용품 진입용 카테고리 바로가기 */
const GEAR_CATS = [
  { key: "camping", label: "캠핑용품", Icon: Tent },
  { key: "fishing", label: "낚시용품", Icon: Fish },
  { key: "aesthetic", label: "감성 아이템", Icon: Sparkles },
  { key: "food", label: "먹거리", Icon: Utensils },
] as const;

export default function HomePage() {
  const placeCount = getAllPlaces().length;

  return (
    <div className="pb-16">
      {/* ── Hero — 강가의 하루: 강물빛 그라데이션 + 등고선 시그니처 ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-forest-800 via-forest-700 to-river-700">
        {/* 등고선 텍스처(시그니처) */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]"
          viewBox="0 0 1200 560"
          preserveAspectRatio="none"
          fill="none"
          stroke="#fff"
          strokeWidth="1.5"
        >
          <path d="M-20 150 C 250 90, 500 210, 760 130 S 1180 100, 1230 160" />
          <path d="M-20 240 C 280 180, 520 300, 780 220 S 1180 190, 1230 250" />
          <path d="M-20 330 C 240 270, 540 390, 800 310 S 1180 290, 1230 340" />
          <path d="M-20 420 C 300 360, 560 470, 820 400 S 1180 380, 1230 430" />
          <path d="M-20 500 C 260 445, 560 545, 810 480 S 1180 465, 1230 505" />
        </svg>
        {/* 강물빛 글로우 */}
        <div className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-sm bg-river-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 top-40 h-56 w-56 rounded-sm bg-forest-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-32 pt-14 text-center sm:pt-20">
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white ring-1 ring-white/25 backdrop-blur">
            <span className="h-1.5 w-1.5 bg-ember-400" />
            강원 홍천 · 캠핑 · 낚시 · 차박
          </span>
          <h1 className="mx-auto mt-6 max-w-2xl text-[2.1rem] font-extrabold leading-[1.12] tracking-tight text-white sm:text-[3.2rem]">
            홍천강, 오늘
            <br className="sm:hidden" /> 어디로 떠날까요?
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-river-50/85 sm:text-base">
            검증된 캠핑장·낚시터·차박지를 지도와 함께. 과장 없이, 협찬 없이
            정리했습니다.
          </p>

          <HeroSearch />

          {/* 신뢰 스탯 */}
          <div className="mx-auto mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-medium text-white/85">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-forest-300" strokeWidth={2.2} />
              검증 <span className="font-bold tabular-nums">{placeCount}</span>곳
            </span>
            <span className="h-3 w-px bg-white/25" />
            <span className="inline-flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-forest-300" strokeWidth={2.2} />
              실시간 아웃도어 지수
            </span>
            <span className="h-3 w-px bg-white/25" />
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-forest-300" strokeWidth={2.2} />
              무협찬 큐레이션
            </span>
          </div>
        </div>
      </section>

      {/* 오늘의 아웃도어 지수 — 히어로 위로 살짝 겹치는 카드 */}
      <div className="relative z-10 mx-auto -mt-20 max-w-6xl px-4">
        <div className="rounded-sm shadow-card">
          <OutdoorIndexWidget />
        </div>
      </div>

      {/* 장소 목록 */}
      <div className="mx-auto mt-12 max-w-6xl px-4">
        <PlaceBrowser />
      </div>

      {/* ── 용품 준비하기 — 커머스 진입점(그레이-그린 박스 + 오렌지 강조) ── */}
      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-sm bg-moss-700 p-6 text-white sm:p-8">
          {/* 등고선/그리드 시그니처(옅게) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg,transparent 0 33px,#fff 33px 34px),repeating-linear-gradient(90deg,transparent 0 33px,#fff 33px 34px)",
            }}
          />
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-sm bg-ember-500/10 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
                <ShoppingBagGlyph />
                준비물 · 쿠팡 최저가
              </span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-[1.7rem]">
                떠나기 전, 용품 준비하기
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
                캠핑·낚시 필수품부터 감성 아이템·먹거리까지. 품목별 구매 팁과
                실사용 주의사항을 함께 정리했어요.
              </p>
            </div>
            <Link
              href="/gear"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-ember-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ember-600"
            >
              용품 전체 보기
              <ArrowRight size={16} strokeWidth={2.4} />
            </Link>
          </div>
          <div className="relative mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {GEAR_CATS.map(({ key, label, Icon }) => (
              <Link
                key={key}
                href={`/gear#${key}`}
                className="group flex items-center gap-2.5 rounded-sm border border-white/10 bg-white/[0.06] px-4 py-3.5 transition-colors hover:border-ember-400/60 hover:bg-white/[0.1]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-white/10 text-white transition-colors group-hover:bg-ember-500 group-hover:text-white">
                  <Icon size={18} strokeWidth={2} />
                </span>
                <span className="text-sm font-bold text-white">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/** 인라인 쇼핑백 글리프 (배지용 — lucide 대신 작은 커스텀) */
function ShoppingBagGlyph() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
