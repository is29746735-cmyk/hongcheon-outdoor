import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import GearCatalog from "@/components/gear/GearCatalog";
import GearSpotlight from "@/components/gear/GearSpotlight";
import { getStarterPicks } from "@/data/gear";

export const metadata: Metadata = {
  title: "낚시·캠핑 용품",
  description:
    "홍천강 낚시·캠핑 준비물부터 감성 아이템·먹거리까지 한곳에서. 품목별 구매 팁과 실사용 주의사항을 함께 정리했습니다.",
  alternates: { canonical: "/gear" },
};

export default function GearPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/*
        ── 커머스 매스트헤드 ──
        2026-08-14 리뷰: "위쪽 빨간색, 상단-중단 대비감 부족".
        원인이 둘이었다 —
        ① 솔리드 엠버 배지(#c6461f)가 첫 화면에서 유일하게 짙은 색이라, 정작
           제목이 아니라 13px 설명 라벨이 시선을 다 가져갔다.
        ② 헤더 그라디언트가 **페이지 배경과 똑같은 sand-50 에서 시작**해
           위쪽 가장자리가 아예 안 보였다. 그 아래 블록들도 전부 순백(휘도 1.0)
           이라 페이지 배경과 1.19:1 — 상단부터 중단까지 값이 평평했다.
        → 헤더를 moss-700 매스트헤드로 세워 명암을 만들고(흰 글자 9.7:1),
          배지는 채움을 걷어 조용한 칩으로 낮춘다. 이제 이 구역에서 제일 강한
          것은 제목이다. moss-700 은 폐기한 용품 배너가 쓰던 색이라
          '용품 = 그레이-그린' 정체성은 그대로 이어진다.
      */}
      <header className="relative overflow-hidden rounded-3xl bg-moss-700 p-6 text-white sm:p-8">
        {/* 등고선/그리드 시그니처(옅게) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent 0 33px,#fff 33px 34px),repeating-linear-gradient(90deg,transparent 0 33px,#fff 33px 34px)",
          }}
        />
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-sm bg-clay-500/20 blur-3xl" />

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.12em] text-white/60">
            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.4} />
            준비물 · 쿠팡 최저가
          </span>
          <h1 className="mt-2.5 text-2xl font-extrabold text-white sm:text-[1.9rem]">
            떠나기 전, 용품 준비하기
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
            홍천강 낚시와 캠핑에 필요한 용품을 한곳에 모았습니다. 품목을 누르면
            설명과 구매 팁·주의사항을 함께 볼 수 있습니다.
          </p>
        </div>
      </header>

      {/*
        시선 고정점 — 헤더 다음이 곧장 34장 격자라 눈이 멈출 데가 없었다
        (2026-08-14). 면책 문구가 있던 자리다: 필요한 고지지만 목록 진입 전
        첫 인상을 3줄 회색 박스가 차지할 이유는 없어서 목록 아래로 내렸다.
      */}
      <GearSpotlight items={getStarterPicks()} />

      <GearCatalog />

      <p className="mt-10 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs leading-relaxed text-neutral-600">
        쇼핑 버튼은 쿠팡 파트너스 링크로 운영될 예정입니다. 이 페이지는 쿠팡
        파트너스 활동의 일환으로, 구매 시 일정 수수료를 받을 수 있습니다. 현재는
        예시로, 실제 링크는 아직 연결되어 있지 않습니다.
      </p>
    </main>
  );
}
