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
