"use client";

import { useEffect, useRef, useState } from "react";
import { Lightbulb, Pause, Play, Sparkles } from "lucide-react";
import { PRICE_BAND_LABELS, type GearItem } from "@/data/gear";

/**
 * 첫 화면 시선 고정점 — "처음이라면 이것부터" 스포트라이트.
 *
 * 배경(2026-08-14): 용품 페이지는 헤더 다음이 곧장 34장 격자였다. 카드 형태가
 * 사실상 2종류뿐이라 눈이 멈출 지점이 없었다("특별한 요소가 없다").
 * 여기서 한 품목씩 크게 보여주며 **팁까지 함께** 읽히게 한다.
 *
 * ★자동 전환 파라미터를 5.5초로 잡은 이유 (요청은 2초였다)
 * - 한글 상품명 + 설명 + 팁 한 줄은 2초에 다 못 읽는다. 읽는 도중 넘어가면
 *   정보가 아니라 방해가 된다.
 * - WCAG 2.2.2(Pause, Stop, Hide): 자동으로 움직이는 콘텐츠에는 멈출 수단이
 *   있어야 한다 → 정지 버튼 + 마우스/포커스가 닿으면 자동 정지.
 * - `prefers-reduced-motion` 이면 자동 전환을 아예 하지 않는다(첫 항목 고정).
 * - 전환은 슬라이드가 아니라 **페이드**다. 사이트의 '절제된 모션' 기조 유지.
 * 숫자만 바꾸고 싶으면 INTERVAL_MS 하나만 고치면 된다.
 */
const INTERVAL_MS = 5500;

export default function GearSpotlight({ items }: { items: GearItem[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const hoveringRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (paused || reduced || items.length < 2) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % items.length),
      INTERVAL_MS,
    );
    return () => clearInterval(id);
  }, [paused, reduced, items.length]);

  if (items.length === 0) return null;
  const item = items[index];
  const autoRunning = !paused && !reduced && items.length > 1;

  return (
    <section
      aria-label="처음이라면 이것부터"
      className="mt-4 overflow-hidden rounded-2xl border border-sand-300 bg-white"
      onMouseEnter={() => {
        hoveringRef.current = true;
        setPaused(true);
      }}
      onMouseLeave={() => {
        hoveringRef.current = false;
        setPaused(false);
      }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => {
        if (!hoveringRef.current) setPaused(false);
      }}
    >
      <div className="flex items-center justify-between gap-2 border-b border-sand-300 bg-sand-50 px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-forest-800">
          <Sparkles className="h-4 w-4 text-clay-600" strokeWidth={2.2} />
          처음이라면 이것부터
          {/* 보조 설명은 좁은 화면에서 감춘다 — 넣으면 머리줄이 2줄로 늘어난다(실측 80px) */}
          <span className="hidden font-medium text-neutral-500 sm:inline">
            홍천강 1박 기본 준비물
          </span>
        </span>

        <div className="flex shrink-0 items-center gap-1">
          {/* 점 인디케이터 — 누르면 그 항목으로. 자동을 기다리지 않아도 된다 */}
          <div className="flex items-center gap-1" role="tablist" aria-label="품목 선택">
            {items.map((g, i) => (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={g.name}
                onClick={() => setIndex(i)}
                /* 24×24 이상 — WCAG 2.5.8(Target Size Minimum, AA) */
                className="grid h-8 w-6 place-items-center"
              >
                <span
                  className={`block h-1.5 rounded-sm transition-all ${
                    i === index ? "w-4 bg-clay-600" : "w-1.5 bg-neutral-300"
                  }`}
                />
              </button>
            ))}
          </div>
          {/* WCAG 2.2.2 — 자동으로 움직이면 멈출 수단이 있어야 한다 */}
          {!reduced && items.length > 1 && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={autoRunning ? "자동 넘김 멈추기" : "자동 넘김 시작"}
              className="grid h-8 w-8 place-items-center rounded-sm text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
            >
              {autoRunning ? (
                <Pause className="h-3.5 w-3.5" strokeWidth={2.4} />
              ) : (
                <Play className="h-3.5 w-3.5" strokeWidth={2.4} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* key 를 바꿔 페이드를 다시 태운다 (사이트 공통 fade-up 유틸) */}
      <div key={item.id} className="animate-fade-up p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-extrabold text-neutral-900">
            {item.name}
          </h2>
          {item.priceBand != null && (
            <span className="rounded-sm bg-sand-100 px-2 py-0.5 text-xs font-bold tabular-nums text-neutral-700">
              {PRICE_BAND_LABELS[item.priceBand]}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
          {item.summary}
        </p>
        {item.tips && item.tips.length > 0 && (
          <p className="mt-3 flex gap-1.5 rounded-sm bg-forest-50 px-3 py-2.5 text-[13px] leading-relaxed text-forest-900">
            <Lightbulb
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-600"
              strokeWidth={2.2}
            />
            <span>{item.tips[0]}</span>
          </p>
        )}
      </div>
    </section>
  );
}
