import Image from "next/image";
import type { Place, PlaceCategory } from "@/types/place";
import { CATEGORY_LABELS } from "@/constants";
import { CategoryIcon } from "@/components/icons";

/**
 * 장소 이미지 슬롯.
 * 실제 이미지(URL/파일)가 있으면 next/image 로 렌더링하고,
 * 아직 없으면(=placeholder 경로) 카테고리 색 그라데이션 + 등고선 + 아이콘 타일을 보여준다.
 * (회색 빈 박스 대신 "의도된" 브랜드 타일 — 사진은 현장 동의 후 교체)
 *
 * 실제 사진 연동: data/places.ts 의 thumbnail / images 에 URL(또는 /public 경로)을 넣으면
 * 자동으로 사진이 표시됩니다. ("placeholder" 가 포함된 경로는 빈 슬롯으로 간주)
 */
function isPlaceholder(src?: string): boolean {
  return !src || src.includes("placeholder");
}

/** 카테고리별 플레이스홀더 그라데이션 — 자연 팔레트(캠핑=숲, 낚시=강물, 차박=노을) */
const CATEGORY_GRADIENT: Record<PlaceCategory, string> = {
  camping: "from-forest-500 to-forest-700",
  fishing: "from-river-400 to-river-600",
  carcamping: "from-ember-300 to-clay-500",
};

interface PlaceImageProps {
  place: Place;
  /** 개별 이미지 경로 지정 (기본값: place.thumbnail) */
  src?: string;
  /** 컨테이너 클래스 (aspect-ratio, rounded 등) */
  className?: string;
  sizes?: string;
  /** alt 텍스트 오버라이드 (기본값: "이름 — 카테고리, 소재지") */
  alt?: string;
}

export default function PlaceImage({
  place,
  src,
  className = "",
  sizes = "(max-width: 768px) 100vw, 400px",
  alt,
}: PlaceImageProps) {
  const url = src ?? place.thumbnail;
  const altText =
    alt ?? `${place.name} — ${CATEGORY_LABELS[place.category]}, ${place.region}`;

  if (!url || isPlaceholder(url)) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <div
          className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${CATEGORY_GRADIENT[place.category]}`}
        >
          {/* 부드러운 빛 (좌상단 하이라이트) */}
          <div className="absolute -left-6 -top-8 h-28 w-28 rounded-full bg-white/20 blur-2xl" />
          {/* 등고선 텍스처(시그니처) */}
          <svg
            aria-hidden
            className="absolute inset-0 h-full w-full opacity-[0.2]"
            viewBox="0 0 400 300"
            preserveAspectRatio="none"
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
          >
            <path d="M-10 70 C 80 45,160 105,250 70 S 410 55,420 85" />
            <path d="M-10 125 C 90 100,170 155,260 120 S 410 110,420 135" />
            <path d="M-10 185 C 70 160,180 210,250 180 S 410 175,420 195" />
            <path d="M-10 245 C 100 220,190 268,270 238 S 410 235,420 255" />
          </svg>
          <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-white/20 text-white ring-1 ring-white/30 backdrop-blur-sm">
            <CategoryIcon category={place.category} className="h-7 w-7" />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-neutral-100 ${className}`}>
      <Image
        src={url}
        alt={altText}
        fill
        sizes={sizes}
        className="object-cover"
      />
    </div>
  );
}
