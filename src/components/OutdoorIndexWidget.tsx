"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  TriangleAlert,
  OctagonAlert,
  ChevronDown,
  RefreshCw,
  CloudRain,
  CloudSnow,
  Cloud,
  Sun,
  type LucideIcon,
} from "lucide-react";
import type {
  DayForecast,
  OutdoorIndexLevel,
  RiverStatusResponse,
} from "@/types/river";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 일자 라벨: 오늘 / 내일 / 요일 */
function dayLabel(dateStr: string, index: number): string {
  if (index === 0) return "오늘";
  if (index === 1) return "내일";
  const d = new Date(`${dateStr}T00:00:00+09:00`);
  const wd = d.getDay();
  return Number.isNaN(wd) ? dateStr.slice(5) : WEEKDAYS[wd];
}

/** 하늘 상태 텍스트 → 아이콘 */
function dayIcon(d: DayForecast): LucideIcon {
  const t = d.skyText ?? "";
  if (t.includes("눈")) return CloudSnow;
  if (d.willPrecipitate || t.includes("비") || t.includes("소나기"))
    return CloudRain;
  if (t.includes("흐") || t.includes("구름") || t.includes("안개")) return Cloud;
  return Sun;
}

/**
 * 지수 레벨별 스타일.
 *
 * 2026-07-27: 색을 낮췄다. 이 위젯이 홈 첫 화면에서 노란 덩어리로 시선을 아래로
 * 끌어당긴다는 지적이 있었다. 카드 바탕은 흰색으로 두고 색은 **배지 하나에만** 쓴다.
 * 단 `danger`(위험)만은 안전 정보라 강도를 유지한다 — 위험할 때까지 조용하면 안 된다.
 */
const LEVEL_STYLES: Record<
  OutdoorIndexLevel,
  { container: string; badge: string; icon: LucideIcon; iconColor: string }
> = {
  safe: {
    container: "border-neutral-200 bg-white",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    icon: ShieldCheck,
    iconColor: "text-emerald-600",
  },
  caution: {
    container: "border-neutral-200 bg-white",
    badge: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
    icon: TriangleAlert,
    iconColor: "text-amber-600",
  },
  danger: {
    // 위험은 예외 — 눈에 띄어야 한다
    container: "border-red-200 bg-red-50",
    badge: "bg-red-600 text-white",
    icon: OctagonAlert,
    iconColor: "text-red-600",
  },
};

/**
 * 자동 갱신 주기. Open-Meteo 실황은 15분 간격(interval 900초) 데이터라
 * 그보다 자주 받아도 값은 같지만, 새 값이 나오면 최대한 빨리 반영되도록 1분마다 폴링한다.
 */
const DEFAULT_REFRESH_MS = 60 * 1000;

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface OutdoorIndexWidgetProps {
  /** 자동 갱신 주기(ms). 기본 1분. */
  refreshIntervalMs?: number;
}

export default function OutdoorIndexWidget({
  refreshIntervalMs = DEFAULT_REFRESH_MS,
}: OutdoorIndexWidgetProps) {
  const [data, setData] = useState<RiverStatusResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  /** 기본은 접힘 — 첫 화면을 날씨가 점령하지 않도록 */
  const [expanded, setExpanded] = useState(false);

  // 동시 요청/언마운트 후 setState 방지용
  const inFlight = useRef(false);
  const mounted = useRef(true);

  const load = useCallback(async (silent = false) => {
    if (inFlight.current) return;
    inFlight.current = true;
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch("/api/river-status", { cache: "no-store" });
      if (!res.ok) throw new Error("요청 실패");
      const json = (await res.json()) as RiverStatusResponse;
      if (!mounted.current) return;
      setData(json);
      setStatus("ready");
      setLastUpdated(new Date().toISOString());
    } catch {
      if (!mounted.current) return;
      // 이미 데이터가 있으면 화면은 유지하고, 첫 로드 실패만 에러 처리
      setStatus((prev) => (prev === "loading" ? "error" : prev));
    } finally {
      inFlight.current = false;
      if (mounted.current && !silent) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();

    // 주기적 자동 갱신 (백그라운드 폴링은 스피너 없이 조용히)
    const timer = setInterval(() => load(true), refreshIntervalMs);

    // 탭이 다시 활성화되면 즉시 갱신 (조용히)
    const onVisible = () => {
      if (document.visibilityState === "visible") load(true);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      mounted.current = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load, refreshIntervalMs]);

  if (status === "loading") {
    return (
      <div className="animate-pulse rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
        <div className="h-5 w-40 rounded bg-neutral-200" />
        <div className="mt-3 h-8 w-24 rounded bg-neutral-200" />
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-500">
        <span>실시간 홍천강 정보를 불러오지 못했습니다.</span>
        <button
          type="button"
          onClick={() => load()}
          className="rounded-sm border border-neutral-300 px-3 py-1 text-neutral-600 hover:border-forest-500 hover:text-forest-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const style = LEVEL_STYLES[data.index.level];
  const today = data.days?.[0];

  return (
    <section
      className={`rounded-2xl border ${style.container}`}
      aria-label="오늘의 홍천강 아웃도어 지수"
    >
      {/*
        접힌 줄 — 오늘 지수와 날씨만. 전체를 펼치는 토글이기도 하다.
        기본을 접힌 상태로 두는 이유: 이 위젯이 첫 화면의 절반을 먹으면
        정작 보러 온 장소 목록이 아래로 밀린다(2026-07-27 사용자 지적).
      */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex min-h-[44px] w-full flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl px-5 py-3.5 text-left transition-colors hover:bg-neutral-50/70"
      >
        <style.icon
          className={`h-5 w-5 shrink-0 ${style.iconColor}`}
          strokeWidth={2.2}
        />
        <span className="text-sm font-bold text-neutral-800">
          오늘의 홍천강 아웃도어 지수
        </span>
        <span
          className={`rounded-sm px-2.5 py-1 text-xs font-bold ${style.badge}`}
        >
          {data.index.label}
        </span>

        {/* 오늘 날씨 요약 — 펼치지 않아도 이만큼은 보인다 */}
        <span className="flex items-center gap-2 text-sm text-neutral-600">
          {data.temperature != null && (
            <span className="font-semibold tabular-nums text-neutral-800">
              {data.temperature}°C
            </span>
          )}
          {data.skyText && <span>{data.skyText}</span>}
          {today?.precipProbability != null && (
            <span className="tabular-nums text-sky-700">
              강수 {today.precipProbability}%
            </span>
          )}
        </span>

        <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-[13px] font-bold text-forest-700">
          {expanded ? "접기" : "자세히"}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            strokeWidth={2.4}
          />
        </span>
      </button>

      {!expanded && (
        <p className="px-5 pb-4 text-[13px] leading-relaxed text-neutral-600">
          {data.index.reason}
        </p>
      )}

      {expanded && (
        <div className="border-t border-black/5 px-5 pb-5 pt-4">
      <p className="text-[15px] leading-relaxed text-neutral-800">
        {data.index.reason}
      </p>

      {/* 오늘의 예보 */}
      {data.forecast && (
        <div
          className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
            data.forecast.willPrecipitate
              ? "bg-sky-100 text-sky-800"
              : "bg-white/70 text-neutral-600"
          }`}
        >
          {data.forecast.willPrecipitate ? (
            <CloudRain className="h-4 w-4 shrink-0" strokeWidth={2} />
          ) : (
            <Sun className="h-4 w-4 shrink-0" strokeWidth={2} />
          )}
          <span>오늘의 예보 · {data.forecast.message}</span>
        </div>
      )}

      {/* 3일 예보 (오늘 + 이후) */}
      {data.days && data.days.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-neutral-500">예보</p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {data.days.slice(0, 4).map((d, i) => {
              const Icon = dayIcon(d);
              return (
                <div
                  key={d.date}
                  className="rounded-xl bg-white/70 px-1.5 py-2.5 text-center"
                >
                  <p className="text-xs font-bold text-neutral-700">
                    {dayLabel(d.date, i)}
                  </p>
                  <Icon
                    className="mx-auto mt-1.5 h-5 w-5 text-neutral-500"
                    strokeWidth={2}
                  />
                  <p className="mt-1.5 text-xs font-semibold tabular-nums text-neutral-900">
                    {d.tempMax != null ? `${d.tempMax}°` : "—"}
                    <span className="ml-1 font-normal text-neutral-400">
                      {d.tempMin != null ? `${d.tempMin}°` : ""}
                    </span>
                  </p>
                  {d.precipProbability != null && (
                    <p className="mt-0.5 text-[13px] font-medium tabular-nums text-sky-700">
                      강수 {d.precipProbability}%
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {data.days.length > 1 && (
            <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">
              오늘 이후 예보는 정확하지 않을 수 있습니다.
            </p>
          )}
        </div>
      )}

      {/* 관측 수치 */}
      <dl className="mt-3 grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-white/70 px-3 py-3 text-center">
          <dt className="text-xs font-medium text-neutral-500">기온</dt>
          <dd className="mt-1 text-lg font-bold text-neutral-900">
            {data.temperature != null ? `${data.temperature}°C` : "—"}
          </dd>
        </div>
        <div className="rounded-xl bg-white/70 px-3 py-3 text-center">
          <dt className="text-xs font-medium text-neutral-500">현재 강수</dt>
          <dd className="mt-1 text-lg font-bold text-neutral-900">
            {data.rainfall1h != null ? `${data.rainfall1h}mm` : "—"}
          </dd>
        </div>
      </dl>

      {/* 출처 · 시각 · 새로고침 (모바일에서는 세로로 정렬) */}
      <div className="mt-4 flex flex-col gap-2 border-t border-black/5 pt-3 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {data.skyText ? `${data.skyText} · ` : ""}
          {formatTime(data.observedAt)} 기준
        </span>
        <div className="flex items-center gap-2">
          <span className="rounded-sm bg-white/70 px-2.5 py-1 text-xs font-medium">
            {data.source === "kma"
              ? "기상청 실측"
              : data.source === "live"
              ? "실시간"
              : "예시 데이터"}
          </span>
          <button
            type="button"
            onClick={() => load()}
            disabled={refreshing}
            className="inline-flex items-center gap-1 rounded-sm bg-white/70 px-2.5 py-1 text-xs font-medium hover:text-forest-600 disabled:opacity-60"
            aria-label="새로고침"
            title={
              lastUpdated
                ? `마지막 갱신: ${formatTime(lastUpdated)}`
                : "새로고침"
            }
          >
            <RefreshCw
              className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
              strokeWidth={2.2}
            />
            {refreshing ? "갱신 중…" : "새로고침"}
          </button>
        </div>
      </div>
        </div>
      )}
    </section>
  );
}
