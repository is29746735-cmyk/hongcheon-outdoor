"use server";

import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { auth } from "@/auth";
import { db, schema } from "@/db";

export type ExperienceDTO = {
  id: string;
  name: string;
  body: string;
  imageUrl: string | null;
  /** epoch ms (직렬화용) */
  createdAt: number;
  /** 현재 로그인 사용자의 글인지 */
  mine: boolean;
};

export type ExperienceLoad = {
  loggedIn: boolean;
  posts: ExperienceDTO[];
};

/** 장소의 경험담 목록 + 로그인 여부 */
export async function loadExperiences(placeId: string): Promise<ExperienceLoad> {
  // DB 미설정/장애 시 빈 목록으로 폴백 (상세 페이지가 죽지 않도록)
  if (!db) return { loggedIn: false, posts: [] };

  const session = await auth().catch(() => null);
  const userId = session?.user?.id ?? null;

  const rows = await db
    .select({
      id: schema.experiencePosts.id,
      userId: schema.experiencePosts.userId,
      body: schema.experiencePosts.body,
      imageUrl: schema.experiencePosts.imageUrl,
      createdAt: schema.experiencePosts.createdAt,
      name: schema.users.name,
    })
    .from(schema.experiencePosts)
    .innerJoin(schema.users, eq(schema.experiencePosts.userId, schema.users.id))
    .where(eq(schema.experiencePosts.placeId, placeId))
    .orderBy(desc(schema.experiencePosts.createdAt));

  const posts: ExperienceDTO[] = rows.map((r) => ({
    id: r.id,
    name: r.name ?? "회원",
    body: r.body,
    imageUrl: r.imageUrl,
    createdAt: r.createdAt.getTime(),
    mine: userId != null && r.userId === userId,
  }));

  return { loggedIn: userId != null, posts };
}

/** 경험담 삭제 — 본인 글만. 첨부 사진(Blob)도 함께 삭제 시도. */
export async function deleteExperience(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!db) return { ok: false, error: "지금은 삭제할 수 없어요. 잠시 후 다시 시도해 주세요." };
  const session = await auth().catch(() => null);
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "로그인이 필요합니다." };

  const rows = await db
    .select({
      userId: schema.experiencePosts.userId,
      placeId: schema.experiencePosts.placeId,
      imageUrl: schema.experiencePosts.imageUrl,
    })
    .from(schema.experiencePosts)
    .where(eq(schema.experiencePosts.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return { ok: false, error: "글을 찾을 수 없습니다." };
  if (row.userId !== userId)
    return { ok: false, error: "본인 글만 삭제할 수 있습니다." };

  await db.delete(schema.experiencePosts).where(eq(schema.experiencePosts.id, id));

  // 첨부 사진도 정리(실패해도 삭제 자체는 성공 처리)
  if (row.imageUrl) {
    await del(row.imageUrl).catch(() => {});
  }

  revalidatePath(`/spots/${row.placeId}`);
  return { ok: true };
}
