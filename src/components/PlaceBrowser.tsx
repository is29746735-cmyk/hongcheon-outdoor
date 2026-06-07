"use client";

import { useMemo, useState } from "react";
import { getAllPlaces } from "@/data/places";
import {
  filterPlaces,
  groupByCategory,
  getConnectedPlaces,
  getAllFilterTags,
} from "@/lib/search";
import { CATEGORY_LABELS } from "@/constants";
import { CategoryIcon } from "@/components/icons";
import { Fish, X } from "lucide-react";
import type { CategoryFilter } from "@/types/place";
import PlaceFilterBar from "@/components/SearchSidebar";
import PlaceCard from "@/components/places/PlaceCard";
import KakaoMap from "@/components/KakaoMap";

/**
 * 장소 목록 브라우저 — 카테고리/키워드 필터 + 캠핑↔낚시 연계 추천 +
 * 카테고리별 그룹 목록. 메인 화면에 바로 노출해 한 화면에서 고를 수 있게 한다.
 */
export default function PlaceBrowser() {
  const allPlaces = useMemo(() => getAllPlaces(), []);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [tags, setTags] = useState<string[]>([]);
  const allTags = useMemo(() => getAllFilterTags(allPlaces), [allPlaces]);

  const toggleTag = (t: string) =>
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const filtered = useMemo(
    () => filterPlaces(allPlaces, { query, category, tags }),
    [allPlaces, query, category, tags]
  );
  const groups = useMemo(() => groupByCategory(filtered), [filtered]);
  const connected = useMemo(
    () => getConnectedPlaces(allPlaces).slice(0, 6),
    [allPlaces]
  );

  const showConnectedSection =
    category === "all" && query.trim() === "" && tags.length === 0;

  return (
    <div id="list" className="scroll-mt-20">
      <PlaceFilterBar
        query={query}
        category={category}
        onQueryChange={setQuery}
        onCategoryChange={setCategory}
      />

      {/* 태그 기반 필터 (검증된 속성 태그) */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-semibold text-neutral-400">
          태그
        </span>
        {allTags.map((t) => {
          const on = tags.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggleTag(t)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                on
                  ? "bg-forest-600 text-white"
                  : "bg-sand-100 text-neutral-600 hover:bg-forest-50 hover:text-forest-700"
              }`}
            >
              #{t}
            </button>
          );
        })}
        {tags.length > 0 && (
          <button
            type="button"
            onClick={() => setTags([])}
            className="inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-medium text-neutral-500 hover:text-forest-700"
          >
            <X className="h-3 w-3" /> 초기화
          </button>
        )}
      </div>

      {/* 동적 지도 — 확대/축소·이동 잠금, 범례는 우상단 고정 */}
      <div className="mt-4">
        <KakaoMap
          places={allPlaces}
          activeCategory={category}
          className="h-[440px]"
        />
      </div>

      {/* 캠핑 + 낚시 연계 강조 */}
      {showConnectedSection && connected.length > 0 && (
        <section className="mt-8 rounded-2xl border border-sky-200 bg-sky-50 p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900">
            <Fish className="h-5 w-5 text-sky-600" strokeWidth={2} />
            캠핑하며 낚시까지 — 연계 추천
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
          <section key={group.category} className="mt-12">
            <h2 className="mb-5 flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-neutral-900">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest-50 text-forest-700">
                <CategoryIcon category={group.category} className="h-5 w-5" />
              </span>
              {CATEGORY_LABELS[group.category]}
              <span className="rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-bold text-forest-600">
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
