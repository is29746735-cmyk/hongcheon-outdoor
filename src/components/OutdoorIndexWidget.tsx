"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  OutdoorIndexLevel,
  RiverStatusResponse,
} from "@/types/river";

/** 지수 레벨별 스타일 */
const LEVEL_STYLES: Record<
  OutdoorIndexLevel,
  { container: string; badge: string; emoji: string }
> = {
  safe: {
    container: "border-emerald-200 bg-emerald-50",
    badge: "bg-emerald-600",
    emoji: "🟢",
  },
  caution: {
    container: "border-amber-200 bg-amber-50",
    badge: "bg-amber-500",
    emoji: "🟡",
  },
  danger: {
    container: "border-red-200 bg-red-50",
    badge: "bg-red-600",
    emoji: "🔴",
  },
};

/** 기본 자동 갱신 주기 (기상청 초단기실황은 매시 갱신되므로 5분 폴링) */
const DEFAULT_REFRESH_MS = 5 * 60 * 1000;

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
  /** 자동 갱신 주기(ms). 기본 5분. */
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

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);
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
      if (mounted.current) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();

    // 주기적 자동 갱신
    const timer = setInterval(load, refreshIntervalMs);

    // 탭이 다시 활성화되면 즉시 갱신
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
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
          onClick={load}
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
        <span className="text-3xl">{style.emoji}</span>
        <span
          className={`rounded-full px-4 py-1.5 text-xl font-bold text-white ${style.badge}`}
        >
          {data.index.label}
        </span>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-neutral-800">
        {data.index.reason}
      </p>

      {/* 관측 수치 */}
      <dl className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-white/70 px-3 py-3 text-center">
          <dt className="text-xs font-medium text-neutral-500">기온</dt>
          <dd className="mt-1 text-lg font-bold text-neutral-900">
            {data.temperature != null ? `${data.temperature}°C` : "—"}
          </dd>
        </div>
        <div className="rounded-xl bg-white/70 px-3 py-3 text-center">
          <dt className="text-xs font-medium text-neutral-500">강수</dt>
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
            onClick={load}
            disabled={refreshing}
            className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium hover:text-forest-600 disabled:opacity-60"
            aria-label="새로고침"
            title={
              lastUpdated
                ? `마지막 갱신: ${formatTime(lastUpdated)}`
                : "새로고침"
            }
          >
            {refreshing ? "갱신 중…" : "↻ 새로고침"}
          </button>
        </div>
      </div>
    </section>
  );
}
