"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Fish, MapPin, Trees } from "lucide-react";
import type { Place } from "@/types/place";
import { CATEGORY_LABELS } from "@/constants";
import PlaceImage from "@/components/PlaceImage";
import MapLinkButtons from "@/components/MapLinkButtons";
import { trackListingEvent } from "@/lib/listing-events";
import { getSessionId } from "@/lib/session-id";

type Referrer = "home" | "search" | "saved" | "direct";

/** 같은 세션·페이지 로드 동안 장소별 impression 중복 집계 방지 */
const impressed = new Set<string>();

interface PlaceCardProps {
  place: Place;
  /** 지정 시 카드 클릭이 페이지 이동 대신 이 콜백(슬라이드오버)을 호출 */
  onSelect?: (place: Place) => void;
  /** 지정 시 카드가 뷰포트에 들어오면 impression 이벤트를 1회 기록 */
  impressionReferrer?: Referrer;
}

export default function PlaceCard({
  place,
  onSelect,
  impressionReferrer,
}: PlaceCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // 노출(impression) 집계 — 카드가 절반 이상 보이면 1회만 기록
  useEffect(() => {
    if (!impressionReferrer) return;
    if (impressed.has(place.id)) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !impressed.has(place.id)) {
            impressed.add(place.id);
            trackListingEvent(place.id, "impression", {
              sessionId: getSessionId(),
              referrer: impressionReferrer,
            });
            observer.disconnect();
          }
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [place.id, impressionReferrer]);

  // onSelect 가 있으면 버튼(슬라이드오버), 없으면 상세 페이지 링크
  const Trigger = ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) =>
    onSelect ? (
      <button
        type="button"
        onClick={() => onSelect(place)}
        className={`w-full text-left ${className ?? ""}`}
      >
        {children}
      </button>
    ) : (
      <Link href={`/spots/${place.id}`} className={className}>
        {children}
      </Link>
    );

  return (
    <div
      ref={rootRef}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <Trigger className="relative block">
        <PlaceImage place={place} className="aspect-[4/3]" />
        {/* 하단 그라디언트 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-forest-700 shadow-sm backdrop-blur">
          {CATEGORY_LABELS[place.category]}
        </span>
        {place.connectedFishing && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-sky-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            <Fish className="h-3.5 w-3.5" strokeWidth={2.2} />
            캠핑+낚시
          </span>
        )}
      </Trigger>

      <div className="flex flex-1 flex-col p-4">
        <Trigger className="block">
          <h3 className="text-[15px] font-bold leading-snug text-neutral-900 transition-colors group-hover:text-forest-700">
            {place.name}
            {place.official && (
              <span className="ml-1.5 align-middle rounded bg-forest-50 px-1.5 py-0.5 text-[10px] font-bold text-forest-600">
                공식
              </span>
            )}
          </h3>
        </Trigger>
        <p className="mt-1.5 flex items-center gap-1 text-xs text-neutral-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-forest-500" strokeWidth={2} />
          <span className="truncate">{place.region}</span>
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-600">
          {place.summary}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {place.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-sand-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-auto border-t border-neutral-100 pt-3.5">
          {place.isolationScore != null && (
            <div className="mb-2.5 flex items-center gap-1.5 text-xs">
              <Trees className="h-3.5 w-3.5 shrink-0 text-forest-500" strokeWidth={2} />
              <span className="text-neutral-500">한적함</span>
              <span className="font-bold tabular-nums text-neutral-800">
                {place.isolationScore}
                <span className="font-normal text-neutral-400">/5</span>
              </span>
            </div>
          )}
          <MapLinkButtons place={place} compact referrer={impressionReferrer} />
        </div>
      </div>
    </div>
  );
}
