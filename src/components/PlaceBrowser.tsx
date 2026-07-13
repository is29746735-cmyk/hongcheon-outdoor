"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import type { Place } from "@/types/place";
import { getAllPlaces } from "@/data/places";
import {
  groupByCategory,
  getConnectedPlaces,
  getAllFilterTags,
  FISHING_TYPES,
} from "@/lib/search";
import { CATEGORY_LABELS } from "@/constants";
import { CategoryIcon } from "@/components/icons";
import { Fish, X } from "lucide-react";
import { usePlaceFilters } from "@/lib/usePlaceFilters";
import PlaceFilterBar from "@/components/SearchSidebar";
import PlaceCard from "@/components/places/PlaceCard";
import EmptyState from "@/components/places/EmptyState";
import SpotSlideOver from "@/components/places/SpotSlideOver";
import KakaoMap from "@/components/KakaoMap";

const ISOLATION_OPTIONS = [
  { value: 1, label: "전체" },
  { value: 3, label: "3점+" },
  { value: 4, label: "4점+" },
  { value: 5, label: "5점" },
];

/**
 * 장소 목록 브라우저 — 사이드바/필터 메뉴(카테고리·태그·고립도·낚시종류·키워드)에
 * 맞춰 하단 카드 리스트가 실시간으로 필터링된다. (usePlaceFilters 훅 사용)
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

  const showConnectedSection = f.activeCount === 0;
  const visibleIds = useMemo(
    () => new Set(f.filtered.map((p) => p.id)),
    [f.filtered]
  );

  // 슬라이드오버(우측 상세 보기) 상태
  const [selected, setSelected] = useState<Place | null>(null);
  const [slideOpen, setSlideOpen] = useState(false);
  const openSpot = useCallback((place: Place) => {
    setSelected(place);
    setSlideOpen(true);
  }, []);
  const closeSpot = useCallback(() => setSlideOpen(false), []);

  return (
    <div id="list" className="scroll-mt-20">
      <PlaceFilterBar
        query={f.query}
        category={f.category}
        onQueryChange={f.setQuery}
        onCategoryChange={f.setCategory}
      />

      {/* 상세 필터 메뉴 */}
      <div className="mt-3 space-y-2.5 rounded-2xl border border-sand-300 bg-white p-3.5">
        {/* 한적함(고립도) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 w-14 shrink-0 text-xs font-semibold text-neutral-500">
            한적함
          </span>
          {ISOLATION_OPTIONS.map((o) => {
            const on = f.minIsolation === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => f.setMinIsolation(o.value)}
                className={`rounded-sm px-3 py-1 text-xs font-medium transition-colors ${
                  on
                    ? "bg-forest-600 text-white"
                    : "bg-sand-100 text-neutral-600 hover:bg-forest-50 hover:text-forest-700"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>

        {/* 낚시 종류 */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 w-14 shrink-0 text-xs font-semibold text-neutral-500">
            낚시 종류
          </span>
          {FISHING_TYPES.map((ft) => {
            const on = f.fishingTypes.includes(ft.value);
            return (
              <button
                key={ft.value}
                type="button"
                onClick={() => f.toggleFishingType(ft.value)}
                className={`rounded-sm px-3 py-1 text-xs font-medium transition-colors ${
                  on
                    ? "bg-river-500 text-white"
                    : "bg-sand-100 text-neutral-600 hover:bg-river-50 hover:text-river-700"
                }`}
              >
                {ft.label}
              </button>
            );
          })}
        </div>

        {/* 속성 태그 */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 w-14 shrink-0 text-xs font-semibold text-neutral-500">
            태그
          </span>
          {allTags.map((t) => {
            const on = f.tags.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => f.toggleTag(t)}
                className={`rounded-sm px-2.5 py-1 text-xs font-medium transition-colors ${
                  on
                    ? "bg-forest-600 text-white"
                    : "bg-sand-100 text-neutral-600 hover:bg-forest-50 hover:text-forest-700"
                }`}
              >
                #{t}
              </button>
            );
          })}
        </div>

        {f.activeCount > 0 && (
          <button
            type="button"
            onClick={f.reset}
            className="inline-flex items-center gap-0.5 text-xs font-medium text-neutral-500 hover:text-forest-700"
          >
            <X className="h-3 w-3" /> 필터 초기화 ({f.activeCount})
          </button>
        )}
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
          <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-forest-800">
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

      {/* 카테고리별 목록 — 결과가 0건이면 Empty State */}
      {f.filtered.length === 0 ? (
        <EmptyState onReset={f.reset} />
      ) : (
        groups.map((group) => (
          <section key={group.category} className="mt-12">
            <h2 className="mb-5 flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-forest-800">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest-50 text-forest-700">
                <CategoryIcon category={group.category} className="h-5 w-5" />
              </span>
              {CATEGORY_LABELS[group.category]}
              <span className="rounded-sm bg-forest-50 px-2.5 py-0.5 text-xs font-bold text-forest-600">
                {group.items.length}곳
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onSelect={openSpot}
                  impressionReferrer="home"
                />
              ))}
            </div>
          </section>
        ))
      )}

      {/* 우측 슬라이드오버 상세 보기 */}
      <SpotSlideOver place={selected} open={slideOpen} onClose={closeSpot} />
    </div>
  );
}
