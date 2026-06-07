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

/** 키워드 + 카테고리로 필터링 */
export function filterPlaces(
  places: Place[],
  opts: { query?: string; category?: CategoryFilter }
): Place[] {
  const { query = "", category = "all" } = opts;
  return places.filter((place) => {
    if (category !== "all" && place.category !== category) return false;
    return matchesQuery(place, query);
  });
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
