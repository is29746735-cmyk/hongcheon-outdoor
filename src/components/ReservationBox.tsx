import { CalendarDays, Lock } from "lucide-react";
import type { Place } from "@/types/place";
import PhoneLink from "@/components/PhoneLink";

/**
 * 예약 칸 (현재 비작동 — 준비 중 상태).
 * 온라인 예약 기능은 업체 제휴 후 활성화 예정이라, 지금은 의도적으로 동작하지 않습니다.
 * 브랜드 원칙(검증된 사실만·과장 금지)에 따라 "준비 중"임을 명확히 표기하고,
 * 전화번호가 있으면 전화 문의로 안전하게 폴백합니다. (가짜 예약 가능 상태를 만들지 않음)
 */
export default function ReservationBox({ place }: { place: Place }) {
  return (
    <section
      aria-labelledby="reservation-heading"
      className="rounded-3xl border border-neutral-200 bg-white p-6"
    >
      <div className="flex items-center justify-between">
        <h2
          id="reservation-heading"
          className="flex items-center gap-2 text-base font-extrabold text-neutral-900"
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-forest-50 text-forest-700">
            <CalendarDays className="h-4 w-4" strokeWidth={2} />
          </span>
          예약
        </h2>
        <span className="inline-flex items-center gap-1 rounded-sm bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500">
          <Lock className="h-3 w-3" strokeWidth={2.2} />
          준비 중
        </span>
      </div>

      {/* 비작동 미리보기 폼 (입력 불가) */}
      <div className="mt-4 grid grid-cols-2 gap-3" aria-hidden="true">
        <div>
          <span className="block text-xs font-semibold text-neutral-400">
            체크인
          </span>
          <div className="mt-1 cursor-not-allowed select-none rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-300">
            날짜 선택
          </div>
        </div>
        <div>
          <span className="block text-xs font-semibold text-neutral-400">
            체크아웃
          </span>
          <div className="mt-1 cursor-not-allowed select-none rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-300">
            날짜 선택
          </div>
        </div>
      </div>
      <div className="mt-3" aria-hidden="true">
        <span className="block text-xs font-semibold text-neutral-400">인원</span>
        <div className="mt-1 cursor-not-allowed select-none rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-300">
          인원 선택
        </div>
      </div>

      <button
        type="button"
        disabled
        aria-disabled="true"
        className="mt-4 w-full cursor-not-allowed rounded-2xl bg-forest-600/40 py-3.5 text-base font-bold text-white"
      >
        예약하기
      </button>

      <p className="mt-3 text-center text-xs leading-relaxed text-neutral-500">
        온라인 예약 기능을 준비 중입니다.
        {place.phone ? (
          <>
            {" "}
            지금은 전화로 문의해 주세요.{" "}
            <PhoneLink
              placeId={place.id}
              phone={place.phone}
              className="inline-flex items-center gap-1 font-semibold text-forest-700 underline underline-offset-2"
              iconClassName="h-3 w-3"
            />
          </>
        ) : (
          <> 운영 여부와 예약은 방문 전 확인해 주세요.</>
        )}
      </p>
    </section>
  );
}
