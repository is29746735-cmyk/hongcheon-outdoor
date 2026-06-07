/**
 * 차박지 인근 전기차 충전소 (카카오맵 실제 등록 위치 기준, 홍천군).
 * 차박지 카테고리를 선택했을 때만 지도에 함께 표시합니다.
 */
export interface EvCharger {
  name: string;
  region: string;
  lat: number;
  lng: number;
}

export const EV_CHARGERS: EvCharger[] = [
  {
    name: "해밀학교 전기차충전소",
    region: "강원특별자치도 홍천군 남면 남노일로 720-8",
    lat: 37.657804,
    lng: 127.768089,
  },
  {
    name: "루멘펜션 전기차충전소",
    region: "강원특별자치도 홍천군 북방면 노일로310번길 31-8",
    lat: 37.685149,
    lng: 127.733469,
  },
  {
    name: "도담골 전기차충전소",
    region: "강원특별자치도 홍천군 서면 모곡로 27",
    lat: 37.690757,
    lng: 127.601138,
  },
  {
    name: "카스카디아CC 전기차충전소",
    region: "강원특별자치도 홍천군 북방면 팔봉산로 1759",
    lat: 37.721357,
    lng: 127.747758,
  },
];
