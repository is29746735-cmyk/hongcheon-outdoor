import type { Place } from "@/types/place";
import { SITE } from "@/constants";

/**
 * 장소 상세 페이지용 Schema.org 구조화 데이터(JSON-LD) 생성.
 * 브랜드 원칙(검증된 사실만)에 따라 임의 수치(평점·영업시간 등)는 넣지 않고,
 * 검증된 필드(이름·소개·소재지·좌표·전화)만 반영한다.
 * 타입은 야외 휴양지 성격에 맞는 TouristAttraction을 사용.
 */
function isRealImage(src?: string): src is string {
  return !!src && !src.includes("placeholder");
}

function absUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : new URL(path, SITE.url).toString();
}

export function buildPlaceJsonLd(place: Place): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: place.name,
    description: place.summary,
    url: `${SITE.url}/spots/${place.id}`,
    address: {
      "@type": "PostalAddress",
      // region은 검증된 전체 주소 문자열 → streetAddress로. 모든 장소가 홍천군 소재.
      streetAddress: place.region,
      addressLocality: "홍천군",
      addressRegion: "강원특별자치도",
      addressCountry: "KR",
    },
  };

  if (isRealImage(place.thumbnail)) jsonLd.image = absUrl(place.thumbnail);
  if (place.phone) jsonLd.telephone = place.phone;
  if (place.location) {
    jsonLd.geo = {
      "@type": "GeoCoordinates",
      latitude: place.location.lat,
      longitude: place.location.lng,
    };
  }

  return jsonLd;
}
