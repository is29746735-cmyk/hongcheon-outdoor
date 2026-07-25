import type { Metadata } from "next";
import { ShieldCheck, Gauge, BadgeCheck } from "lucide-react";
import OutdoorIndexWidget from "@/components/OutdoorIndexWidget";
import PlaceBrowser from "@/components/PlaceBrowser";
import HeroSearch from "@/components/HeroSearch";
import { getAllPlaces } from "@/data/places";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

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
          <h1 className="mx-auto mt-6 max-w-2xl text-[2.1rem] font-extrabold leading-[1.12] text-white sm:text-[3.2rem]">
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

      {/*
        장소 목록. 용품 진입 배너(GearPromoBand)는 여기 안쪽 —
        연계 추천과 장소 목록 사이 — 로 옮겼다(2026-07-25).
      */}
      <div className="mx-auto mt-12 max-w-6xl px-4">
        <PlaceBrowser />
      </div>
    </div>
  );
}
