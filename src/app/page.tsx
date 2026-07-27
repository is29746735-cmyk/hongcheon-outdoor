import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, BadgeCheck, Camera, ArrowRight } from "lucide-react";
import OutdoorIndexWidget from "@/components/OutdoorIndexWidget";
import PlaceBrowser from "@/components/PlaceBrowser";
import HeroPicker from "@/components/HeroPicker";
import HeroAtmosphere from "@/components/HeroAtmosphere";
import { getAllPlaces } from "@/data/places";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const placeCount = getAllPlaces().length;

  return (
    <div className="pb-16">
      {/*
        ── Hero — 홍천강의 지금 ──
        등고선 텍스처(물결) 대신 살아 있는 배경을 둔다(2026-07-27).
        시간대·계절·현재 날씨에 따라 하늘이 바뀌고, 아래에서는 모닥불이 탄다.
        마우스·손가락이 지나가면 그 자리에 바람이 인다. 자세한 규칙은
        `HeroAtmosphere` / `lib/atmosphere.ts` 참조.
        (등고선 시그니처는 /gear·/experiences·장소 카드에 그대로 남아 있다.)

        아래 그라데이션은 캔버스가 뜨기 전(그리고 JS가 없을 때)의 바탕이다.
      */}
      <section className="relative overflow-hidden bg-gradient-to-b from-forest-800 via-forest-700 to-river-700">
        <HeroAtmosphere />

        <div className="relative mx-auto max-w-6xl px-4 pb-44 pt-14 text-center sm:pb-52 sm:pt-20">
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

          <HeroPicker />

          {/*
            신뢰 안내. "검증 12곳"·"무협찬 큐레이션"처럼 압축된 말은 무슨 뜻인지
            전달되지 않는다는 지적(2026-07-27)에 따라, 무엇을 어디서 확인했는지
            풀어서 적는다. 출처명은 places.ts 의 sourceName 에 실제로 있는 것들이다.
          */}
          <div className="mx-auto mt-7 max-w-xl space-y-2 text-[13px] leading-relaxed text-white/85">
            <p className="inline-flex items-start gap-1.5 text-left">
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0 text-forest-300"
                strokeWidth={2.2}
              />
              <span>
                <b className="font-bold tabular-nums text-white">{placeCount}곳</b> 모두
                공식·전문 출처로 확인했습니다 — 홍천군 문화관광포털, 한국관광공사(고캠핑
                ·대한민국 구석구석), 캠핑·낚시 전문 매체. 장소마다 출처 링크를 답니다.
              </span>
            </p>
            <p className="inline-flex items-start gap-1.5 text-left">
              <BadgeCheck
                className="mt-0.5 h-4 w-4 shrink-0 text-forest-300"
                strokeWidth={2.2}
              />
              <span>
                <b className="font-bold text-white">광고비나 협찬을 받지 않습니다.</b>{" "}
                업체가 돈을 내고 순위를 올리거나 목록에 들어올 수 없습니다.
              </span>
            </p>
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

      {/*
        경험담 안내 — 목록을 다 훑고 내려온 사람에게 "다녀온 사람들의 이야기"를 권한다.
        커머스 배너(GearPromoBand)와 톤이 겹치지 않게 흰 카드 + 그린 계열로 조용히 둔다.
      */}
      <section className="mx-auto mt-16 max-w-6xl px-4" aria-label="경험담 안내">
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-forest-200 bg-white p-6 sm:p-7">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-forest-600">
              <Camera className="h-4 w-4" strokeWidth={2.2} />
              방문자 경험담
            </span>
            <h2 className="mt-2 text-xl font-extrabold text-forest-800 sm:text-2xl">
              경험담이 궁금하신가요?
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-neutral-600">
              직접 다녀온 사람들이 남긴 사진과 이야기를 모았습니다. 진입로·주차·수위처럼
              가 보지 않으면 알기 어려운 것들이 여기 있습니다.
            </p>
          </div>
          <Link
            href="/experiences"
            className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-sm bg-forest-700 px-5 text-sm font-bold text-white transition-colors hover:bg-forest-800"
          >
            경험담 바로가기
            <ArrowRight size={16} strokeWidth={2.4} />
          </Link>
        </div>
      </section>
    </div>
  );
}
