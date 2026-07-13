"use client";

import type { CategoryFilter, PlaceCategory } from "@/types/place";
import { CATEGORY_LABELS } from "@/constants";
import { CategoryIcon } from "@/components/icons";

/**
 * 장소 목록 필터 바 — 검증 가능한 기준(카테고리 + 키워드)만 제공합니다.
 */
const CATEGORY_ORDER: PlaceCategory[] = ["camping", "fishing", "carcamping"];

interface PlaceFilterBarProps {
  query: string;
  category: CategoryFilter;
  onQueryChange: (q: string) => void;
  onCategoryChange: (c: CategoryFilter) => void;
}

export default function PlaceFilterBar({
  query,
  category,
  onQueryChange,
  onCategoryChange,
}: PlaceFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        <Chip
          active={category === "all"}
          onClick={() => onCategoryChange("all")}
        >
          전체
        </Chip>
        {CATEGORY_ORDER.map((c) => (
          <Chip
            key={c}
            active={category === c}
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
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-forest-500 sm:w-64"
      />
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-sm border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-forest-600 bg-forest-600 text-white"
          : "border-neutral-300 bg-white text-neutral-700 hover:border-forest-500 hover:text-forest-600"
      }`}
    >
      {children}
    </button>
  );
}
