import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import GearCatalog from "@/components/gear/GearCatalog";

export const metadata: Metadata = {
  title: "낚시·캠핑 용품",
  description:
    "홍천강 낚시·캠핑 준비물부터 감성 아이템·먹거리까지 한곳에서. 품목별 구매 팁과 실사용 주의사항을 함께 정리했습니다.",
  alternates: { canonical: "/gear" },
};

export default function GearPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* ── 커머스 헤더 — 엠버 강조 + 등고선 시그니처 ── */}
      <header className="relative overflow-hidden rounded-3xl border border-ember-100 bg-gradient-to-br from-sand-50 to-ember-50 p-6 sm:p-8">
        {/* 등고선 텍스처(시그니처, 엠버 톤으로 옅게) */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full text-ember-300 opacity-[0.16]"
          viewBox="0 0 1200 320"
          preserveAspectRatio="none"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M-20 90 C 250 50, 500 130, 760 80 S 1180 60, 1230 100" />
          <path d="M-20 160 C 280 120, 520 200, 780 150 S 1180 130, 1230 170" />
          <path d="M-20 230 C 240 190, 540 270, 800 220 S 1180 210, 1230 240" />
        </svg>
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-sm bg-ember-100/50 blur-2xl" />

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-ember-500 px-2.5 py-1 text-xs font-bold text-white">
            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.4} />
            준비물 · 쿠팡 최저가
          </span>
          <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-forest-900 sm:text-[1.9rem]">
            떠나기 전, 용품 준비하기
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-600">
            홍천강 낚시와 캠핑에 필요한 용품을 한곳에 모았습니다. 품목을 누르면
            설명과 구매 팁·주의사항을 함께 볼 수 있습니다.
          </p>
        </div>
      </header>

      <p className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs leading-relaxed text-neutral-500">
        쇼핑 버튼은 쿠팡 파트너스 링크로 운영될 예정입니다. 이 페이지는 쿠팡
        파트너스 활동의 일환으로, 구매 시 일정 수수료를 받을 수 있습니다. 현재는
        예시로, 실제 링크는 아직 연결되어 있지 않습니다.
      </p>

      <GearCatalog />
    </main>
  );
}
