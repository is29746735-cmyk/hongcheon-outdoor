import type { GeoPoint, NearbyShop, Place } from "@/types/place";

export interface MapLinks {
  naver: string;
  kakao: string;
  google: string;
}

/**
 * 이름·검색어·좌표로 외부 지도(네이버·카카오·구글) 링크를 생성하는 공용 코어.
 * 검증된 좌표가 있으면 좌표 기반으로 정확한 한 지점을 열어
 * "이름 검색 시 비슷한 결과가 많아 헷갈리는" 문제를 방지한다.
 */
function buildMapLinks(
  name: string,
  mapQuery: string,
  loc?: GeoPoint
): MapLinks {
  const n = encodeURIComponent(name);
  const q = encodeURIComponent(mapQuery);

  if (loc) {
    return {
      // 네이버: 정확 좌표로 지도를 중심 이동 + 이름 표시
      naver: `https://map.naver.com/p/search/${n}?c=${loc.lng},${loc.lat},16,0,0,0,dh`,
      // 카카오: 좌표에 라벨 마커 1개
      kakao: `https://map.kakao.com/link/map/${n},${loc.lat},${loc.lng}`,
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

/** 도착지(이름·검색어·좌표)로 카카오맵 길찾기 아웃링크를 생성하는 공용 코어. */
function buildDirectionsLink(
  name: string,
  mapQuery: string,
  loc?: GeoPoint
): string {
  if (loc) {
    // 카카오맵 길찾기: 도착지 = 이름,위도,경도
    return `https://map.kakao.com/link/to/${encodeURIComponent(name)},${loc.lat},${loc.lng}`;
  }
  return `https://map.kakao.com/link/search/${encodeURIComponent(mapQuery)}`;
}

/** 장소를 외부 지도에서 여는 링크 */
export function getMapLinks(place: Place): MapLinks {
  return buildMapLinks(place.name, place.mapQuery, place.location);
}

/** 장소를 도착지로 하는 카카오맵 길찾기 아웃링크 */
export function getDirectionsLink(place: Place): string {
  return buildDirectionsLink(place.name, place.mapQuery, place.location);
}

/** 주변 로컬 스토어를 외부 지도에서 여는 링크 (검색어 없으면 이름 사용) */
export function getShopMapLinks(shop: NearbyShop): MapLinks {
  return buildMapLinks(shop.name, shop.mapQuery ?? shop.name, shop.location);
}

/** 주변 로컬 스토어를 도착지로 하는 카카오맵 길찾기 아웃링크 */
export function getShopDirectionsLink(shop: NearbyShop): string {
  return buildDirectionsLink(shop.name, shop.mapQuery ?? shop.name, shop.location);
}
