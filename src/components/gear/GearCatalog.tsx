"use client";

import { useMemo, useState } from "react";
import { Fish, Tent, Sparkles, Utensils, Search, X } from "lucide-react";
import { getGearByCategory, type GearCategory } from "@/data/gear";
import { textMatches } from "@/lib/search";
import GearGrid from "@/components/gear/GearGrid";

const SECTIONS: { key: GearCategory; label: string; Icon: typeof Fish }[] = [
  { key: "camping", label: "캠핑용품", Icon: Tent },
  { key: "fishing", label: "낚시용품", Icon: Fish },
  { key: "aesthetic", label: "감성 아이템", Icon: Sparkles },
  { key: "food", label: "먹거리", Icon: Utensils },
];

export default function GearCatalog() {
  const [query, setQuery] = useState("");

  // 검색어로 필터링한 섹션별 아이템 (검색 대상: 이름·설명·태그)
  const filtered = useMemo(
    () =>
      SECTIONS.map((s) => ({
        ...s,
        items: getGearByCategory(s.key).filter((g) =>
          textMatches([g.name, g.summary, ...(g.tags ?? [])].join(" "), query),
        ),
      })),
    [query],
  );

  const searching = query.trim().length > 0;
  const totalResults = filtered.reduce((n, s) => n + s.items.length, 0);

  return (
    <>
      {/* 검색 */}
      <div className="relative mt-5">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          strokeWidth={2}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="용품 검색 (예: 돗자리, 부탄, ㅂㅌ, 불멍)"
          aria-label="용품 검색"
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 py-2.5 pl-10 pr-10 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-forest-500"
        />
        {searching && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="검색어 지우기"
            className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-4 w-4" strokeWidth={2.2} />
          </button>
        )}
      </div>

      {/* 카테고리 바로가기 (검색 중이 아닐 때만) */}
      {!searching && (
        <nav className="mt-4 flex flex-wrap gap-2">
          {SECTIONS.map(({ key, label, Icon }) => (
            <a
              key={key}
              href={`#${key}`}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                key === "fishing"
                  ? "bg-river-50 text-river-700 hover:bg-river-100"
                  : "bg-forest-50 text-forest-700 hover:bg-forest-100"
              }`}
            >
              <Icon size={15} strokeWidth={2.2} />
              {label}
            </a>
          ))}
        </nav>
      )}

      {searching && (
        <p className="mt-4 text-sm text-neutral-500">
          '{query.trim()}' 검색 결과{" "}
          <span className="font-semibold tabular-nums text-neutral-700">
            {totalResults}
          </span>
          건
        </p>
      )}

      {searching && totalResults === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-neutral-200 py-10 text-center text-sm text-neutral-400">
          '{query.trim()}'에 맞는 용품이 없어요. 다른 검색어를 입력해 보세요.
        </p>
      )}

      {filtered.map(({ key, label, Icon, items }) => {
        if (items.length === 0) return null; // 검색 결과 없는 섹션 숨김
        return (
          <section key={key} id={key} className="mt-10 scroll-mt-20">
            <div className="flex items-center gap-2">
              <Icon
                className={key === "fishing" ? "text-river-600" : "text-forest-600"}
                size={22}
                strokeWidth={2.2}
              />
              <h2 className="text-xl font-extrabold text-forest-800">{label}</h2>
              <span className="text-sm font-semibold tabular-nums text-neutral-400">
                {items.length}
              </span>
            </div>
            <div className="mt-4">
              <GearGrid items={items} />
            </div>
          </section>
        );
      })}
    </>
  );
}
