import type {
  CategoryFilter,
  GeoPoint,
  Place,
  PlaceCategory,
} from "@/types/place";
import { distanceMeters } from "@/lib/geo";

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
  /** 속성 태그 — 패싯 내 OR(고른 태그 중 하나라도 가진 곳) */
  tags?: string[];
  /** 한적함(고립도) 최소값 — 1이면 제한 없음 */
  minIsolation?: number;
  /** 낚시 종류 — 패싯 내 OR(고른 종류 중 하나라도 제공하는 곳) */
  fishingTypes?: string[];
}

/**
 * 키워드 + 카테고리 + 태그 + 고립도(이상) + 낚시종류로 실시간 필터링.
 *
 * 패싯 모델: **패싯 안에서는 OR, 패싯 사이에서는 AND.**
 * 즉 "루어 또는 견지가 되는 곳 중에서, 한적함 4점 이상인 곳"으로 읽힌다.
 * (2026-07-25 수정: 이전에는 태그·낚시종류가 패싯 내에서도 AND였다. 장소가 12곳뿐이라
 *  칩을 두 개 고르는 순간 결과가 0~1건으로 떨어져 사용자가 "사이트가 비었다"로 읽었다.
 *  다중선택 칩은 관례상 OR로 읽히므로 코드를 관례에 맞췄다.)
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
      if (!tags.some((t) => set.has(t))) return false;
    }
    if (minIsolation > 1 && (place.isolationScore ?? 0) < minIsolation) {
      return false;
    }
    if (fishingTypes.length > 0) {
      const methods = fishingMethods(place);
      if (!fishingTypes.some((t) => methods.has(t))) return false;
    }
    return matchesQuery(place, query);
  });
}

// ── 정렬 ────────────────────────────────────────────────────────────
/**
 * 정렬 기준. **검증된 필드만** 제공한다 — "리뷰 많은 순"은 리뷰 수를 목록 단계에서
 * 알 수 없어 넣지 않았다(없는 값을 추정해 팔지 않는다).
 * "가까운 순"은 브라우저 위치 권한을 받은 뒤에만 동작한다(2026-07-25 추가).
 */
export type PlaceSort =
  | "recommended"
  | "distance"
  | "rating"
  | "isolation"
  | "name";

export interface SortOption {
  value: PlaceSort;
  /** 목록 제목·설명에 쓰는 전체 라벨 */
  label: string;
  /** 버튼에 쓰는 짧은 라벨 */
  short: string;
  /** 버튼 아래 한 줄 — 고르면 무엇이 달라지는지 */
  hint: string;
}

export const SORT_OPTIONS: SortOption[] = [
  {
    value: "recommended",
    label: "추천순 (카테고리별)",
    short: "추천순",
    hint: "카테고리별",
  },
  {
    value: "distance",
    label: "가까운 순 (내 위치)",
    short: "가까운 순",
    hint: "내 위치",
  },
  { value: "rating", label: "평점 높은 순", short: "평점순", hint: "높은 순" },
  {
    value: "isolation",
    label: "한적한 순",
    short: "한적한 순",
    hint: "사람 적은 곳",
  },
  { value: "name", label: "이름순", short: "이름순", hint: "가나다" },
];

/**
 * 데이터가 뒷받침하는 정렬 기준만 남긴다.
 * 값이 한 곳도 없는 기준을 메뉴에 두면 고르는 순간 이름순으로만 동작해,
 * "평점이 있다"는 잘못된 약속이 된다(브랜드 1번 원칙: 과장 금지).
 * 나중에 평점 데이터가 채워지면 자동으로 다시 나타난다.
 */
export function availableSortOptions(places: Place[]): SortOption[] {
  return SORT_OPTIONS.filter((o) => {
    if (o.value === "rating") return places.some((p) => p.rating != null);
    if (o.value === "isolation")
      return places.some((p) => p.isolationScore != null);
    // 좌표가 있는 장소가 하나라도 있어야 거리 정렬이 의미가 있다
    if (o.value === "distance") return places.some((p) => p.location != null);
    return true;
  });
}

const byName = (a: Place, b: Place) => a.name.localeCompare(b.name, "ko");

/**
 * 정렬된 새 배열을 반환한다(입력 배열은 건드리지 않음).
 * 값이 없는 장소(평점·고립도·좌표 미확보)는 0으로 치지 않고 **항상 뒤로** 보낸다.
 * 그래야 "평점 없음"이 "평점 0점"으로, "좌표 없음"이 "거리 0"으로 오해되지 않는다.
 *
 * `origin`(사용자 위치)이 없으면 거리 정렬은 계산할 수 없으므로 입력 순서를 그대로
 * 돌려준다 — 호출부가 위치 권한을 받아 다시 부른다.
 */
export function sortPlaces(
  places: Place[],
  sort: PlaceSort,
  origin?: GeoPoint | null
): Place[] {
  if (sort === "recommended") return places;
  const out = [...places];
  if (sort === "name") return out.sort(byName);

  if (sort === "distance") {
    if (!origin) return places;
    return out.sort((a, b) => {
      const ad = a.location ? distanceMeters(origin, a.location) : null;
      const bd = b.location ? distanceMeters(origin, b.location) : null;
      if (ad == null && bd == null) return byName(a, b);
      if (ad == null) return 1;
      if (bd == null) return -1;
      return ad - bd || byName(a, b); // 가까운 순 = 오름차순
    });
  }

  const key =
    sort === "rating"
      ? (p: Place) => p.rating
      : (p: Place) => p.isolationScore;
  return out.sort((a, b) => {
    const av = key(a);
    const bv = key(b);
    if (av == null && bv == null) return byName(a, b);
    if (av == null) return 1;
    if (bv == null) return -1;
    return bv - av || byName(a, b);
  });
}

// ── 칩별 결과 수(패싯 카운트) ────────────────────────────────────────
/**
 * 각 칩을 골랐을 때 몇 곳이 남는지. **같은 패싯의 형제 선택은 무시하고**
 * 나머지 패싯만 적용한 기준 집합(base)에서 센다 — 패싯 내 OR 모델에서는
 * 형제 칩을 더 고르면 결과가 늘어날 뿐이라, 칩의 수는 형제와 무관해야 맞다.
 * 0인 칩을 미리 비활성으로 보여주면 "눌렀더니 빈 화면"이 사라진다.
 */
export function countByTag(base: Place[]): Map<string, number> {
  const m = new Map<string, number>();
  base.forEach((p) =>
    placeTagSet(p).forEach((t) => m.set(t, (m.get(t) ?? 0) + 1))
  );
  return m;
}

export function countByFishingType(base: Place[]): Map<string, number> {
  const m = new Map<string, number>();
  base.forEach((p) =>
    fishingMethods(p).forEach((t) => m.set(t, (m.get(t) ?? 0) + 1))
  );
  return m;
}

export function countByCategory(base: Place[]): Map<CategoryFilter, number> {
  const m = new Map<CategoryFilter, number>([["all", base.length]]);
  base.forEach((p) => m.set(p.category, (m.get(p.category) ?? 0) + 1));
  return m;
}

/** 고립도는 "이상" 조건이므로 임계값별 누적 개수를 센다 */
export function countByIsolation(
  base: Place[],
  thresholds: number[]
): Map<number, number> {
  return new Map(
    thresholds.map((t) => [
      t,
      t <= 1
        ? base.length
        : base.filter((p) => (p.isolationScore ?? 0) >= t).length,
    ])
  );
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
