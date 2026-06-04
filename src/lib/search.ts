import type { CategoryFilter, Place, PlaceCategory } from "@/types/place";

/** 텍스트 검색 대상: 이름 + 소재지 + 태그 */
function matchesQuery(place: Place, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [place.name, place.region, ...place.tags]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
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
