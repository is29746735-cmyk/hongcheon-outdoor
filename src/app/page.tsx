import type { Metadata } from "next";
import Link from "next/link";
import { Tent, Fish, Sparkles, Utensils, ArrowRight } from "lucide-react";
import OutdoorIndexWidget from "@/components/OutdoorIndexWidget";
import PlaceBrowser from "@/components/PlaceBrowser";
import HeroSearch from "@/components/HeroSearch";

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

      {/* 용품 준비하기 — 홈에서 바로 용품으로 가는 진입점 */}
      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="rounded-2xl border border-neutral-200 bg-sand-50 p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="inline-block rounded-full bg-forest-100 px-2.5 py-1 text-xs font-bold text-forest-700">
                준비물
              </span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-forest-800">
                캠핑·낚시 용품 준비하기
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                떠나기 전 필요한 준비물을 한곳에서. 품목별 구매 팁과 실사용
                주의사항까지 정리했어요.
              </p>
            </div>
            <Link
              href="/gear"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-forest-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-700"
            >
              용품 전체 보기
              <ArrowRight size={16} strokeWidth={2.2} />
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {GEAR_CATS.map(({ key, label, Icon }) => (
              <Link
                key={key}
                href={`/gear#${key}`}
                className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-4 py-3.5 transition hover:border-forest-300 hover:shadow-card"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-forest-50 text-forest-700">
                  <Icon size={18} strokeWidth={2} />
                </span>
                <span className="text-sm font-bold text-neutral-800">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
