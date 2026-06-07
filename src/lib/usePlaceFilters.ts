import { useMemo, useState } from "react";
import type { CategoryFilter, Place } from "@/types/place";
import { filterPlaces } from "@/lib/search";

/**
 * 장소 필터 상태 + 실시간 필터링 훅.
 * 사이드바/필터 메뉴의 조건(카테고리·태그·고립도·낚시종류·키워드)을 바꾸면
 * filtered 가 즉시 재계산된다. (filterPlaces 내부에서 Array.prototype.filter 사용)
 */
export function usePlaceFilters(all: Place[]) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [tags, setTags] = useState<string[]>([]);
  const [minIsolation, setMinIsolation] = useState(1);
  const [fishingTypes, setFishingTypes] = useState<string[]>([]);

  const toggleTag = (t: string) =>
    setTags((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  const toggleFishingType = (t: string) =>
    setFishingTypes((p) =>
      p.includes(t) ? p.filter((x) => x !== t) : [...p, t]
    );

  const reset = () => {
    setQuery("");
    setCategory("all");
    setTags([]);
    setMinIsolation(1);
    setFishingTypes([]);
  };

  const filtered = useMemo(
    () =>
      filterPlaces(all, {
        query,
        category,
        tags,
        minIsolation,
        fishingTypes,
      }),
    [all, query, category, tags, minIsolation, fishingTypes]
  );

  const activeCount =
    (category !== "all" ? 1 : 0) +
    tags.length +
    (minIsolation > 1 ? 1 : 0) +
    fishingTypes.length +
    (query.trim() ? 1 : 0);

  return {
    query,
    setQuery,
    category,
    setCategory,
    tags,
    toggleTag,
    minIsolation,
    setMinIsolation,
    fishingTypes,
    toggleFishingType,
    reset,
    filtered,
    activeCount,
  };
}
