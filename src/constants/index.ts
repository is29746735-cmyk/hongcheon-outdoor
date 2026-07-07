import type { Activity, PlaceCategory } from "@/types/place";

export const SITE = {
  name: "홍천 아웃도어",
  description: "강원 홍천의 캠핑·낚시 명소를 큐레이션합니다.",
  /**
   * 사이트 절대 URL (메타데이터·OG·canonical 기준).
   * 배포 시 환경변수 NEXT_PUBLIC_SITE_URL 에 실제 도메인을 넣으세요.
   * 미설정 시 로컬 개발 주소를 사용합니다.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
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

/** 카테고리별 지도 마커 색상 */
export const CATEGORY_COLORS: Record<PlaceCategory, string> = {
  camping: "#2f7d4f", // 초록
  fishing: "#2563eb", // 파랑
  carcamping: "#f59e0b", // 주황
};

export const ACTIVITY_LABELS: Record<Activity, string> = {
  gyeonji: "견지낚시",
  lure: "루어",
  bonfire: "불멍",
};

export const NAV_LINKS = [
  { href: "/", label: "홈" },
  { href: "/#list", label: "장소" },
  { href: "/gear", label: "용품" },
  { href: "/experiences", label: "경험담" },
  { href: "/saved", label: "저장" },
] as const;
