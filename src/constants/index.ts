import type { Activity, PlaceCategory } from "@/types/place";

/**
 * 사이트 절대 URL (canonical·og:image·sitemap·JSON-LD 의 기준점).
 *
 * 순서대로 찾는다.
 *  1. `NEXT_PUBLIC_SITE_URL` — 커스텀 도메인을 붙였다면 여기에 넣는다(최우선).
 *  2. `VERCEL_PROJECT_PRODUCTION_URL` — Vercel 이 자동으로 넣어 주는 **운영 도메인**.
 *     프로토콜이 빠진 값(`example.vercel.app`)이라 https 를 붙여 쓴다.
 *     배포별로 바뀌는 `VERCEL_URL` 과 달리 프리뷰에서도 운영 주소를 가리키므로
 *     canonical·og:image 처럼 "항상 운영을 가리켜야 하는" 값에 맞다.
 *  3. 로컬 개발 주소.
 *
 * ⚠️ 1·2 가 모두 없으면 운영에서도 `http://localhost:3000` 이 나간다.
 *    실제로 2026-08-01 까지 라이브 canonical·og:image·sitemap 이 그 상태였다.
 *    카카오톡 공유 썸네일이 안 뜨고 색인에도 손해였다. 2번이 그 안전망이다.
 *
 * 서버 전용이다(layout metadata · robots · sitemap · place-jsonld).
 * 클라이언트에서 렌더링하면 2번이 undefined 라 하이드레이션이 어긋난다.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) return `https://${vercelProduction.replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}

export const SITE = {
  name: "홍천 아웃도어",
  description: "강원 홍천의 캠핑·낚시 명소를 큐레이션합니다.",
  url: resolveSiteUrl(),
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
