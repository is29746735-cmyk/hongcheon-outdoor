"use client";

import { useMemo, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Place, PlaceCategory } from "@/types/place";
import { getAllPlaces } from "@/data/places";
import { getGearByCategory, type GearCategory } from "@/data/gear";
import InFeedGearCard from "@/components/gear/InFeedGearCard";
import {
  groupByCategory,
  getConnectedPlaces,
  getAllFilterTags,
  FISHING_TYPES,
  type PlaceSort,
} from "@/lib/search";
import { CATEGORY_LABELS } from "@/constants";
import { CategoryIcon } from "@/components/icons";
import { ChevronDown, Fish, X } from "lucide-react";
import { usePlaceFilters, ISOLATION_THRESHOLDS } from "@/lib/usePlaceFilters";
import PlaceFilterBar from "@/components/SearchSidebar";
import PlaceCard from "@/components/places/PlaceCard";
import EmptyState from "@/components/places/EmptyState";
import SpotSlideOver from "@/components/places/SpotSlideOver";
import KakaoMap from "@/components/KakaoMap";

const ISOLATION_LABELS: Record<number, string> = {
  1: "전체",
  3: "3점+",
  4: "4점+",
  5: "5점",
};

/**
 * 처음에 보여줄 태그 개수(빈도 상위). 태그가 14개라 전부 펼치면 모바일에서
 * 필터 패널만 화면 절반을 먹는다 — 터치 타깃을 44px로 올린 뒤 더 심해졌다.
 * 나머지는 "N개 더"로 접고, 고른 태그는 접힌 상태에서도 항상 보이게 한다.
 */
const TAG_PREVIEW_COUNT = 8;

/**
 * 장소 목록 브라우저 — 사이드바/필터 메뉴(카테고리·태그·고립도·낚시종류·키워드)에
 * 맞춰 하단 카드 리스트가 실시간으로 필터링·정렬된다. (usePlaceFilters 훅 사용)
 *
 * 정렬이 '추천순'이면 카테고리별로 묶어 보여주고, 그 외 기준을 고르면
 * 그룹을 풀고 하나의 목록으로 정렬해 보여준다(정렬과 그룹핑이 서로를 가리지 않도록).
 */
export default function PlaceBrowser() {
  const allPlaces = useMemo(() => getAllPlaces(), []);
  const allTags = useMemo(() => getAllFilterTags(allPlaces), [allPlaces]);
  const f = usePlaceFilters(allPlaces);

  // 히어로 검색창/카테고리 칩(HeroSearch)에서 발행한 hco:search 이벤트를 필터에 반영
  const { setQuery, setCategory } = f;
  useEffect(() => {
    const onSearch = (e: Event) => {
      const d = (e as CustomEvent).detail ?? {};
      if (typeof d.query === "string") setQuery(d.query);
      if (typeof d.category === "string") setCategory(d.category);
    };
    window.addEventListener("hco:search", onSearch as EventListener);
    return () =>
      window.removeEventListener("hco:search", onSearch as EventListener);
  }, [setQuery, setCategory]);

  const groups = useMemo(() => groupByCategory(f.filtered), [f.filtered]);
  const connected = useMemo(
    () => getConnectedPlaces(allPlaces).slice(0, 6),
    [allPlaces]
  );

  // 인피드 용품 추천 — 보고 있는 카테고리(필터, 없으면 첫 그룹)에 맞춰 관련 용품 1개.
  // 낚시 스팟은 낚시용품, 그 외(캠핑·차박)는 캠핑용품. 첫 격자에만 한 장 끼운다.
  const inFeedGear = useMemo(() => {
    const contextCat: PlaceCategory =
      f.category !== "all" ? f.category : groups[0]?.category ?? "camping";
    const gearCat: GearCategory = contextCat === "fishing" ? "fishing" : "camping";
    return getGearByCategory(gearCat)[0] ?? null;
  }, [f.category, groups]);

  const showConnectedSection = f.activeCount === 0;
  const visibleIds = useMemo(
    () => new Set(f.filtered.map((p) => p.id)),
    [f.filtered]
  );

  // 태그 줄 펼치기 — 접힌 상태에서도 이미 고른 태그는 보여준다(안 보이면 해제할 수 없다)
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const visibleTags = useMemo(() => {
    if (tagsExpanded) return allTags;
    const head = allTags.slice(0, TAG_PREVIEW_COUNT);
    const pinned = allTags
      .slice(TAG_PREVIEW_COUNT)
      .filter((t) => f.tags.includes(t));
    return [...head, ...pinned];
  }, [allTags, tagsExpanded, f.tags]);
  const hiddenTagCount = allTags.length - visibleTags.length;

  // 슬라이드오버(우측 상세 보기) 상태
  const [selected, setSelected] = useState<Place | null>(null);
  const [slideOpen, setSlideOpen] = useState(false);
  const openSpot = useCallback((place: Place) => {
    setSelected(place);
    setSlideOpen(true);
  }, []);
  const closeSpot = useCallback(() => setSlideOpen(false), []);

  /** 카드 셀 만들기 — withGear면 3번째 자리(없으면 끝)에 인피드 용품 카드 한 장 */
  const cellsFor = useCallback(
    (items: Place[], withGear: boolean): ReactNode[] => {
      const cells: ReactNode[] = items.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          onSelect={openSpot}
          impressionReferrer="home"
        />
      ));
      if (withGear && inFeedGear) {
        cells.splice(
          Math.min(2, cells.length),
          0,
          <InFeedGearCard key="in-feed-gear" item={inFeedGear} />
        );
      }
      return cells;
    },
    [inFeedGear, openSpot]
  );

  const sortLabel =
    f.sortOptions.find((o) => o.value === f.sort)?.label ?? "추천순";

  return (
    <div id="list" className="scroll-mt-20">
      <PlaceFilterBar
        query={f.query}
        category={f.category}
        categoryCounts={f.counts.category}
        onQueryChange={f.setQuery}
        onCategoryChange={f.setCategory}
      />

      {/* 상세 필터 메뉴 — 칩 옆 괄호 숫자는 그 칩을 골랐을 때 남는 장소 수 */}
      <div className="mt-3 space-y-2 rounded-2xl border border-sand-300 bg-white p-3.5">
        {/* 한적함(고립도) */}
        <FacetRow label="한적함">
          {ISOLATION_THRESHOLDS.map((v) => (
            <FilterChip
              key={v}
              active={f.minIsolation === v}
              count={f.counts.isolation.get(v)}
              tone="forest"
              onClick={() => f.setMinIsolation(v)}
            >
              {ISOLATION_LABELS[v]}
            </FilterChip>
          ))}
        </FacetRow>

        {/* 낚시 종류 */}
        <FacetRow label="낚시 종류">
          {FISHING_TYPES.map((ft) => (
            <FilterChip
              key={ft.value}
              active={f.fishingTypes.includes(ft.value)}
              count={f.counts.fishingTypes.get(ft.value) ?? 0}
              tone="river"
              onClick={() => f.toggleFishingType(ft.value)}
            >
              {ft.label}
            </FilterChip>
          ))}
        </FacetRow>

        {/* 속성 태그 */}
        <FacetRow label="태그">
          {visibleTags.map((t) => (
            <FilterChip
              key={t}
              active={f.tags.includes(t)}
              count={f.counts.tags.get(t) ?? 0}
              tone="forest"
              onClick={() => f.toggleTag(t)}
            >
              #{t}
            </FilterChip>
          ))}
          {(hiddenTagCount > 0 || tagsExpanded) && (
            <button
              type="button"
              onClick={() => setTagsExpanded((v) => !v)}
              aria-expanded={tagsExpanded}
              className="inline-flex min-h-[44px] items-center gap-1 rounded-sm px-3 text-xs font-semibold text-forest-700 underline underline-offset-2 hover:text-forest-800"
            >
              {tagsExpanded ? "태그 접기" : `태그 ${hiddenTagCount}개 더`}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  tagsExpanded ? "rotate-180" : ""
                }`}
                strokeWidth={2.2}
              />
            </button>
          )}
        </FacetRow>

        <p className="pt-0.5 text-[13px] font-medium leading-relaxed text-neutral-500">
          같은 줄에서 여러 개를 고르면 <b className="font-bold">둘 중 하나라도</b>{" "}
          해당하는 곳이 남습니다. 줄이 다르면 조건이 겹쳐서 적용됩니다.
        </p>

        {f.activeCount > 0 && (
          <button
            type="button"
            onClick={f.reset}
            className="inline-flex min-h-[44px] items-center gap-0.5 text-xs font-medium text-neutral-500 hover:text-forest-700"
          >
            <X className="h-3.5 w-3.5" /> 필터 초기화 ({f.activeCount})
          </button>
        )}
      </div>

      {/* 결과 수 + 정렬 */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="text-sm text-neutral-600" aria-live="polite">
          <span className="text-base font-bold tabular-nums text-forest-800">
            {f.filtered.length}곳
          </span>
          {f.activeCount > 0 && (
            <span className="text-neutral-500">
              {" "}
              / 전체 <span className="tabular-nums">{f.total}</span>곳
            </span>
          )}
        </p>
        <label className="inline-flex items-center gap-2 text-sm">
          <span className="shrink-0 text-neutral-500">정렬</span>
          <select
            value={f.sort}
            onChange={(e) => f.setSort(e.target.value as PlaceSort)}
            className="min-h-[44px] rounded-sm border border-neutral-300 bg-white px-2.5 text-sm font-medium text-neutral-800 outline-none focus:border-forest-500"
          >
            {f.sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* 동적 지도 — 확대/축소·이동 잠금, 범례는 우상단 고정 */}
      <div className="mt-4">
        <KakaoMap
          places={allPlaces}
          activeCategory={f.category}
          visibleIds={visibleIds}
          className="h-[300px] sm:h-[440px]"
        />
      </div>

      {/* 캠핑 + 낚시 연계 강조 */}
      {showConnectedSection && connected.length > 0 && (
        <section className="mt-8 rounded-2xl border border-river-200 bg-river-50 p-5">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-forest-800">
            <Fish className="h-5 w-5 text-river-600" strokeWidth={2} />
            캠핑하며 낚시까지 — 연계 추천
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            캠핑·차박을 베이스로 홍천강 낚시를 함께 즐길 수 있는 검증된
            장소입니다.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {connected.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onSelect={openSpot}
                impressionReferrer="home"
              />
            ))}
          </div>
        </section>
      )}

      {/* 목록 — 결과 0건이면 Empty State / 추천순이면 카테고리별 / 그 외는 정렬된 단일 목록 */}
      {f.filtered.length === 0 ? (
        <EmptyState onReset={f.reset} />
      ) : f.sort === "recommended" ? (
        groups.map((group, gi) => (
          <section key={group.category} className="mt-12">
            <h2 className="mb-5 flex items-center gap-2.5 text-2xl font-extrabold text-forest-800">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest-50 text-forest-700">
                <CategoryIcon category={group.category} className="h-5 w-5" />
              </span>
              {CATEGORY_LABELS[group.category]}
              <span className="rounded-sm bg-forest-50 px-2.5 py-0.5 text-xs font-bold tabular-nums text-forest-600">
                {group.items.length}곳
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cellsFor(group.items, gi === 0)}
            </div>
          </section>
        ))
      ) : (
        <section className="mt-12">
          <h2 className="mb-5 flex items-center gap-2.5 text-2xl font-extrabold text-forest-800">
            {sortLabel}
            <span className="rounded-sm bg-forest-50 px-2.5 py-0.5 text-xs font-bold tabular-nums text-forest-600">
              {f.filtered.length}곳
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cellsFor(f.filtered, true)}
          </div>
        </section>
      )}

      {/* 우측 슬라이드오버 상세 보기 */}
      <SpotSlideOver place={selected} open={slideOpen} onClose={closeSpot} />
    </div>
  );
}

/**
 * 필터 한 줄(패싯) — 라벨 + 칩들.
 * 모바일에서는 라벨을 `w-full`로 만들어 칩 위로 올린다. 44px 타깃 + 괄호 카운트로
 * 칩이 넓어져, 56px 라벨 열을 옆에 두면 375px 화면에서 줄바꿈이 계속 늘어난다.
 * sm 이상에서는 원래대로 라벨이 칩과 같은 줄에 붙는다.
 */
function FacetRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-full text-xs font-bold text-neutral-500 sm:mr-1 sm:w-14 sm:shrink-0">
        {label}
      </span>
      {children}
    </div>
  );
}

/**
 * 필터 칩 — 결과 수를 함께 보여주고, 터치 타깃 44px를 보장한다.
 * 0곳이 되는 칩은 미리 비활성으로 잠근다(누른 뒤 빈 화면을 보는 일이 없도록).
 * 단 이미 고른 칩은 해제할 수 있어야 하므로 잠그지 않는다.
 */
function FilterChip({
  active,
  count,
  tone,
  onClick,
  children,
}: {
  active: boolean;
  count?: number;
  tone: "forest" | "river";
  onClick: () => void;
  children: ReactNode;
}) {
  const dead = !active && count === 0;
  const on =
    tone === "forest" ? "bg-forest-600 text-white" : "bg-river-500 text-white";
  const off =
    tone === "forest"
      ? "bg-sand-100 text-neutral-600 hover:bg-forest-50 hover:text-forest-700"
      : "bg-sand-100 text-neutral-600 hover:bg-river-50 hover:text-river-700";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={dead}
      aria-pressed={active}
      className={`inline-flex min-h-[44px] items-center gap-1 rounded-sm px-3 text-xs font-semibold transition-colors ${
        active
          ? on
          : dead
          ? "cursor-not-allowed bg-sand-100 text-neutral-400"
          : off
      }`}
    >
      {children}
      {/* 괄호로 감싸야 라벨과 섞이지 않는다 — 없으면 "5점1"·"전체12"로 붙어 읽힌다 */}
      {count != null && (
        <span
          className={`tabular-nums text-[12px] font-semibold ${
            active ? "text-white/75" : "text-neutral-500"
          }`}
        >
          ({count})
        </span>
      )}
    </button>
  );
}
