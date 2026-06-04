"use client";

import { useMemo, useState } from "react";
import { getAllPlaces } from "@/data/places";
import { filterPlaces, groupByCategory, getConnectedPlaces } from "@/lib/search";
import { CATEGORY_LABELS } from "@/constants";
import type { CategoryFilter } from "@/types/place";
import PlaceFilterBar from "@/components/SearchSidebar";
import PlaceCard from "@/components/places/PlaceCard";

/**
 * 장소 목록 브라우저 — 카테고리/키워드 필터 + 캠핑↔낚시 연계 추천 +
 * 카테고리별 그룹 목록. 메인 화면에 바로 노출해 한 화면에서 고를 수 있게 한다.
 */
export default function PlaceBrowser() {
  const allPlaces = useMemo(() => getAllPlaces(), []);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");

  const filtered = useMemo(
    () => filterPlaces(allPlaces, { query, category }),
    [allPlaces, query, category]
  );
  const groups = useMemo(() => groupByCategory(filtered), [filtered]);
  const connected = useMemo(
    () => getConnectedPlaces(allPlaces).slice(0, 6),
    [allPlaces]
  );

  const showConnectedSection = category === "all" && query.trim() === "";

  return (
    <div id="list" className="scroll-mt-20">
      <PlaceFilterBar
        query={query}
        category={category}
        onQueryChange={setQuery}
        onCategoryChange={setCategory}
      />

      {/* 캠핑 + 낚시 연계 강조 */}
      {showConnectedSection && connected.length > 0 && (
        <section className="mt-8 rounded-2xl border border-sky-200 bg-sky-50 p-5">
          <h2 className="text-lg font-bold text-neutral-900">
            🎣 캠핑하며 낚시까지 — 연계 추천
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            캠핑·차박을 베이스로 홍천강 낚시를 함께 즐길 수 있는 검증된
            장소입니다.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {connected.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </section>
      )}

      {/* 카테고리별 목록 */}
      {groups.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
          조건에 맞는 장소가 없습니다.
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.category} className="mt-10">
            <h2 className="mb-4 text-xl font-bold text-neutral-900">
              {CATEGORY_LABELS[group.category]}
              <span className="ml-2 text-sm font-normal text-neutral-400">
                {group.items.length}곳
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
