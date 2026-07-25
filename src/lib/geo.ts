import type { GeoPoint } from "@/types/place";

/**
 * 좌표 거리 계산 — 하버사인(직선 거리).
 *
 * 주의: 이건 **직선 거리**다. 실제 차로·도보 거리가 아니다.
 * 표시할 때 반드시 "직선"임을 밝힌다(브랜드 원칙: 과장·근사 금지).
 * 같은 계산이 NearbyShops·CourseMap·review-actions 에도 각자 들어 있는데,
 * 그쪽은 서버/지도 컨텍스트에 묶여 있어 이번엔 건드리지 않았다.
 */
export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const R = 6371000;
  const toR = (x: number) => (x * Math.PI) / 180;
  const dLat = toR(b.lat - a.lat);
  const dLng = toR(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** 사람이 읽는 거리 — 1km 미만은 m, 그 이상은 소수 첫째 자리 km */
export function formatDistance(meters: number): string {
  return meters < 1000
    ? `${Math.round(meters)}m`
    : `${(meters / 1000).toFixed(1)}km`;
}
