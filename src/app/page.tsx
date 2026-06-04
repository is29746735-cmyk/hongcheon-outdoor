import Link from "next/link";
import OutdoorIndexWidget from "@/components/OutdoorIndexWidget";
import PlaceBrowser from "@/components/PlaceBrowser";
import { SITE } from "@/constants";

export default function HomePage() {
  return (
    <div className="pb-16">
      {/* Hero — 자연 그라디언트 배경 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest-800 via-forest-700 to-forest-500">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20 [background:radial-gradient(60%_60%_at_20%_0%,#fff_0%,transparent_60%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-16 text-center sm:pt-20">
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/20">
            강원 홍천 · 캠핑 · 낚시 · 차박 큐레이션
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
            홍천에서 즐기는
            <br className="sm:hidden" /> 캠핑 &amp; 낚시
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-forest-50/90">
            {SITE.description} 검증된 명소만 모아, 지도와 함께 한눈에.
          </p>
          <div className="mt-7 flex justify-center">
            <Link
              href="#list"
              className="rounded-full bg-white px-6 py-3 text-sm font-bold text-forest-700 shadow-lg shadow-forest-900/20 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              장소 둘러보기 ↓
            </Link>
          </div>
        </div>
      </section>

      {/* 오늘의 아웃도어 지수 — 히어로 위로 살짝 겹치는 카드 */}
      <div className="mx-auto -mt-20 max-w-6xl px-4">
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
