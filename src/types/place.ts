/**
 * 큐레이션 장소의 도메인 타입.
 * 실제(검증된) 장소 정보를 담으며, 검증 불가한 수치(좌표/고립도/소음 등)는
 * 임의로 채우지 않습니다. 위치 안내는 외부 지도(네이버·카카오·구글) 링크로 제공합니다.
 */

export type PlaceCategory = "camping" | "fishing" | "carcamping";

/** 추천 액티비티 — 견지낚시 / 루어 / 불멍 */
export type Activity = "gyeonji" | "lure" | "bonfire";

export interface GeoPoint {
  lat: number;
  lng: number;
}

/** 주변 로컬 스토어 분류 — 맛집 / 장비 대여 / 카페 / 상점 */
export type ShopCategory = "food" | "rental" | "cafe" | "store";

/** 함께 방문하면 좋은 주변 로컬 스토어 (맛집·장비 대여점 등) */
export interface NearbyShop {
  name: string;
  category: ShopCategory;
  /** 한 줄 설명 (대표 메뉴·취급 품목 등) */
  description?: string;
  /** 스팟에서의 거리/이동시간 (예: "차로 5분") */
  distance?: string;
  /** 외부 지도 검색·길찾기용 명칭·키워드 (없으면 name 사용) */
  mapQuery?: string;
  /** 좌표 (검증된 경우에만, 선택) */
  location?: GeoPoint;
  phone?: string;
}

export interface Place {
  /** URL slug 겸 고유 식별자 */
  id: string;
  name: string;
  category: PlaceCategory;
  /** 한 줄 소개 */
  summary: string;
  /** 상세 본문 */
  description: string;
  /** 검증된 소재지(주소/행정구역) */
  region: string;
  /** 외부 지도 검색에 사용할 정확한 명칭/키워드 */
  mapQuery: string;
  tags: string[];
  /** 필터용 속성 태그 (검증된 설명/사실에서만 도출 — 리뷰 임의 생성 X) */
  filterTags?: string[];
  /**
   * 한적함(고립도) 추정치 1~5 (5=가장 한적).
   * 리뷰가 아닌 검증된 입지 특성(노지/유원지/편의시설 유무 등)에서 도출한 편집 추정치.
   */
  isolationScore?: number;
  activities?: Activity[];
  phone?: string;
  /** 공공/공식 운영 시설 여부 */
  official?: boolean;
  /** 캠핑 ↔ 낚시 연계 강조 대상 */
  connectedFishing?: boolean;
  /** 연계(캠핑+낚시) 설명 — 검증된 내용만 */
  connectionNote?: string;
  /** 정보 출처명 */
  sourceName?: string;
  /** 정보 출처 링크 */
  sourceUrl?: string;
  /** 좌표(검증된 경우에만, 선택) */
  location?: GeoPoint;
  /** 외부 평점(검증된 경우에만, 선택) */
  rating?: number;
  thumbnail?: string;
  images?: string[];
  featured?: boolean;
  /** 제휴 파트너 ID (partner 테이블 FK) — 있으면 "검증 제휴처" 뱃지 노출 */
  partnerId?: string;
  /** 함께 방문하면 좋은 주변 로컬 스토어 (맛집·장비 대여점 등) */
  nearbyShops?: NearbyShop[];
}

/** 목록 필터용 카테고리 (전체 포함) */
export type CategoryFilter = PlaceCategory | "all";
