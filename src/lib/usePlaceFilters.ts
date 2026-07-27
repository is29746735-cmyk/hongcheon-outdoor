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
import { checkLocation, distanceMeters, type LocationIssue } from "@/lib/geo";
import { HONGCHEON_RIVER_CENTER } from "@/constants";

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
  | "unsupported"
  /** 브라우저 설정에서 이 사이트의 위치 권한이 차단된 상태(창조차 안 뜬다) */
  | "blocked"
  /** 위치는 받았지만 오차가 너무 크거나 홍천에서 너무 멀어 쓸 수 없는 경우 */
  | "unreliable";

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
  /** 위치를 못 쓰는 이유(오차가 큼 / 너무 멂) — 화면에 숫자까지 밝힌다 */
  const [locationIssue, setLocationIssue] = useState<LocationIssue | null>(null);
  /** 정상적으로 받은 위치의 오차(m) */
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);

  /** 위치를 다듬는 중 현재까지의 오차(m) — "확인하는 중" 표시에 쓴다 */
  const [pendingAccuracy, setPendingAccuracy] = useState<number | null>(null);

  /**
   * 내 위치 받기.
   *
   * `getCurrentPosition` 은 **가장 먼저 나온 값**을 준다. 그 첫 값은 보통
   * IP·기지국 추정이라 오차가 수십 km다(홍천 장소가 4,900km로 뜨던 원인).
   * 그래서 `watchPosition` 으로 잡고, 위치가 다듬어지는 동안 더 정확한 값이
   * 오면 갈아치운다. 오차 1km 안으로 들어오면 그 자리에서 끝내고,
   * 아니면 최대 8초까지 기다렸다가 그때까지 가장 정확한 값을 쓴다.
   *
   * 권한이 아예 차단돼 있으면 브라우저가 창을 띄우지 않고 즉시 실패한다.
   * 그건 "거부"와 다른 상황이라(설정을 바꿔야 한다) 따로 알린다.
   */
  const requestLocation = useCallback(async (): Promise<GeoPoint | null> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationStatus("unsupported");
      return null;
    }

    // 브라우저 설정에서 차단된 상태인지 미리 확인(지원하는 브라우저에서만)
    try {
      const st = await navigator.permissions?.query({
        name: "geolocation" as PermissionName,
      });
      if (st?.state === "denied") {
        setLocationIssue(null);
        setLocationStatus("blocked");
        return null;
      }
    } catch {
      // Permissions API 미지원 — 그냥 요청해 본다
    }

    setLocationIssue(null);
    setPendingAccuracy(null);
    setLocationStatus("asking");

    return new Promise<GeoPoint | null>((resolve) => {
      let best: { loc: GeoPoint; acc: number | null } | null = null;
      let settled = false;
      let watchId: number | null = null;
      let timer: ReturnType<typeof setTimeout> | null = null;

      const cleanup = () => {
        if (watchId != null) navigator.geolocation.clearWatch(watchId);
        if (timer) clearTimeout(timer);
      };

      /** 지금까지 가장 정확한 값으로 마무리 */
      const finish = () => {
        if (settled) return;
        settled = true;
        cleanup();
        setPendingAccuracy(null);

        if (!best) {
          setLocationStatus("denied");
          resolve(null);
          return;
        }
        const issue = checkLocation(best.loc, HONGCHEON_RIVER_CENTER, best.acc);
        if (issue) {
          setLocationIssue(issue);
          setLocationAccuracy(best.acc);
          setUserLocation(null);
          setLocationStatus("unreliable");
          resolve(null);
          return;
        }
        setLocationIssue(null);
        setLocationAccuracy(best.acc);
        setUserLocation(best.loc);
        setLocationStatus("granted");
        resolve(best.loc);
      };

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const acc = Number.isFinite(pos.coords.accuracy)
            ? pos.coords.accuracy
            : null;
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (
            !best ||
            (acc != null && (best.acc == null || acc < best.acc)) ||
            best.acc == null
          ) {
            best = { loc, acc };
          }
          setPendingAccuracy(acc);
          // 충분히 정확하면 더 기다릴 이유가 없다
          if (acc != null && acc <= 1000) finish();
        },
        (err) => {
          // 1 = PERMISSION_DENIED. 사용자가 창에서 거부한 경우 즉시 끝낸다.
          if (err.code === 1) {
            if (settled) return;
            settled = true;
            cleanup();
            setPendingAccuracy(null);
            setLocationIssue(null);
            setLocationStatus("denied");
            resolve(null);
            return;
          }
          // 위치 못 잡음·시간초과는 기다렸다가 그때까지 받은 값으로 판단한다
        },
        /*
         * `maximumAge: 0` — 캐시된(=대개 부정확한) 이전 값을 받지 않는다.
         * 이 값이 5분이었을 때 브라우저가 예전 IP 추정치를 그대로 돌려줬다.
         */
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );

      timer = setTimeout(finish, 8000);
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
    locationIssue,
    locationAccuracy,
    pendingAccuracy,
    requestLocation,
    distances,
  };
}
