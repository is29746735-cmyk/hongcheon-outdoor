import type { Place } from "@/types/place";

export interface MapLinks {
  naver: string;
  kakao: string;
  google: string;
}

/**
 * 장소를 외부 지도 서비스에서 여는 링크를 생성한다.
 * - 검증된 좌표(place.location)가 있으면 좌표 기반으로 정확한 핀을 띄우고,
 * - 없으면 검증된 명칭(place.mapQuery) 검색으로 안내한다.
 * (네이버 웹은 좌표 단일 핀 링크가 불안정해 명칭 검색을 사용)
 */
export function getMapLinks(place: Place): MapLinks {
  const q = encodeURIComponent(place.mapQuery);
  const loc = place.location;

  if (loc) {
    const name = encodeURIComponent(place.name);
    return {
      naver: `https://map.naver.com/p/search/${q}`,
      kakao: `https://map.kakao.com/link/map/${name},${loc.lat},${loc.lng}`,
      google: `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`,
    };
  }

  return {
    naver: `https://map.naver.com/p/search/${q}`,
    kakao: `https://map.kakao.com/link/search/${q}`,
    google: `https://www.google.com/maps/search/?api=1&query=${q}`,
  };
}
