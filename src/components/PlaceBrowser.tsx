"use client";

import { useMemo, useState, useCallback, type ReactNode } from "react";
import type { Place } from "@/types/place";
import { getAllPlaces } from "@/data/places";
import GearPromoBand from "@/components/gear/GearPromoBand";
import {
  groupByCategory,
  getConnectedPlaces,
  getAllFilterTags,
  FISHING_TYPES,
  type PlaceSort,
} from "@/lib/search";
import { CATEGORY_LABELS } from "@/constants";
import { CategoryIcon } from "@/components/icons";
import {
  ArrowDownAZ,
  ChevronDown,
  Fish,
  Navigation,
  Sparkles,
  Star,
  TreePine,
  X,
  type LucideIcon,
} from "lucide-react";
import { usePlaceFilters, ISOLATION_THRESHOLDS } from "@/lib/usePlaceFilters";
import { formatDistance } from "@/lib/geo";
import PlaceFilterBar from "@/components/SearchSidebar";
import PlaceCard from "@/components/places/PlaceCard";
import EmptyState from "@/components/places/EmptyState";
import SpotSlideOver from "@/components/places/SpotSlideOver";
import KakaoMap from "@/components/KakaoMap";

/** 정렬 버튼 아이콘 — 글자만 있는 줄보다 훑을 때 눈에 먼저 들어온다 */
const SORT_ICONS: Record<PlaceSort, LucideIcon> = {
  recommended: Sparkles,
  distance: Navigation,
  rating: Star,
  isolation: TreePine,
  name: ArrowDownAZ,
};

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

  /**
   * 연계 추천 펼침 상태. 기본은 접힘 —
   * 캠핑·낚시 연계는 모두가 찾는 것이 아니라 궁금한 사람이 여는 것이다.
   */
  const [connectedOpen, setConnectedOpen] = useState(false);

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

  /**
   * 카드 셀 만들기 — 장소 카드만. 예전에는 3번째 자리에 인피드 용품 카드를 한 장
   * 끼웠는데, 장소를 훑는 흐름을 끊는다는 판단으로 2026-07-25에 없애고
   * 용품 진입은 목록 앞의 배너(GearPromoBand) 하나로 모았다.
   */
  const cellsFor = useCallback(
    (items: Place[]): ReactNode[] => {
      const cells: ReactNode[] = items.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          onSelect={openSpot}
          impressionReferrer="home"
          distanceM={f.distances.get(place.id)}
        />
      ));
      return cells;
    },
    [openSpot, f.distances]
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

      {/* 결과 수 — 필터를 바꿨을 때 바로 보이도록 필터 패널 바로 아래에 둔다 */}
      <div className="mt-3">
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

      {/*
        캠핑 + 낚시 연계 — **기본 접힘**(2026-07-27).
        모두가 찾는 것이 아니라 "캠핑하면서 낚시도 되나?"가 궁금한 사람의 것이라,
        펼쳐 둔 채로는 카드 6장이 목록 앞을 막고 정렬까지 밀어낸다.
        접힌 줄에 제목·곳수·한 줄 설명을 남겨 무엇이 들었는지는 알 수 있게 한다.
      */}
      {showConnectedSection && connected.length > 0 && (
        <section className="mt-8 overflow-hidden rounded-2xl border border-river-200 bg-river-50">
          <h2>
            <button
              type="button"
              onClick={() => setConnectedOpen((v) => !v)}
              aria-expanded={connectedOpen}
              className="flex min-h-[44px] w-full flex-wrap items-center gap-x-2.5 gap-y-1 px-5 py-4 text-left transition-colors hover:bg-river-100/60"
            >
              <Fish
                className="h-5 w-5 shrink-0 text-river-600"
                strokeWidth={2}
              />
              <span className="text-xl font-extrabold text-forest-800">
                캠핑하며 낚시까지 — 연계 추천
              </span>
              <span className="rounded-sm bg-white px-2.5 py-0.5 text-xs font-bold tabular-nums text-river-700 ring-1 ring-river-200">
                {connected.length}곳
              </span>
              <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-[13px] font-bold text-forest-700">
                {connectedOpen ? "접기" : "펼쳐 보기"}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    connectedOpen ? "rotate-180" : ""
                  }`}
                  strokeWidth={2.4}
                />
              </span>
            </button>
          </h2>
          <p className="px-5 pb-4 text-sm leading-relaxed text-neutral-600">
            캠핑·차박을 베이스로 홍천강 낚시를 함께 즐길 수 있는 검증된
            장소입니다.
          </p>
          {connectedOpen && (
            <div className="grid grid-cols-1 gap-6 border-t border-river-200 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {connected.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onSelect={openSpot}
                  impressionReferrer="home"
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/*
        용품 진입 배너 — 연계 추천과 장소 목록 사이(2026-07-25 사용자 지정 위치).
        필터를 걸면 연계 추천이 사라지므로 이 배너가 결과보다 먼저 나오게 되는데,
        그때는 찾는 걸 먼저 보여줘야 하니 목록 아래로 내린다.
      */}
      {showConnectedSection && <GearPromoBand className="mt-12" />}

      {/*
        정렬 — 목록 **바로 위**에 둔다.
        예전에는 필터 패널 밑의 작은 <select> 였는데, 거기서 지도·연계추천·용품배너를
        지나 첫 카드까지 2,281px 이라 바꿔도 화면에서 달라지는 게 안 보였다.
        기능이 멀쩡한데도 "안 바뀐다"로 읽히던 원인이다(2026-07-27 지적).
        선택형 버튼으로 바꿔 무엇을 고를 수 있는지 자체가 보이게 한다.
      */}
      {f.filtered.length > 0 && (
        <section
          className="mt-12 rounded-2xl border border-sand-300 bg-white p-3.5"
          aria-label="정렬 기준"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {/*
              좁은 화면에서는 라벨과 버튼 줄을 각각 한 줄로 내린다.
              라벨과 같은 줄에 두면 남는 폭이 260px 뿐이라 버튼이 한 줄에 하나씩
              떨어져 패널이 255px까지 길어졌다.
            */}
            <span className="inline-flex w-full shrink-0 items-center gap-1.5 text-sm font-bold text-forest-800 sm:w-auto">
              <ArrowDownAZ className="h-4 w-4 text-forest-600" strokeWidth={2.4} />
              정렬
            </span>
            <div
              role="group"
              aria-label="정렬 기준"
              className="flex w-full flex-wrap gap-1.5 sm:w-auto"
            >
              {f.sortOptions.map((o) => {
                const Icon = SORT_ICONS[o.value];
                const active = f.sort === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => f.setSort(o.value)}
                    aria-pressed={active}
                    className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-sm border px-3 text-sm font-bold transition-colors ${
                      active
                        ? "border-forest-600 bg-forest-600 text-white"
                        : "border-neutral-300 bg-white text-neutral-700 hover:border-forest-400 hover:text-forest-700"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2.2} />
                    {o.short}
                    {/*
                      보조 설명은 좁은 화면에서 감춘다. 넣으면 버튼 하나가
                      158~181px가 되어 한 줄에 하나씩 떨어진다(패널이 255px로 길어짐).
                      '가까운 순'의 위치 안내는 고르는 즉시 아래 줄에 나오므로
                      모바일에서도 설명이 사라지지는 않는다.
                    */}
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

          {/* 내 위치 안내 — 가까운 순은 위치 권한이 있어야 동작하므로 상태를 숨기지 않는다 */}
          {(f.locationStatus !== "idle" || f.sort === "distance") && (
            <p
              className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium"
              aria-live="polite"
            >
              {f.locationStatus === "asking" && (
                <span className="text-neutral-600">
                  내 위치를 확인하는 중…
                  {/*
                    첫 응답은 대개 IP 추정이라 오차가 크다. 더 정확해질 때까지
                    최대 8초를 기다리므로, 기다리는 동안 지금 오차를 보여 준다.
                  */}
                  {f.pendingAccuracy != null && (
                    <span className="text-neutral-500">
                      {" "}
                      (지금 오차 ±{formatDistance(f.pendingAccuracy)} — 더 정확한
                      값을 기다리는 중)
                    </span>
                  )}
                </span>
              )}
              {f.locationStatus === "blocked" && (
                <>
                  <span className="text-[#c6461f]">
                    브라우저에서 이 사이트의 위치 권한이 차단돼 있습니다.
                  </span>
                  <span className="text-neutral-500">
                    주소창의 자물쇠 아이콘 → 위치 → 허용으로 바꾼 뒤 다시
                    눌러 주세요.
                  </span>
                  <button
                    type="button"
                    onClick={() => f.requestLocation()}
                    className="font-bold text-forest-700 underline underline-offset-2 hover:text-forest-800"
                  >
                    다시 시도
                  </button>
                </>
              )}
              {f.locationStatus === "granted" && (
                <>
                  <span className="inline-flex items-center gap-1 text-forest-700">
                    <Navigation className="h-3.5 w-3.5" strokeWidth={2.4} />
                    내 위치 기준 거리 표시 중
                  </span>
                  <span className="text-neutral-500">
                    직선 거리이며 실제 차로 거리와 다릅니다
                    {/* 오차가 1km를 넘으면 숨기지 않는다 — 순서가 그만큼 흔들린다 */}
                    {f.locationAccuracy != null && f.locationAccuracy >= 1000 && (
                      <> · 위치 오차 ±{formatDistance(f.locationAccuracy)}</>
                    )}
                  </span>
                </>
              )}
              {/*
                받은 위치가 못 미더울 때. 그냥 정렬해 버리면 홍천 장소들이
                4,900km로 뜨는 화면이 나온다(2026-07-27 실제 사례) —
                왜 못 쓰는지 숫자까지 밝히고 추천순으로 되돌린다.
              */}
              {f.locationStatus === "unreliable" && f.locationIssue && (
                <>
                  <span className="text-[#c6461f]">
                    {f.locationIssue.kind === "far"
                      ? `받은 위치가 홍천에서 ${formatDistance(
                          f.locationIssue.distanceM
                        )} 떨어져 있습니다. 가까운 순으로 정렬할 수 없어 추천순으로 되돌렸습니다.`
                      : `받은 위치의 오차가 ±${formatDistance(
                          f.locationIssue.accuracyM ?? 0
                        )}로 커서 가까운 순을 신뢰할 수 없습니다. 추천순으로 되돌렸습니다.`}
                  </span>
                  <span className="text-neutral-500">
                    기기의 위치 서비스를 켜고 브라우저에 &lsquo;정확한 위치&rsquo;를
                    허용하면 나아집니다.
                  </span>
                  <button
                    type="button"
                    onClick={() => f.requestLocation()}
                    className="font-bold text-forest-700 underline underline-offset-2 hover:text-forest-800"
                  >
                    다시 시도
                  </button>
                </>
              )}
              {f.locationStatus === "denied" && (
                <>
                  <span className="text-[#c6461f]">
                    위치를 받지 못해 가까운 순을 쓸 수 없습니다.
                  </span>
                  <button
                    type="button"
                    onClick={() => f.requestLocation()}
                    className="font-bold text-forest-700 underline underline-offset-2 hover:text-forest-800"
                  >
                    다시 시도
                  </button>
                </>
              )}
              {f.locationStatus === "unsupported" && (
                <span className="text-neutral-600">
                  이 브라우저에서는 위치 기능을 쓸 수 없습니다.
                </span>
              )}
            </p>
          )}
        </section>
      )}

      {/* 목록 — 결과 0건이면 Empty State / 추천순이면 카테고리별 / 그 외는 정렬된 단일 목록 */}
      {f.filtered.length === 0 ? (
        <EmptyState onReset={f.reset} />
      ) : f.sort === "recommended" ? (
        groups.map((group, gi) => (
          <section key={group.category} className={gi === 0 ? "mt-6" : "mt-12"}>
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
              {cellsFor(group.items)}
            </div>
          </section>
        ))
      ) : (
        <section className="mt-6">
          <h2 className="mb-5 flex items-center gap-2.5 text-2xl font-extrabold text-forest-800">
            {sortLabel}
            <span className="rounded-sm bg-forest-50 px-2.5 py-0.5 text-xs font-bold tabular-nums text-forest-600">
              {f.filtered.length}곳
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cellsFor(f.filtered)}
          </div>
        </section>
      )}

      {/* 필터·정렬 중이면 배너를 목록 뒤로 (위 주석 참조) */}
      {!showConnectedSection && <GearPromoBand className="mt-12" />}

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
