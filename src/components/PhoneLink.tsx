"use client";

import { Phone } from "lucide-react";
import { trackListingEvent } from "@/lib/listing-events";
import { getSessionId } from "@/lib/session-id";

/**
 * 전화번호를 tel: 링크로 노출하고 클릭(통화 시도)을 phone_click 이벤트로 집계한다.
 * 모바일에서는 바로 통화 연결, 데스크톱에서는 기본 전화 앱으로 전달된다.
 * className·iconClassName으로 위치별 스타일을 주입할 수 있다.
 */
export default function PhoneLink({
  placeId,
  phone,
  className = "inline-flex items-center gap-1.5 text-neutral-900 transition-colors hover:text-forest-600",
  iconClassName = "h-4 w-4 text-forest-500",
}: {
  placeId: string;
  phone: string;
  className?: string;
  iconClassName?: string;
}) {
  const tel = `tel:${phone.replace(/[^0-9+]/g, "")}`;
  return (
    <a
      href={tel}
      onClick={() =>
        trackListingEvent(placeId, "phone_click", { sessionId: getSessionId() })
      }
      aria-label={`전화 걸기 ${phone}`}
      className={className}
    >
      <Phone className={iconClassName} strokeWidth={2.2} />
      {phone}
    </a>
  );
}
