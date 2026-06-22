import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Fish,
  CircleCheck,
  Lightbulb,
  CarFront,
  Building2,
} from "lucide-react";
import { getAllPlaces, getPlaceById } from "@/data/places";
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
  return { title: place.name, description: place.summary };
}

export default function SpotDetailPage({ params }: PageProps) {
  const place = getPlaceById(params.id);
  if (!place) notFound();
  const detail = getSpotDetail(place.id);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/#list"
        className="text-sm text-neutral-500 transition-colors hover:text-forest-600"
      >
        ← 목록으로
      </Link>

      {/* 대표 이미지 */}
      <PlaceImage
        place={place}
        className="mt-4 aspect-[16/9] rounded-2xl"
        sizes="(max-width: 768px) 100vw, 768px"
      />
      {place.images && place.images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {place.images.map((img) => (
            <PlaceImage
              key={img}
              place={place}
              src={img}
              className="aspect-square rounded-xl"
              sizes="(max-width: 768px) 33vw, 240px"
            />
          ))}
        </div>
      )}

      {/* 헤더 */}
      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-forest-600 px-3 py-1 text-xs font-semibold text-white">
            {CATEGORY_LABELS[place.category]}
          </span>
          {place.official && (
            <span className="rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-700">
              공식 운영
            </span>
          )}
          {place.connectedFishing && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold text-white">
              <Fish className="h-3.5 w-3.5" strokeWidth={2.2} />
              캠핑+낚시
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

      <section className="mt-7 leading-relaxed text-neutral-800">
        <p>{place.description}</p>
      </section>

      {/* 예약 (현재 비작동 — 준비 중). 숙박 예약이 의미 있는 캠핑·차박에만 노출 */}
      {(place.category === "camping" || place.category === "carcamping") && (
        <div className="mt-6">
          <ReservationBox place={place} />
        </div>
      )}

      {/* 오늘의 아웃도어 지수 */}
      <section className="mt-7">
        <OutdoorIndexWidget />
      </section>

      {/* 캠핑 ↔ 낚시 연계 강조 */}
      {place.connectedFishing && place.connectionNote && (
        <section className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-sky-800">
            <Fish className="h-4 w-4" strokeWidth={2} />
            캠핑 + 낚시 연계 포인트
          </h2>
          <p className="mt-2 text-sm text-neutral-700">{place.connectionNote}</p>
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
                className="inline-flex items-center gap-1.5 rounded-full bg-sand-100 px-3 py-1.5 text-sm font-medium text-neutral-700"
              >
                <CircleCheck className="h-4 w-4 text-forest-500" strokeWidth={2} />
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
              <li key={tip} className="flex gap-2.5 text-sm leading-relaxed text-neutral-700">
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

      {/* 기본 정보 */}
      <dl className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-neutral-200 p-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-semibold text-neutral-500">소재지</dt>
          <dd className="mt-1 text-neutral-900">{place.region}</dd>
        </div>
        {place.phone && (
          <div>
            <dt className="text-sm font-semibold text-neutral-500">전화</dt>
            <dd className="mt-1 text-neutral-900">{place.phone}</dd>
          </div>
        )}
      </dl>

      {/* 저장 · 링크 복사 · 길찾기 */}
      <div className="mt-6 space-y-2.5">
        <SaveButton placeId={place.id} />
        <SpotActions place={place} />
      </div>

      {/* 지도 앱으로 위치 보기 */}
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-neutral-500">
          지도에서 위치 보기
        </h2>
        <MapLinkButtons place={place} />
      </section>

      {/* AI 추천 코스 */}
      <CourseMap place={place} />

      <div className="mt-6 flex flex-wrap gap-2">
        {place.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-forest-50 px-3 py-1 text-sm text-forest-700"
          >
            #{tag}
          </span>
        ))}
      </div>

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

      {/* 이용자 리뷰 (DB · 로그인 기반) */}
      <CommentSection placeId={place.id} location={place.location} />
    </article>
  );
}
