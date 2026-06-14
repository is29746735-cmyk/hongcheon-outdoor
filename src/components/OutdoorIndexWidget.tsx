"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  TriangleAlert,
  OctagonAlert,
  RefreshCw,
  CloudRain,
  Sun,
  type LucideIcon,
} from "lucide-react";
import type {
  OutdoorIndexLevel,
  RiverStatusResponse,
} from "@/types/river";

/** 지수 레벨별 스타일 */
const LEVEL_STYLES: Record<
  OutdoorIndexLevel,
  { container: string; badge: string; icon: LucideIcon; iconColor: string }
> = {
  safe: {
    container: "border-emerald-200 bg-emerald-50",
    badge: "bg-emerald-600",
    icon: ShieldCheck,
    iconColor: "text-emerald-600",
  },
  caution: {
    container: "border-amber-200 bg-amber-50",
    badge: "bg-amber-500",
    icon: TriangleAlert,
    iconColor: "text-amber-500",
  },
  danger: {
    container: "border-red-200 bg-red-50",
    badge: "bg-red-600",
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
          className="rounded-full border border-neutral-300 px-3 py-1 text-neutral-600 hover:border-forest-500 hover:text-forest-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const style = LEVEL_STYLES[data.index.level];

  return (
    <section
      className={`rounded-2xl border p-5 ${style.container}`}
      aria-label="오늘의 홍천강 아웃도어 지수"
    >
      {/* 지수 + 설명 */}
      <p className="text-sm font-semibold tracking-tight text-neutral-600">
        오늘의 홍천강 아웃도어 지수
      </p>
      <div className="mt-2 flex items-center gap-3">
        <style.icon className={`h-7 w-7 ${style.iconColor}`} strokeWidth={2.2} />
        <span
          className={`rounded-full px-4 py-1.5 text-xl font-bold text-white ${style.badge}`}
        >
          {data.index.label}
        </span>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-neutral-800">
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
          <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium">
            {data.source === "live" ? "실시간" : "예시 데이터"}
          </span>
          <button
            type="button"
            onClick={() => load()}
            disabled={refreshing}
            className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium hover:text-forest-600 disabled:opacity-60"
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
    </section>
  );
}
