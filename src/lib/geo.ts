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

/** 사람이 읽는 거리 — 1km 미만은 m, 100km 미만은 소수 첫째 자리, 그 이상은 정수 km */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  const km = meters / 1000;
  // 100km가 넘으면 소수점 한 자리가 의미 없다("4900.0km"는 읽기만 나쁘다)
  return km < 100
    ? `${km.toFixed(1)}km`
    : `${Math.round(km).toLocaleString("ko-KR")}km`;
}

/**
 * 받은 위치를 '가까운 순'에 써도 되는지 판정한다.
 *
 * 브라우저 위치는 늘 정확하지 않다. Wi-Fi 정보가 없는 데스크톱에서는 IP로 추정하는데,
 * 그러면 오차가 수십~수천 km까지 벌어진다. 실제로 홍천 장소들이 4,900km로 뜨는
 * 사례가 나왔다(2026-07-27). 그 값을 그대로 "가까운 순"이라고 내놓으면
 * **틀린 정보를 사실처럼 파는 것**이 된다 — 12곳이 30km 안에 몰려 있어
 * 원점이 수천 km 밖이면 순서 자체가 무의미해진다.
 */
export const LOCATION_LIMITS = {
  /** 이보다 오차가 크면 30km 안에 몰린 장소들의 순서를 가릴 수 없다 */
  maxAccuracyM: 30_000,
  /** 홍천에서 이보다 멀면 '가까운 순'이 의미를 잃는다(제주도까지는 통과) */
  maxDistanceM: 600_000,
} as const;

export type LocationIssue = {
  kind: "accuracy" | "far";
  accuracyM: number | null;
  distanceM: number;
};

export function checkLocation(
  loc: GeoPoint,
  center: GeoPoint,
  accuracyM: number | null
): LocationIssue | null {
  const distanceM = distanceMeters(loc, center);
  if (distanceM > LOCATION_LIMITS.maxDistanceM)
    return { kind: "far", accuracyM, distanceM };
  if (accuracyM != null && accuracyM > LOCATION_LIMITS.maxAccuracyM)
    return { kind: "accuracy", accuracyM, distanceM };
  return null;
}
