"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Fish,
  Tent,
  Sparkles,
  Utensils,
  Search,
  X,
  LayoutGrid,
} from "lucide-react";
import { getGearByCategory, type GearCategory } from "@/data/gear";
import { textMatches } from "@/lib/search";
import GearGrid from "@/components/gear/GearGrid";

const SECTIONS: { key: GearCategory; label: string; Icon: typeof Fish }[] = [
  { key: "camping", label: "캠핑용품", Icon: Tent },
  { key: "fishing", label: "낚시용품", Icon: Fish },
  { key: "aesthetic", label: "감성 아이템", Icon: Sparkles },
  { key: "food", label: "먹거리", Icon: Utensils },
];

type CatFilter = GearCategory | "all";

/** 카테고리 필터 pill (선택 시 채워짐 / 낚시는 river 톤) */
function FilterPill({
  active,
  onClick,
  Icon,
  label,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  Icon: typeof Fish;
  label: string;
  tone: "forest" | "river";
}) {
  const styles =
    tone === "river"
      ? active
        ? "bg-river-500 text-white"
        : "bg-river-50 text-river-700 hover:bg-river-100"
      : active
        ? "bg-forest-600 text-white"
        : "bg-forest-50 text-forest-700 hover:bg-forest-100";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-sm px-3.5 py-2 text-sm font-semibold transition-colors ${styles}`}
    >
      <Icon size={15} strokeWidth={2.2} />
      {label}
    </button>
  );
}

export default function GearCatalog() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<CatFilter>("all");

  // 다른 페이지(홈·상세)에서 /gear#fishing 처럼 넘어오면 해당 종류만 선택
  useEffect(() => {
    const applyHash = () => {
      const h = window.location.hash.replace("#", "");
      if (SECTIONS.some((s) => s.key === h)) setActiveCat(h as GearCategory);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const selectCat = (cat: CatFilter) => {
    setActiveCat(cat);
    // 공유·뒤로가기용 URL 해시 동기화(스크롤 없이)
    const url =
      cat === "all"
        ? window.location.pathname + window.location.search
        : `#${cat}`;
    history.replaceState(null, "", url);
  };

  // 검색어로 필터링한 종류별 아이템 (검색 대상: 이름·설명·태그)
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

  // 검색 중이면 전체에서 매칭, 아니면 선택한 종류(또는 전체)만 표시
  const visible = searching
    ? filtered
    : activeCat === "all"
      ? filtered
      : filtered.filter((s) => s.key === activeCat);

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
            className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-sm text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-4 w-4" strokeWidth={2.2} />
          </button>
        )}
      </div>

      {/* 종류 필터 (검색 중이 아닐 때만) — 누르면 그 종류만 표시 */}
      {!searching && (
        <nav className="mt-4 flex flex-wrap gap-2">
          <FilterPill
            active={activeCat === "all"}
            onClick={() => selectCat("all")}
            Icon={LayoutGrid}
            label="전체"
            tone="forest"
          />
          {SECTIONS.map(({ key, label, Icon }) => (
            <FilterPill
              key={key}
              active={activeCat === key}
              onClick={() => selectCat(key)}
              Icon={Icon}
              label={label}
              tone={key === "fishing" ? "river" : "forest"}
            />
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

      {visible.map(({ key, label, Icon, items }) => {
        if (items.length === 0) return null; // 검색 결과 없는 종류 숨김
        return (
          <section key={key} id={key} className="mt-8 scroll-mt-20">
            <div className="flex items-center gap-2">
              <Icon
                className={
                  key === "fishing" ? "text-river-600" : "text-forest-600"
                }
                size={22}
                strokeWidth={2.2}
              />
              <h2 className="text-xl font-extrabold text-forest-800">
                {label}
              </h2>
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
