"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";
import { getPlaceById } from "@/data/places";
import { checkReviewContent } from "@/lib/contentFilter";
import { rateLimit } from "@/lib/rate-limit";

/** 한줄평 최대 길이 (서버 강제 — 클라이언트 maxLength는 우회 가능) */
const MAX_CONTENT_LEN = 100;

export type ReviewDTO = {
  id: string;
  name: string;
  rating: number;
  content: string;
  /** epoch ms (직렬화용) */
  createdAt: number;
  updatedAt: number | null;
  /** 현재 로그인 사용자의 리뷰인지 */
  mine: boolean;
};

export type ReviewLoad = {
  loggedIn: boolean;
  myReviewId: string | null;
  reviews: ReviewDTO[];
};

export type ReviewResult = {
  ok: boolean;
  error?: string;
  review?: ReviewDTO;
};

/** 현장 인증 허용 반경(m) · 위치 정확도 한계(m) — 기존 정책 유지 */
const MAX_DISTANCE_M = 1000;
const ACCURACY_LIMIT_M = 500;

function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${Math.round(m)}m`;
}

/** 장소의 리뷰 목록 + 현재 사용자 상태(로그인/내 리뷰) */
export async function loadReviews(placeId: string): Promise<ReviewLoad> {
  // DB 미설정/장애 시 빈 목록으로 안전하게 폴백 (상세 페이지가 죽지 않도록)
  if (!db) return { loggedIn: false, myReviewId: null, reviews: [] };

  const session = await auth().catch(() => null);
  const userId = session?.user?.id ?? null;

  const rows = await db
    .select({
      id: schema.reviews.id,
      userId: schema.reviews.userId,
      rating: schema.reviews.rating,
      content: schema.reviews.content,
      createdAt: schema.reviews.createdAt,
      updatedAt: schema.reviews.updatedAt,
      name: schema.users.name,
    })
    .from(schema.reviews)
    .innerJoin(schema.users, eq(schema.reviews.userId, schema.users.id))
    .where(eq(schema.reviews.placeId, placeId))
    .orderBy(desc(schema.reviews.createdAt));

  let myReviewId: string | null = null;
  const reviews: ReviewDTO[] = rows.map((r) => {
    const mine = userId != null && r.userId === userId;
    if (mine) myReviewId = r.id;
    return {
      id: r.id,
      name: r.name ?? "회원",
      rating: r.rating,
      content: r.content,
      createdAt: r.createdAt.getTime(),
      updatedAt: r.updatedAt ? r.updatedAt.getTime() : null,
      mine,
    };
  });

  return { loggedIn: userId != null, myReviewId, reviews };
}

/** 리뷰 등록 — 로그인 필수, 1인1리뷰, 욕설필터, 현장(GPS) 거리 서버 검증 */
export async function createReview(
  placeId: string,
  rating: number,
  content: string,
  coords: { lat: number; lng: number; accuracy: number },
): Promise<ReviewResult> {
  if (!db) return { ok: false, error: "현재 리뷰를 저장할 수 없어요. 잠시 후 다시 시도해 주세요." };
  const session = await auth().catch(() => null);
  const userId = session?.user?.id;
  const userName = session?.user?.name ?? "회원";
  if (!userId) return { ok: false, error: "로그인이 필요합니다." };

  // 연타 방어: 1분당 5회
  if (!rateLimit(`review:${userId}`, 5, 60_000))
    return { ok: false, error: "너무 잦은 요청이에요. 잠시 후 다시 시도해 주세요." };

  const text = content.trim();
  if (!text || rating < 1 || rating > 5)
    return { ok: false, error: "별점과 한줄평을 확인해주세요." };
  if (text.length > MAX_CONTENT_LEN)
    return { ok: false, error: `한줄평은 ${MAX_CONTENT_LEN}자 이내로 작성해 주세요.` };

  const existing = await db
    .select({ id: schema.reviews.id })
    .from(schema.reviews)
    .where(
      and(
        eq(schema.reviews.placeId, placeId),
        eq(schema.reviews.userId, userId),
      ),
    )
    .limit(1);
  if (existing.length > 0)
    return { ok: false, error: "이미 이 장소에 리뷰를 남기셨습니다. (1인 1리뷰)" };

  const filtered = checkReviewContent(text, userName);
  if (!filtered.ok)
    return { ok: false, error: filtered.reason ?? "등록할 수 없는 내용이에요." };

  const place = getPlaceById(placeId);
  if (!place?.location)
    return {
      ok: false,
      error: "이 장소는 위치 정보가 없어 현장 인증을 할 수 없어 등록이 제한됩니다.",
    };
  if (coords.accuracy > ACCURACY_LIMIT_M)
    return {
      ok: false,
      error: `정확한 GPS 위치를 가져오지 못했어요(오차 약 ${fmtDist(coords.accuracy)}). 실외에서 GPS를 켜고 다시 시도해 주세요.`,
    };
  const dist = distanceMeters(
    coords.lat,
    coords.lng,
    place.location.lat,
    place.location.lng,
  );
  if (dist > MAX_DISTANCE_M)
    return {
      ok: false,
      error: `리뷰는 현장에서만 작성할 수 있어요. 지금 스팟에서 약 ${fmtDist(dist)} 떨어져 있습니다.`,
    };

  const id = crypto.randomUUID();
  const now = new Date();
  await db.insert(schema.reviews).values({
    id,
    placeId,
    userId,
    rating,
    content: text,
    createdAt: now,
  });
  revalidatePath(`/spots/${placeId}`);

  return {
    ok: true,
    review: {
      id,
      name: userName,
      rating,
      content: text,
      createdAt: now.getTime(),
      updatedAt: null,
      mine: true,
    },
  };
}

/** 리뷰 수정 — 본인 리뷰만, 욕설필터(위치 인증 없음, 기존 정책) */
export async function updateReview(
  reviewId: string,
  rating: number,
  content: string,
): Promise<ReviewResult> {
  if (!db) return { ok: false, error: "현재 리뷰를 수정할 수 없어요. 잠시 후 다시 시도해 주세요." };
  const session = await auth().catch(() => null);
  const userId = session?.user?.id;
  const userName = session?.user?.name ?? "회원";
  if (!userId) return { ok: false, error: "로그인이 필요합니다." };

  // 연타 방어: 1분당 5회
  if (!rateLimit(`review-edit:${userId}`, 5, 60_000))
    return { ok: false, error: "너무 잦은 요청이에요. 잠시 후 다시 시도해 주세요." };

  const text = content.trim();
  if (!text || rating < 1 || rating > 5)
    return { ok: false, error: "별점과 한줄평을 확인해주세요." };
  if (text.length > MAX_CONTENT_LEN)
    return { ok: false, error: `한줄평은 ${MAX_CONTENT_LEN}자 이내로 작성해 주세요.` };

  const rows = await db
    .select({
      userId: schema.reviews.userId,
      placeId: schema.reviews.placeId,
      createdAt: schema.reviews.createdAt,
    })
    .from(schema.reviews)
    .where(eq(schema.reviews.id, reviewId))
    .limit(1);
  const row = rows[0];
  if (!row) return { ok: false, error: "리뷰를 찾을 수 없습니다." };
  if (row.userId !== userId)
    return { ok: false, error: "본인 리뷰만 수정할 수 있습니다." };

  const filtered = checkReviewContent(text, userName);
  if (!filtered.ok)
    return { ok: false, error: filtered.reason ?? "등록할 수 없는 내용이에요." };

  const now = new Date();
  await db
    .update(schema.reviews)
    .set({ rating, content: text, updatedAt: now })
    .where(eq(schema.reviews.id, reviewId));
  revalidatePath(`/spots/${row.placeId}`);

  return {
    ok: true,
    review: {
      id: reviewId,
      name: userName,
      rating,
      content: text,
      createdAt: row.createdAt.getTime(),
      updatedAt: now.getTime(),
      mine: true,
    },
  };
}
