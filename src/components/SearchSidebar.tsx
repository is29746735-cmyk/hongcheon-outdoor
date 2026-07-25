"use client";

import type { CategoryFilter, PlaceCategory } from "@/types/place";
import { CATEGORY_LABELS } from "@/constants";
import { CategoryIcon } from "@/components/icons";

/**
 * 장소 목록 필터 바 — 검증 가능한 기준(카테고리 + 키워드)만 제공합니다.
 * 카테고리 칩에는 지금 조건에서 남는 장소 수를 함께 보여줍니다.
 */
const CATEGORY_ORDER: PlaceCategory[] = ["camping", "fishing", "carcamping"];

interface PlaceFilterBarProps {
  query: string;
  category: CategoryFilter;
  /** 카테고리별 결과 수 (usePlaceFilters의 counts.category) */
  categoryCounts?: Map<CategoryFilter, number>;
  onQueryChange: (q: string) => void;
  onCategoryChange: (c: CategoryFilter) => void;
}

export default function PlaceFilterBar({
  query,
  category,
  categoryCounts,
  onQueryChange,
  onCategoryChange,
}: PlaceFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        <Chip
          active={category === "all"}
          count={categoryCounts?.get("all")}
          onClick={() => onCategoryChange("all")}
        >
          전체
        </Chip>
        {CATEGORY_ORDER.map((c) => (
          <Chip
            key={c}
            active={category === c}
            count={categoryCounts?.get(c)}
            onClick={() => onCategoryChange(c)}
          >
            <CategoryIcon category={c} className="h-4 w-4" />
            {CATEGORY_LABELS[c]}
          </Chip>
        ))}
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="이름·지역·태그 검색"
        className="min-h-[44px] w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-forest-500 sm:w-64"
      />
    </div>
  );
}

function Chip({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count?: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  // 0곳이 되는 카테고리는 미리 잠근다(고른 상태면 해제할 수 있어야 하니 예외)
  const dead = !active && count === 0;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={dead}
      aria-pressed={active}
      className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-sm border px-4 text-sm font-medium transition-colors ${
        active
          ? "border-forest-600 bg-forest-600 text-white"
          : dead
          ? "cursor-not-allowed border-neutral-200 bg-white text-neutral-400"
          : "border-neutral-300 bg-white text-neutral-700 hover:border-forest-500 hover:text-forest-600"
      }`}
    >
      {children}
      {/* 괄호 필수 — 없으면 "전체12"처럼 라벨과 붙어 읽힌다 */}
      {count != null && (
        <span
          className={`tabular-nums text-[11px] ${
            active ? "text-white/75" : "text-neutral-500"
          }`}
        >
          ({count})
        </span>
      )}
    </button>
  );
}
