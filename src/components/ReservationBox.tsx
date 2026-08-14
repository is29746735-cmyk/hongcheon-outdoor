import { CalendarDays, Lock } from "lucide-react";
import type { Place } from "@/types/place";
import PhoneLink from "@/components/PhoneLink";

/**
 * 예약 칸. 온라인 예약은 업체 제휴 후 활성화 예정이라 아직 없다.
 *
 * 예전에는 비활성 날짜·인원 폼 + 죽은 "예약하기" 버튼을 미리보기로 보여줬는데,
 * 사이드바 맨 위(모바일에서는 본문보다 위)에서 처음 만나는 인터랙션이
 * 눌리지 않는 버튼인 것은 신뢰 비용이었다(2026-08-14 디자인 리뷰).
 * → 지금 실제로 되는 행동(전화 문의)을 주인공으로 바꾸고,
 *   온라인 예약은 "준비 중" 한 줄로만 정직하게 말한다.
 *
 * 전화번호가 없는 곳(노지 유원지 등)은 원격으로 예약을 잡을 방법 자체가 없으므로
 * 칸을 그리지 않는다 — 소재지·지도는 바로 아래 방문 정보 카드에 있다.
 */
export default function ReservationBox({ place }: { place: Place }) {
  if (!place.phone) return null;

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
        <span className="inline-flex items-center gap-1 rounded-sm bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
          <Lock className="h-3 w-3" strokeWidth={2.2} />
          온라인 준비 중
        </span>
      </div>

      <PhoneLink
        placeId={place.id}
        phone={place.phone}
        className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-forest-600 text-base font-bold text-white transition-colors hover:bg-forest-700"
        iconClassName="h-4 w-4"
      />

      <p className="mt-3 text-center text-xs leading-relaxed text-neutral-600">
        전화로 예약·자리 여부를 확인할 수 있습니다. 온라인 예약 기능은 준비
        중입니다.
      </p>
    </section>
  );
}
