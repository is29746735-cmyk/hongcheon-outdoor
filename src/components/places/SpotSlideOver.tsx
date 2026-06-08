"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  X,
  Toilet,
  CookingPot,
  CalendarRange,
  Check,
  CircleCheck,
  Lightbulb,
  CarFront,
  MapPin,
  ArrowRight,
  Fish,
} from "lucide-react";
import type { Place } from "@/types/place";
import { CATEGORY_LABELS } from "@/constants";
import { getSpotDetail } from "@/data/mockData";
import PlaceImage from "@/components/PlaceImage";
import MapLinkButtons from "@/components/MapLinkButtons";

interface SpotSlideOverProps {
  place: Place | null;
  open: boolean;
  onClose: () => void;
}

/** O/X 형태의 빠른 정보 항목 */
function QuickFact({
  icon,
  label,
  value,
  ok,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-sand-50 px-2 py-3 text-center">
      <span
        className={`grid h-8 w-8 place-items-center rounded-xl ${
          ok === false
            ? "bg-neutral-100 text-neutral-400"
            : "bg-forest-50 text-forest-700"
        }`}
      >
        {icon}
      </span>
      <span className="text-[11px] font-medium text-neutral-400">{label}</span>
      <span
        className={`text-sm font-bold ${
          ok === false ? "text-neutral-400" : "text-forest-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * 메인 카드 클릭 시 화면 우측에서 슬라이드인되는 상세 보기.
 * Tailwind transition-transform(translate-x)으로 부드럽게 열리고 닫힌다.
 */
export default function SpotSlideOver({
  place,
  open,
  onClose,
}: SpotSlideOverProps) {
  const detail = place ? getSpotDetail(place.id) : undefined;

  // ESC 키로 닫기 + 열렸을 때 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* 배경 딤 */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-forest-900/40 backdrop-blur-[1px] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* 우측 패널 */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={place ? `${place.name} 상세 정보` : "상세 정보"}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-sand-50 shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-neutral-200 bg-white/80 px-5 py-4 backdrop-blur">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-700 px-3 py-1 text-xs font-bold text-white">
            {place ? CATEGORY_LABELS[place.category] : ""}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-forest-700"
          >
            <X className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>

        {/* 본문 (스크롤) */}
        {place && (
          <div className="flex-1 overflow-y-auto px-5 pb-6 pt-5">
            <PlaceImage
              place={place}
              className="aspect-[16/10] w-full rounded-2xl"
              sizes="(max-width: 768px) 100vw, 440px"
            />

            <h2 className="mt-4 font-serif text-2xl font-bold tracking-tight text-forest-800">
              {place.name}
            </h2>
            <p className="mt-1.5 flex items-center gap-1 text-sm text-neutral-500">
              <MapPin className="h-4 w-4 shrink-0 text-forest-500" strokeWidth={2} />
              {place.region}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              {place.summary}
            </p>

            {place.connectedFishing && (
              <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-sky-600 px-2.5 py-1 text-xs font-bold text-white">
                <Fish className="h-3.5 w-3.5" strokeWidth={2.2} />
                캠핑+낚시 연계
              </span>
            )}

            {/* 빠른 정보: 화장실 / 취사 / 추천 시즌 */}
            {detail && (
              <div className="mt-5 grid grid-cols-3 gap-2.5">
                <QuickFact
                  icon={<Toilet className="h-4 w-4" strokeWidth={2} />}
                  label="화장실"
                  value={detail.restroom ? "이용 가능" : "없음"}
                  ok={detail.restroom}
                />
                <QuickFact
                  icon={<CookingPot className="h-4 w-4" strokeWidth={2} />}
                  label="취사"
                  value={detail.cooking ? "가능" : "어려움"}
                  ok={detail.cooking}
                />
                <QuickFact
                  icon={<CalendarRange className="h-4 w-4" strokeWidth={2} />}
                  label="추천 시즌"
                  value={detail.season}
                />
              </div>
            )}

            {/* 현장 편의시설 */}
            {detail && detail.facilities.length > 0 && (
              <section className="mt-6">
                <h3 className="text-sm font-bold text-neutral-800">
                  현장 편의시설
                </h3>
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {detail.facilities.map((fac) => (
                    <li
                      key={fac}
                      className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200"
                    >
                      <CircleCheck
                        className="h-3.5 w-3.5 text-forest-500"
                        strokeWidth={2}
                      />
                      {fac}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 꿀팁 (대표 1~2개) */}
            {detail && detail.tips.length > 0 && (
              <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-amber-800">
                  <Lightbulb className="h-4 w-4" strokeWidth={2} />
                  낚시·캠핑 꿀팁
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {detail.tips.slice(0, 2).map((tip) => (
                    <li
                      key={tip}
                      className="flex gap-1.5 text-xs leading-relaxed text-neutral-700"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" strokeWidth={2.5} />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 진입로 주의 */}
            {detail && detail.accessNote && (
              <section className="mt-4 flex gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <CarFront
                  className="mt-0.5 h-4 w-4 shrink-0 text-rose-500"
                  strokeWidth={2}
                />
                <p className="text-xs leading-relaxed text-neutral-700">
                  <span className="font-bold text-rose-700">진입로 주의 </span>
                  {detail.accessNote}
                </p>
              </section>
            )}

            {/* 지도 앱으로 보기 */}
            <div className="mt-6">
              <MapLinkButtons place={place} />
            </div>
          </div>
        )}

        {/* 하단 고정 CTA */}
        {place && (
          <div className="border-t border-neutral-200 bg-white/80 px-5 py-3.5 backdrop-blur">
            <Link
              href={`/spots/${place.id}`}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-forest-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-800"
            >
              상세 페이지로 더 보기
              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
