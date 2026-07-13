"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { CategoryIcon } from "@/components/icons";
import { CATEGORY_LABELS } from "@/constants";
import type { CategoryFilter, PlaceCategory } from "@/types/place";

/**
 * 검색 우선 히어로의 검색창 + 카테고리 빠른 선택.
 * 코드베이스의 커스텀 이벤트 패턴(hco:open-login)과 동일하게 `hco:search` 를 발행해
 * 아래 목록(PlaceBrowser)의 필터에 적용하고, 목록(#list)으로 부드럽게 스크롤한다.
 */
const CATS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "camping", label: CATEGORY_LABELS.camping },
  { value: "fishing", label: CATEGORY_LABELS.fishing },
  { value: "carcamping", label: CATEGORY_LABELS.carcamping },
];

function emitSearch(detail: { query?: string; category?: CategoryFilter }) {
  window.dispatchEvent(new CustomEvent("hco:search", { detail }));
  document.getElementById("list")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export default function HeroSearch() {
  const [q, setQ] = useState("");

  return (
    <div className="mx-auto mt-8 max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          emitSearch({ query: q.trim() });
        }}
        className="flex items-center gap-1.5 rounded-sm bg-white p-1.5 shadow-lg shadow-black/20 ring-1 ring-black/5"
      >
        <Search
          className="ml-2.5 h-5 w-5 shrink-0 text-neutral-400"
          strokeWidth={2.2}
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="캠핑장·낚시터·차박지, 지역·태그 검색"
          aria-label="장소 검색"
          className="min-w-0 flex-1 bg-transparent px-1 py-2 text-[15px] text-neutral-800 outline-none placeholder:text-neutral-400"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-ember-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-ember-600"
        >
          검색
        </button>
      </form>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {CATS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => emitSearch({ category: c.value })}
            className="inline-flex items-center gap-1.5 rounded-sm bg-white/15 px-3.5 py-1.5 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/25"
          >
            {c.value !== "all" && (
              <CategoryIcon
                category={c.value as PlaceCategory}
                className="h-4 w-4"
              />
            )}
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
