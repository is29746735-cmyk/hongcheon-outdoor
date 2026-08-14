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

/**
 * 대중교통 접근성 (홍천 농어촌버스).
 *
 * ★ **시각(첫차·막차·배차)을 여기에 적지 않는다.** 계절·요일마다 바뀌어서
 * 적는 순간 낡기 시작하고, 틀린 시각은 사람을 정류장에 세워 둔다.
 * 대신 "하루 몇 편 수준"까지만 말하고 정확한 시각은 화면에서 공식 시간표로 넘긴다.
 *
 * 조사 출처(2026-08-14) — 하루 편수는 홍천군 대중교통정보(hongcheonbus.kr)
 * 농어촌버스 시간표, 정류장 이름·경유 순서는 홍천군 농어촌버스 노선 자료.
 * ⚠️ 정류장에서 목적지까지의 거리는 **검증하지 못했다.** 그래서 화면에
 * 도보 시간·거리를 쓰지 않고 지도 길찾기로 넘긴다. 지어내지 말 것.
 */
export interface TransitInfo {
  /** 가장 가까운 정류장 — 노선표에 있는 이름 그대로 */
  stop: string;
  /** 그 정류장을 지나는 노선(방면) */
  route: string;
  /** 하루 편수. 자료마다 1~2편씩 달라서 범위로 적는다 */
  runsPerDay: string;
  /**
   * 편수 등급. `sparse`(하루 두세 편)는 "시간표에 하루를 맞춰야 하는" 수준이라
   * 화면에서 주의색으로 구분한다. 이게 여행 계획을 실제로 바꾸는 정보다.
   */
  level: "sparse" | "moderate";
  /** 이 장소에만 해당하는 주의 (노지라 더 걸어야 한다 등) */
  note?: string;
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
  /**
   * 대중교통 접근성. **값이 없으면 "확인된 노선 없음"으로 표시된다** —
   * 빈칸을 "대중교통 됨"으로 읽히게 두지 않기 위해서다.
   */
  transit?: TransitInfo;
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
