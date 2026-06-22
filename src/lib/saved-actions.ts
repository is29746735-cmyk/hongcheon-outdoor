"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";

export type SaveState = { loggedIn: boolean; saved: boolean };

/** 현재 사용자가 이 장소를 저장했는지 + 로그인 여부 */
export async function getSaveState(placeId: string): Promise<SaveState> {
  const session = await auth().catch(() => null);
  const userId = session?.user?.id;
  if (!userId) return { loggedIn: false, saved: false };
  const rows = await db
    .select({ placeId: schema.savedPlaces.placeId })
    .from(schema.savedPlaces)
    .where(
      and(
        eq(schema.savedPlaces.userId, userId),
        eq(schema.savedPlaces.placeId, placeId),
      ),
    )
    .limit(1);
  return { loggedIn: true, saved: rows.length > 0 };
}

/** 저장 토글. 비로그인 시 loggedIn:false 반환(클라이언트가 로그인 유도). */
export async function toggleSave(placeId: string): Promise<SaveState> {
  const session = await auth().catch(() => null);
  const userId = session?.user?.id;
  if (!userId) return { loggedIn: false, saved: false };

  const existing = await db
    .select({ placeId: schema.savedPlaces.placeId })
    .from(schema.savedPlaces)
    .where(
      and(
        eq(schema.savedPlaces.userId, userId),
        eq(schema.savedPlaces.placeId, placeId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(schema.savedPlaces)
      .where(
        and(
          eq(schema.savedPlaces.userId, userId),
          eq(schema.savedPlaces.placeId, placeId),
        ),
      );
    revalidatePath("/saved");
    return { loggedIn: true, saved: false };
  }

  await db.insert(schema.savedPlaces).values({ userId, placeId });
  revalidatePath("/saved");
  return { loggedIn: true, saved: true };
}
