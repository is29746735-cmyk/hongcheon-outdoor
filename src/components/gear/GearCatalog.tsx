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
  ArrowDownAZ,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Flame,
  type LucideIcon,
} from "lucide-react";
import {
  getAllGear,
  getGearByCategory,
  availableGearSortOptions,
  sortGear,
  type GearCategory,
  type GearSort,
} from "@/data/gear";
import { textMatches } from "@/lib/search";
import GearGrid from "@/components/gear/GearGrid";

/** 정렬 버튼 아이콘 — 장소 목록 정렬과 같은 패턴(글자만 있는 줄보다 눈에 먼저 든다) */
const SORT_ICONS: Record<GearSort, LucideIcon> = {
  recommended: Sparkles,
  popular: Flame,
  "price-asc": ArrowUpNarrowWide,
  "price-desc": ArrowDownWideNarrow,
};

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
  const [sort, setSort] = useState<GearSort>("recommended");

  // 데이터가 뒷받침하는 정렬만 노출 (availableGearSortOptions 주석 참고)
  const sortOptions = useMemo(() => availableGearSortOptions(getAllGear()), []);

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

  // 검색어로 필터링 → 고른 기준으로 정렬. 정렬은 종류 안에서 이뤄진다
  // (종류 구분은 목록의 뼈대라 정렬이 그걸 흐트러뜨리면 훑기 어려워진다).
  const filtered = useMemo(
    () =>
      SECTIONS.map((s) => ({
        ...s,
        items: sortGear(
          getGearByCategory(s.key).filter((g) =>
            textMatches([g.name, g.summary, ...(g.tags ?? [])].join(" "), query),
          ),
          sort,
        ),
      })),
    [query, sort],
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

      {/*
        정렬 — 목록 바로 위에 둔다. 장소 목록에서 정렬을 필터 패널 밑에 뒀다가
        "바꿔도 안 바뀐다"는 오해를 샀던 적이 있다(2026-07-27). 화면에서 결과가
        바로 보이는 자리여야 정렬이 작동한다는 걸 알 수 있다.
      */}
      {totalResults > 0 && (
        <section
          className="mt-6 rounded-2xl border border-sand-300 bg-white p-3.5"
          aria-label="정렬 기준"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="inline-flex w-full shrink-0 items-center gap-1.5 text-sm font-bold text-forest-800 sm:w-auto">
              <ArrowDownAZ className="h-4 w-4 text-forest-600" strokeWidth={2.4} />
              정렬
            </span>
            <div
              role="group"
              aria-label="정렬 기준"
              className="flex w-full flex-wrap gap-1.5 sm:w-auto"
            >
              {sortOptions.map((o) => {
                const Icon = SORT_ICONS[o.value];
                const active = sort === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setSort(o.value)}
                    aria-pressed={active}
                    className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-sm border px-3 text-sm font-bold transition-colors ${
                      active
                        ? "border-forest-600 bg-forest-600 text-white"
                        : "border-neutral-300 bg-white text-neutral-700 hover:border-forest-400 hover:text-forest-700"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2.2} />
                    {o.short}
                    {/* 보조 설명은 좁은 화면에서 감춘다(버튼이 한 줄에 하나씩 떨어진다) */}
                    <span
                      className={`hidden font-medium sm:inline ${
                        active ? "text-forest-100" : "text-neutral-500"
                      }`}
                    >
                      {o.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/*
            ⚠️ 이 줄을 빼지 말 것. 인기·가격은 아직 제휴를 연결하기 전의 예시 값이라
            사실처럼 보이면 안 된다. 실제 데이터로 갈아끼울 때 이 문장도 같이 지운다.
          */}
          {sort !== "recommended" && (
            <p className="mt-2.5 text-[13px] leading-relaxed text-neutral-600">
              인기·가격대는 제휴 연결 전 <b className="font-bold">예시 값</b>입니다.
              가격은 정확한 금액이 아니라 구간으로만 적었습니다.
            </p>
          )}
        </section>
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
