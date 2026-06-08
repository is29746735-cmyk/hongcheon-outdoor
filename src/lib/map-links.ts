import type { Place } from "@/types/place";

export interface MapLinks {
  naver: string;
  kakao: string;
  google: string;
}

/**
 * 장소를 외부 지도에서 여는 링크를 생성한다.
 * 검증된 좌표(place.location)가 있으면 좌표 기반으로 정확한 한 지점을 열어
 * "이름 검색 시 비슷한 결과가 많아 헷갈리는" 문제를 방지한다.
 */
export function getMapLinks(place: Place): MapLinks {
  const q = encodeURIComponent(place.mapQuery);
  const name = encodeURIComponent(place.name);
  const loc = place.location;

  if (loc) {
    return {
      // 네이버: 정확 좌표로 지도를 중심 이동 + 이름 표시
      naver: `https://map.naver.com/p/search/${name}?c=${loc.lng},${loc.lat},16,0,0,0,dh`,
      // 카카오: 좌표에 라벨 마커 1개
      kakao: `https://map.kakao.com/link/map/${name},${loc.lat},${loc.lng}`,
      // 구글: 좌표 정확 핀
      google: `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`,
    };
  }

  // 좌표가 없을 때의 폴백(명칭 검색)
  return {
    naver: `https://map.naver.com/p/search/${q}`,
    kakao: `https://map.kakao.com/link/search/${q}`,
    google: `https://www.google.com/maps/search/?api=1&query=${q}`,
  };
}

/**
 * 장소를 도착지로 하는 카카오맵 길찾기 아웃링크.
 * 검증된 좌표가 있으면 좌표를 도착지로(link/to), 없으면 명칭 검색으로 폴백한다.
 */
export function getDirectionsLink(place: Place): string {
  const name = encodeURIComponent(place.name);
  const loc = place.location;
  if (loc) {
    // 카카오맵 길찾기: 도착지 = 이름,위도,경도
    return `https://map.kakao.com/link/to/${name},${loc.lat},${loc.lng}`;
  }
  return `https://map.kakao.com/link/search/${encodeURIComponent(
    place.mapQuery
  )}`;
}
