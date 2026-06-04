import type { Activity, PlaceCategory } from "@/types/place";

export const SITE = {
  name: "홍천 아웃도어",
  description: "강원 홍천의 캠핑·낚시 명소를 큐레이션합니다.",
  url: "https://example.com",
} as const;

/** 홍천군청 기준 지도 초기 중심 좌표 */
export const HONGCHEON_CENTER = {
  lat: 37.6971,
  lng: 127.8888,
} as const;

/** 홍천강(홍천읍 인근) 기준 지도 초기 중심 좌표 */
export const HONGCHEON_RIVER_CENTER = {
  lat: 37.6916,
  lng: 127.8856,
} as const;

export const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  camping: "캠핑장",
  fishing: "낚시 스팟",
  carcamping: "차박지",
};

/** 카테고리별 마커/뱃지에 쓰는 이모지 아이콘 */
export const CATEGORY_ICONS: Record<PlaceCategory, string> = {
  camping: "🏕️",
  fishing: "🎣",
  carcamping: "🚐",
};

export const ACTIVITY_LABELS: Record<Activity, string> = {
  gyeonji: "견지낚시",
  lure: "루어",
  bonfire: "불멍",
};

export const NAV_LINKS = [
  { href: "/", label: "홈" },
  { href: "/#list", label: "장소" },
] as const;
