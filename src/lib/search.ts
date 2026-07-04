import type { CategoryFilter, Place, PlaceCategory } from "@/types/place";

// 한글 초성(가나다순 19자)
const LEAD = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

/** 문자열을 초성열로 변환 (완성형 음절→초성, 그 외 문자는 유지) */
function toChoseong(s: string): string {
  let out = "";
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      out += LEAD[Math.floor((code - 0xac00) / 588)];
    } else {
      out += ch;
    }
  }
  return out;
}

/** 초성 자모(ㄱ~ㅎ)가 포함되어 있는지 */
function hasJamo(s: string): boolean {
  return /[ㄱ-ㅎ]/.test(s);
}

/** 공백 제거 + 소문자화 */
function normalize(s: string): string {
  return s.replace(/\s+/g, "").toLowerCase();
}

/**
 * 텍스트 검색 대상: 이름 + 소재지 + 태그.
 * - 띄어쓰기 차이를 무시하고("도담 캠핑장" = "도담캠핑장")
 * - 검색어에 초성이 섞이면 초성으로도 매칭("ㄷㄷㅋㅍㅈ", "ㄷㄷ캠핑장" → 도담캠핑장)
 */
function matchesQuery(place: Place, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  const hay = normalize([place.name, place.region, ...place.tags].join(" "));

  // 1) 띄어쓰기 무시 부분일치
  if (hay.includes(q)) return true;

  // 2) 초성 매칭 (검색어에 초성 자모가 있을 때만)
  if (hasJamo(q)) {
    return toChoseong(hay).includes(toChoseong(q));
  }
  return false;
}

/**
 * 범용 텍스트 매칭 — 띄어쓰기 무시 부분일치 + (검색어에 초성이 있으면) 초성 매칭.
 * 검색어가 비면 true. 용품 등 장소 외 목록 검색에도 재사용.
 */
export function textMatches(haystack: string, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  const hay = normalize(haystack);
  if (hay.includes(q)) return true;
  if (hasJamo(q)) return toChoseong(hay).includes(toChoseong(q));
  return false;
}

/** 한 장소의 전체 태그(속성 태그 + 일반 태그) */
function placeTagSet(place: Place): Set<string> {
  return new Set([...(place.filterTags ?? []), ...place.tags]);
}

/** 낚시 종류 옵션 (검증된 activities/태그 기반) */
export const FISHING_TYPES = [
  { value: "lure", label: "루어낚시" },
  { value: "gyeonji", label: "견지낚시" },
  { value: "ice", label: "얼음낚시" },
] as const;

/** 한 장소가 제공하는 낚시 종류 집합 (검증된 사실에서 도출) */
export function fishingMethods(place: Place): Set<string> {
  const s = new Set<string>();
  const acts = place.activities ?? [];
  const ft = place.filterTags ?? [];
  if (acts.includes("lure") || ft.includes("루어낚시")) s.add("lure");
  if (acts.includes("gyeonji")) s.add("gyeonji");
  if (ft.includes("얼음낚시")) s.add("ice");
  return s;
}

export interface PlaceFilterOpts {
  query?: string;
  category?: CategoryFilter;
  tags?: string[];
  /** 한적함(고립도) 최소값 — 1이면 제한 없음 */
  minIsolation?: number;
  /** 낚시 종류(AND 조건 — 선택한 종류를 모두 제공하는 곳만) */
  fishingTypes?: string[];
}

/**
 * 키워드 + 카테고리 + 태그(AND) + 고립도(이상) + 낚시종류(OR)로 실시간 필터링.
 * Array.prototype.filter 로 구현.
 */
export function filterPlaces(places: Place[], opts: PlaceFilterOpts): Place[] {
  const {
    query = "",
    category = "all",
    tags = [],
    minIsolation = 1,
    fishingTypes = [],
  } = opts;

  return places.filter((place) => {
    if (category !== "all" && place.category !== category) return false;
    if (tags.length > 0) {
      const set = placeTagSet(place);
      if (!tags.every((t) => set.has(t))) return false;
    }
    if (minIsolation > 1 && (place.isolationScore ?? 0) < minIsolation) {
      return false;
    }
    if (fishingTypes.length > 0) {
      const methods = fishingMethods(place);
      // 선택한 낚시 종류를 모두 제공하는 곳만 (중첩 시 AND → 없으면 빈 결과)
      if (!fishingTypes.every((t) => methods.has(t))) return false;
    }
    return matchesQuery(place, query);
  });
}

/** 필터용 속성 태그 목록 (빈도순) */
export function getAllFilterTags(places: Place[]): string[] {
  const count = new Map<string, number>();
  places.forEach((p) =>
    (p.filterTags ?? []).forEach((t) => count.set(t, (count.get(t) ?? 0) + 1))
  );
  return [...count.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"))
    .map(([t]) => t);
}

/** 카테고리별로 묶어 반환 (해당 장소가 있는 카테고리만) */
export function groupByCategory(
  places: Place[]
): { category: PlaceCategory; items: Place[] }[] {
  const order: PlaceCategory[] = ["camping", "fishing", "carcamping"];
  return order
    .map((category) => ({
      category,
      items: places.filter((p) => p.category === category),
    }))
    .filter((group) => group.items.length > 0);
}

/** 캠핑 ↔ 낚시 연계 강조 장소 */
export function getConnectedPlaces(places: Place[]): Place[] {
  return places.filter((p) => p.connectedFishing);
}
