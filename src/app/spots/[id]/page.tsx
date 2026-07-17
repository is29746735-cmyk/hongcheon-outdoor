import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Fish,
  CircleCheck,
  Lightbulb,
  CarFront,
  Building2,
  ShoppingBag,
  Camera,
  MessageSquare,
} from "lucide-react";
import { getAllPlaces, getPlaceById } from "@/data/places";
import { getGearByCategory } from "@/data/gear";
import GearGrid from "@/components/gear/GearGrid";
import { getSpotDetail } from "@/data/mockData";
import { CATEGORY_LABELS } from "@/constants";
import { formatRating } from "@/lib/utils";
import PlaceImage from "@/components/PlaceImage";
import MapLinkButtons from "@/components/MapLinkButtons";
import CourseMap from "@/components/CourseMap";
import OutdoorIndexWidget from "@/components/OutdoorIndexWidget";
import CommentSection from "@/components/CommentSection";
import SpotActions from "@/components/SpotActions";
import SaveButton from "@/components/SaveButton";
import NearbyShops from "@/components/NearbyShops";
import ReservationBox from "@/components/ReservationBox";
import FishingGuide from "@/components/FishingGuide";
import SpotTracker from "@/components/SpotTracker";
import PhoneLink from "@/components/PhoneLink";
import ExperienceSection from "@/components/ExperienceSection";
import { buildPlaceJsonLd } from "@/lib/place-jsonld";

interface PageProps {
  params: { id: string };
}

/** 빌드 시 상세 페이지를 정적으로 생성 (SSG) */
export function generateStaticParams() {
  return getAllPlaces().map((place) => ({ id: place.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const place = getPlaceById(params.id);
  if (!place) return { title: "장소를 찾을 수 없습니다" };
  const ogImage = place.thumbnail ?? "/og-default.png";
  return {
    title: place.name,
    description: place.summary,
    alternates: { canonical: `/spots/${place.id}` },
    openGraph: {
      title: place.name,
      description: place.summary,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630, alt: place.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: place.name,
      description: place.summary,
      images: [ogImage],
    },
  };
}

export default function SpotDetailPage({ params }: PageProps) {
  const place = getPlaceById(params.id);
  if (!place) notFound();
  const detail = getSpotDetail(place.id);

  // 이 장소에 맞는 준비물(용품) 추천 — 낚시 스팟은 낚시용품, 그 외는 캠핑용품
  const gearCategory = place.category === "fishing" ? "fishing" : "camping";
  const gearHeading =
    gearCategory === "fishing" ? "낚시 준비물" : "캠핑 준비물";
  const relatedGear = getGearByCategory(gearCategory).slice(0, 4);

  return (
    <article className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildPlaceJsonLd(place)),
        }}
      />
      <SpotTracker placeId={place.id} />
      <Link
        href="/#list"
        className="text-sm text-neutral-500 transition-colors hover:text-forest-600"
      >
        ← 목록으로
      </Link>

      {/* 대표 이미지 (풀폭) */}
      <PlaceImage
        place={place}
        className="mt-4 aspect-[16/9] rounded-2xl"
        sizes="(max-width: 768px) 100vw, 1152px"
      />
      {place.images && place.images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {place.images.map((img) => (
            <PlaceImage
              key={img}
              place={place}
              src={img}
              className="aspect-square rounded-xl"
              sizes="(max-width: 768px) 33vw, 360px"
            />
          ))}
        </div>
      )}

      {/* 헤더 (풀폭) */}
      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-sm bg-forest-600 px-3 py-1 text-xs font-semibold text-white">
            {CATEGORY_LABELS[place.category]}
          </span>
          {place.official && (
            <span className="rounded-sm bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-700">
              공식 운영
            </span>
          )}
          {place.connectedFishing && (
            <span className="inline-flex items-center gap-1 rounded-sm bg-river-500 px-3 py-1 text-xs font-semibold text-white">
              <Fish className="h-3.5 w-3.5" strokeWidth={2.2} />
              캠핑+낚시
            </span>
          )}
          {place.partnerId && (
            <span className="rounded-sm border border-forest-300 bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-700">
              검증 제휴처
            </span>
          )}
          {place.rating != null && (
            <span className="text-sm text-amber-500">
              {formatRating(place.rating)}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-forest-800 sm:text-4xl">
          {place.name}
        </h1>
        <p className="mt-2 text-neutral-600">{place.summary}</p>
      </header>

      {/* 아래 커뮤니티 섹션으로 바로가기 (같은 페이지 내 앵커 이동) */}
      <nav
        aria-label="섹션 바로가기"
        className="mt-5 flex gap-2.5"
      >
        <a
          href="#experiences"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-forest-600 bg-white px-4 py-2.5 text-sm font-bold text-forest-700 transition-colors hover:bg-forest-50"
        >
          <Camera className="h-4 w-4" strokeWidth={2} />
          경험담·사진
        </a>
        <a
          href="#reviews"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-forest-600 bg-white px-4 py-2.5 text-sm font-bold text-forest-700 transition-colors hover:bg-forest-50"
        >
          <MessageSquare className="h-4 w-4" strokeWidth={2} />
          리뷰
        </a>
      </nav>

      {/* ── 2단: 본문(좌) + sticky 액션 사이드바(우) ── */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
        {/* 사이드바 — 모바일: 헤더 바로 아래 / 데스크톱: 우측 sticky */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:col-start-2 lg:row-start-1 lg:self-start">
          {/* 예약 (현재 비작동 — 준비 중). 숙박 예약이 의미 있는 캠핑·차박에만 노출 */}
          {(place.category === "camping" ||
            place.category === "carcamping") && (
            <ReservationBox place={place} />
          )}

          {/* 방문 정보 & 액션 */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-5">
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-semibold text-neutral-500">
                  소재지
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-neutral-900">
                  {place.region}
                </dd>
              </div>
              {place.phone && (
                <div>
                  <dt className="text-xs font-semibold text-neutral-500">
                    전화
                  </dt>
                  <dd className="mt-0.5">
                    <PhoneLink placeId={place.id} phone={place.phone} />
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-4 space-y-2.5">
              <SaveButton placeId={place.id} />
              <SpotActions place={place} />
            </div>

            <div className="mt-4 border-t border-neutral-100 pt-4">
              <p className="mb-2 text-xs font-semibold text-neutral-500">
                지도 앱에서 열기
              </p>
              <MapLinkButtons place={place} compact />
            </div>
          </div>
        </aside>

        {/* ── 본문 ── */}
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <section className="leading-relaxed text-neutral-800">
            <p>{place.description}</p>
          </section>

          {/* 오늘의 아웃도어 지수 */}
          <section className="mt-7">
            <OutdoorIndexWidget />
          </section>

          {/* 캠핑 ↔ 낚시 연계 강조 */}
          {place.connectedFishing && place.connectionNote && (
            <section className="mt-6 rounded-2xl border border-river-200 bg-river-50 p-5">
              <h2 className="flex items-center gap-1.5 text-sm font-bold text-river-700">
                <Fish className="h-4 w-4" strokeWidth={2} />
                캠핑 + 낚시 연계 포인트
              </h2>
              <p className="mt-2 text-sm text-neutral-700">
                {place.connectionNote}
              </p>
            </section>
          )}

          {/* 낚시 전 확인 — 금어기·주의사항 (낚시 스팟 또는 캠핑+낚시 연계 장소) */}
          {(place.category === "fishing" || place.connectedFishing) && (
            <FishingGuide />
          )}

          {/* 현장 편의시설 */}
          {detail && detail.facilities.length > 0 && (
            <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-6">
              <h2 className="flex items-center gap-2 text-base font-extrabold text-neutral-900">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-forest-50 text-forest-700">
                  <Building2 className="h-4 w-4" strokeWidth={2} />
                </span>
                현장 편의시설
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {detail.facilities.map((f) => (
                  <li
                    key={f}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-sand-100 px-3 py-1.5 text-sm font-medium text-neutral-700"
                  >
                    <CircleCheck
                      className="h-4 w-4 text-forest-500"
                      strokeWidth={2}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 낚시/캠핑 꿀팁 */}
          {detail && detail.tips.length > 0 && (
            <section className="mt-6 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-sand-50 p-6">
              <h2 className="flex items-center gap-2 text-base font-extrabold text-neutral-900">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-100 text-amber-700">
                  <Lightbulb className="h-4 w-4" strokeWidth={2} />
                </span>
                낚시·캠핑 꿀팁
              </h2>
              <ul className="mt-4 space-y-2.5">
                {detail.tips.map((tip) => (
                  <li
                    key={tip}
                    className="flex gap-2.5 text-sm leading-relaxed text-neutral-700"
                  >
                    <Lightbulb
                      className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                      strokeWidth={2}
                    />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 네비게이션 주의사항 (진입로) */}
          {detail && detail.accessNote && (
            <section className="mt-6 flex gap-3 rounded-3xl border border-rose-200 bg-rose-50 p-6">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-600">
                <CarFront className="h-4 w-4" strokeWidth={2} />
              </span>
              <div>
                <h2 className="text-base font-extrabold text-neutral-900">
                  네비게이션 주의사항
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">
                  {detail.accessNote}
                </p>
              </div>
            </section>
          )}

          {/* AI 추천 코스 */}
          <CourseMap place={place} />

          <div className="mt-6 flex flex-wrap gap-2">
            {place.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-sm bg-forest-50 px-3 py-1 text-sm text-forest-700"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* 함께 준비하면 좋은 용품 — 커머스 진입점(엠버 강조, 홈과 동일 언어) */}
          {relatedGear.length > 0 && (
            <section className="relative mt-8 overflow-hidden rounded-3xl border border-ember-100 bg-gradient-to-br from-sand-50 to-ember-50 p-6">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-sm bg-ember-100/50 blur-2xl" />
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ember-500 text-white">
                    <ShoppingBag className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-sm bg-ember-500/10 px-2 py-0.5 text-[11px] font-bold text-ember-700">
                      쿠팡 최저가
                    </span>
                    <h2 className="mt-0.5 text-base font-extrabold text-forest-900">
                      {gearHeading}
                    </h2>
                  </div>
                </div>
                <Link
                  href={`/gear#${gearCategory}`}
                  className="shrink-0 text-sm font-bold text-ember-600 transition-colors hover:text-ember-700"
                >
                  더 보기 →
                </Link>
              </div>
              <div className="relative mt-5">
                <GearGrid
                  items={relatedGear}
                  gridClassName="grid grid-cols-1 gap-4 sm:grid-cols-2"
                />
              </div>
            </section>
          )}

          {place.sourceUrl && (
            <p className="mt-8 text-xs text-neutral-400">
              정보 출처:{" "}
              <a
                href={place.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-forest-600"
              >
                {place.sourceName ?? place.sourceUrl}
              </a>
            </p>
          )}

          {/* 함께 방문하면 좋은 로컬 스토어 (주변 실제 가게 실시간 검색) */}
          {place.location && <NearbyShops place={place} />}

          {/* 방문자 경험담·사진 (커뮤니티 · 로그인 기반) */}
          <ExperienceSection placeId={place.id} />

          {/* 이용자 리뷰 (DB · 로그인 기반) */}
          <CommentSection placeId={place.id} location={place.location} />
        </div>
      </div>
    </article>
  );
}
