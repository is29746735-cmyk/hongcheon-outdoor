"use client";

import { useEffect } from "react";
import { trackListingEvent } from "@/lib/listing-events";

interface Props {
  placeId: string;
  referrer?: "home" | "search" | "saved" | "direct";
}

/** 상세 페이지 진입 시 click 이벤트 기록 */
export default function SpotTracker({ placeId, referrer = "direct" }: Props) {
  useEffect(() => {
    const sessionId =
      sessionStorage.getItem("hco_sid") ??
      (() => {
        const id = crypto.randomUUID();
        sessionStorage.setItem("hco_sid", id);
        return id;
      })();
    trackListingEvent(placeId, "click", { sessionId, referrer });
  }, [placeId, referrer]);

  return null;
}
