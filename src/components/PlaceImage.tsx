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

/** 카테고리별 플레이스홀더 그라데이션 (지도 마커 색 체계와 일치) */
const CATEGORY_GRADIENT: Record<PlaceCategory, string> = {
  camping: "from-forest-500 to-forest-700",
  fishing: "from-sky-500 to-sky-700",
  carcamping: "from-amber-400 to-amber-600",
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
          {/* 등고선 텍스처 (깊이감) */}
          <svg
            aria-hidden
            className="absolute inset-0 h-full w-full opacity-[0.18]"
            viewBox="0 0 400 300"
            preserveAspectRatio="none"
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
          >
            <path d="M-10 90 C 80 60,160 120,250 85 S 410 70,420 100" />
            <path d="M-10 150 C 90 125,170 180,260 145 S 410 135,420 160" />
            <path d="M-10 210 C 70 185,180 235,250 205 S 410 200,420 220" />
          </svg>
          <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-white/20 text-white ring-1 ring-white/25 backdrop-blur-sm">
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
