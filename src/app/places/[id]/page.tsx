import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPlaces, getPlaceById } from "@/data/places";
import { CATEGORY_LABELS } from "@/constants";
import { formatRating } from "@/lib/utils";
import PlaceImage from "@/components/PlaceImage";
import MapLinkButtons from "@/components/MapLinkButtons";

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
  return {
    title: place.name,
    description: place.summary,
  };
}

export default function PlaceDetailPage({ params }: PageProps) {
  const place = getPlaceById(params.id);
  if (!place) notFound();

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
      {place.thumbnail && (
        <p className="mt-2 text-right text-xs text-neutral-400">
          대표 이미지는 분위기 컷(위키미디어 공용, CC)으로 실제 현장과 다를 수
          있습니다.
        </p>
      )}

      {/* 추가 이미지 갤러리 (place.images 에 실제 URL을 넣으면 표시) */}
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
            <span className="rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold text-white">
              🎣 캠핑+낚시
            </span>
          )}
          {place.rating != null && (
            <span className="text-sm text-amber-500">
              {formatRating(place.rating)}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-bold text-neutral-900">
          {place.name}
        </h1>
        <p className="mt-2 text-neutral-600">{place.summary}</p>
      </header>

      <section className="mt-8 leading-relaxed text-neutral-800">
        <p>{place.description}</p>
      </section>

      {/* 캠핑 ↔ 낚시 연계 강조 */}
      {place.connectedFishing && place.connectionNote && (
        <section className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5">
          <h2 className="text-sm font-bold text-sky-800">
            🎣 캠핑 + 낚시 연계 포인트
          </h2>
          <p className="mt-2 text-sm text-neutral-700">{place.connectionNote}</p>
        </section>
      )}

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

      {/* 지도 앱으로 위치 보기 */}
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-neutral-500">
          지도에서 위치 보기
        </h2>
        <MapLinkButtons place={place} />
      </section>

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

      {/* 정보 출처 (검증) */}
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
    </article>
  );
}
