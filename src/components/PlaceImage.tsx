import Image from "next/image";
import type { Place } from "@/types/place";
import { CATEGORY_ICONS } from "@/constants";

/**
 * 장소 이미지 슬롯.
 * 실제 이미지(URL/파일)가 있으면 next/image 로 렌더링하고,
 * 아직 없으면(=placeholder 경로) 카테고리 이모지 플레이스홀더를 보여준다.
 *
 * 실제 사진 연동 방법:
 *   data/places.ts 의 thumbnail / images 에 실제 이미지 URL(또는 /public 파일 경로)을 넣으면
 *   자동으로 사진이 표시됩니다. ("placeholder" 가 포함된 경로는 빈 슬롯으로 간주)
 */
function isPlaceholder(src?: string): boolean {
  return !src || src.includes("placeholder");
}

interface PlaceImageProps {
  place: Place;
  /** 개별 이미지 경로 지정 (기본값: place.thumbnail) */
  src?: string;
  /** 컨테이너 클래스 (aspect-ratio, rounded 등) */
  className?: string;
  sizes?: string;
}

export default function PlaceImage({
  place,
  src,
  className = "",
  sizes = "(max-width: 768px) 100vw, 400px",
}: PlaceImageProps) {
  const url = src ?? place.thumbnail;

  return (
    <div className={`relative overflow-hidden bg-neutral-100 ${className}`}>
      {!url || isPlaceholder(url) ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-sand-100 text-neutral-400">
          <span className="text-3xl opacity-50">
            {CATEGORY_ICONS[place.category]}
          </span>
          <span className="text-xs font-medium tracking-tight">
            (업로드 예정)
          </span>
        </div>
      ) : (
        <Image
          src={url}
          alt={place.name}
          fill
          sizes={sizes}
          className="object-cover"
        />
      )}
    </div>
  );
}
