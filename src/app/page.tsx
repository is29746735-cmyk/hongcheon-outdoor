import type { Metadata } from "next";
import OutdoorIndexWidget from "@/components/OutdoorIndexWidget";
import PlaceBrowser from "@/components/PlaceBrowser";
import HeroSearch from "@/components/HeroSearch";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="pb-16">
      {/* Hero — 검색 우선 + 깊이감(그라데이션·등고선 텍스처) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-forest-700 to-forest-900">
        {/* 등고선 텍스처 — 단색 배너에 깊이를 더함 */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.13]"
          viewBox="0 0 1200 520"
          preserveAspectRatio="none"
          fill="none"
          stroke="#fff"
          strokeWidth="1.5"
        >
          <path d="M-20 150 C 250 90, 500 210, 760 130 S 1180 100, 1230 160" />
          <path d="M-20 240 C 280 180, 520 300, 780 220 S 1180 190, 1230 250" />
          <path d="M-20 330 C 240 270, 540 390, 800 310 S 1180 290, 1230 340" />
          <path d="M-20 420 C 300 360, 560 470, 820 400 S 1180 380, 1230 430" />
        </svg>
        <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-16 text-center sm:pt-20">
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/20">
            강원 홍천 · 캠핑 · 낚시 · 차박 큐레이션
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl">
            홍천에서 즐기는
            <br className="sm:hidden" /> 캠핑 &amp; 낚시
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-sand-100/90">
            검증된 캠핑장·낚시터·차박지를 검색해 보세요.
          </p>
          <HeroSearch />
        </div>
      </section>

      {/* 오늘의 아웃도어 지수 — 히어로 위로 살짝 겹치는 카드 */}
      <div className="relative z-10 mx-auto -mt-20 max-w-6xl px-4">
        <div className="rounded-2xl shadow-card">
          <OutdoorIndexWidget />
        </div>
      </div>

      {/* 장소 목록 */}
      <div className="mx-auto mt-12 max-w-6xl px-4">
        <PlaceBrowser />
      </div>
    </div>
  );
}
