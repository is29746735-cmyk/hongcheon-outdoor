"use server";

import { db } from "@/db";
import { listingEvents } from "@/db/schema";
import { auth } from "@/auth";

type EventType = "impression" | "click" | "map_click" | "phone_click";
type Referrer = "home" | "search" | "saved" | "direct";

export async function trackListingEvent(
  placeId: string,
  eventType: EventType,
  opts?: { sessionId?: string; referrer?: Referrer }
) {
  if (!db) return;
  try {
    const session = await auth();
    await db.insert(listingEvents).values({
      placeId,
      eventType,
      sessionId: opts?.sessionId ?? null,
      userId: session?.user?.id ?? null,
      referrer: opts?.referrer ?? null,
    });
  } catch {
    // 이벤트 기록 실패는 UX에 영향 주지 않음
  }
}
