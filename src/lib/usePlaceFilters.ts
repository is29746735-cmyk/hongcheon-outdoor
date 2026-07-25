import { useCallback, useMemo, useState } from "react";
import type { CategoryFilter, GeoPoint, Place } from "@/types/place";
import {
  filterPlaces,
  sortPlaces,
  availableSortOptions,
  countByTag,
  countByFishingType,
  countByCategory,
  countByIsolation,
  type PlaceSort,
} from "@/lib/search";
import { distanceMeters } from "@/lib/geo";

/** 고립도 칩의 임계값 — 카운트 계산과 UI가 같은 값을 쓰도록 여기서 단일 정의 */
export const ISOLATION_THRESHOLDS = [1, 3, 4, 5];

/**
 * 내 위치 확보 상태.
 * `denied` 는 사용자가 거부했거나 보안 컨텍스트가 아닌 경우까지 포함한다 —
 * 어느 쪽이든 화면에서 할 말은 "위치를 못 받았다"로 같다.
 */
export type LocationStatus =
  | "idle"
  | "asking"
  | "granted"
  | "denied"
  | "unsupported";

/**
 * 장소 필터·정렬 상태 + 실시간 필터링 훅.
 * 사이드바/필터 메뉴의 조건(카테고리·태그·고립도·낚시종류·키워드)을 바꾸면
 * filtered 가 즉시 재계산된다.
 *
 * 카운트는 두 종류를 함께 돌려준다:
 * - `filtered.length` — 지금 조건의 결과 수(목록 위에 라이브로 표시)
 * - `counts` — 칩별 예상 결과 수. 0인 칩은 UI에서 비활성으로 보여, 누르기 전에
 *   빈 화면이 될 조합을 알 수 있게 한다.
 */
export function usePlaceFilters(all: Place[]) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [tags, setTags] = useState<string[]>([]);
  const [minIsolation, setMinIsolation] = useState(1);
  const [fishingTypes, setFishingTypes] = useState<string[]>([]);
  const [sort, setSortState] = useState<PlaceSort>("recommended");

  // ── 내 위치 (가까운 순 정렬용) ───────────────────────────────────
  const [userLocation, setUserLocation] = useState<GeoPoint | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");

  const requestLocation = useCallback((): Promise<GeoPoint | null> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationStatus("unsupported");
      return Promise.resolve(null);
    }
    setLocationStatus("asking");
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserLocation(loc);
          setLocationStatus("granted");
          resolve(loc);
        },
        () => {
          // 거부·시간초과·위치 불가를 구분해봐야 화면에서 할 말은 같다
          setLocationStatus("denied");
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
      );
    });
  }, []);

  /**
   * 정렬 변경. '가까운 순'을 고르면 위치 권한을 먼저 받는다.
   * 못 받으면 정렬을 되돌린다 — 고른 기준이 동작하지 않는 채로 두면
   * 사용자는 "가까운 순인데 왜 순서가 그대로냐"로 읽는다.
   */
  const setSort = useCallback(
    (next: PlaceSort) => {
      if (next !== "distance") {
        setSortState(next);
        return;
      }
      if (userLocation) {
        setSortState("distance");
        return;
      }
      setSortState("distance");
      requestLocation().then((loc) => {
        if (!loc) setSortState("recommended");
      });
    },
    [userLocation, requestLocation]
  );

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
    setSort("recommended");
  };

  const filtered = useMemo(
    () =>
      sortPlaces(
        filterPlaces(all, {
          query,
          category,
          tags,
          minIsolation,
          fishingTypes,
        }),
        sort,
        userLocation
      ),
    [all, query, category, tags, minIsolation, fishingTypes, sort, userLocation]
  );

  /**
   * 장소별 내 위치로부터의 직선 거리(m). 위치를 못 받았으면 빈 Map.
   * 카드에 거리를 붙이는 데 쓴다 — 정렬 기준과 같은 계산을 재사용해야
   * "3번째 카드가 2번째보다 가깝다"는 모순이 안 생긴다.
   */
  const distances = useMemo(() => {
    const m = new Map<string, number>();
    if (!userLocation) return m;
    all.forEach((p) => {
      if (p.location) m.set(p.id, distanceMeters(userLocation, p.location));
    });
    return m;
  }, [all, userLocation]);

  // 칩별 카운트 — 각 패싯의 기준 집합은 "그 패싯만 뺀" 조건으로 만든다.
  // (장소가 12곳이라 패싯당 한 번씩 더 훑는 비용은 무시할 수준)
  const counts = useMemo(() => {
    const base = (omit: "tags" | "fishingTypes" | "isolation" | "category") =>
      filterPlaces(all, {
        query,
        category: omit === "category" ? "all" : category,
        tags: omit === "tags" ? [] : tags,
        minIsolation: omit === "isolation" ? 1 : minIsolation,
        fishingTypes: omit === "fishingTypes" ? [] : fishingTypes,
      });
    return {
      tags: countByTag(base("tags")),
      fishingTypes: countByFishingType(base("fishingTypes")),
      category: countByCategory(base("category")),
      isolation: countByIsolation(base("isolation"), ISOLATION_THRESHOLDS),
    };
  }, [all, query, category, tags, minIsolation, fishingTypes]);

  // 지금 데이터가 뒷받침하는 정렬 기준만 (예: 평점이 하나도 없으면 '평점 높은 순'은 숨김)
  const sortOptions = useMemo(() => availableSortOptions(all), [all]);

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
    sort,
    setSort,
    sortOptions,
    reset,
    filtered,
    total: all.length,
    counts,
    activeCount,
    // 내 위치 / 거리
    userLocation,
    locationStatus,
    requestLocation,
    distances,
  };
}
