"use client";

import { useEffect } from "react";
import { trackListingEvent } from "@/lib/listing-events";
import { getSessionId } from "@/lib/session-id";

interface Props {
  placeId: string;
  referrer?: "home" | "search" | "saved" | "direct";
}

/** 상세 페이지 진입 시 click 이벤트 기록 */
export default function SpotTracker({ placeId, referrer = "direct" }: Props) {
  useEffect(() => {
    trackListingEvent(placeId, "click", { sessionId: getSessionId(), referrer });
  }, [placeId, referrer]);

  return null;
}
