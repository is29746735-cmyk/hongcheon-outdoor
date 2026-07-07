import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/auth";
import { db, schema } from "@/db";
import { getPlaceById } from "@/data/places";
import { checkReviewContent } from "@/lib/contentFilter";
import { moderateImage } from "@/lib/moderate-image";
import { rateLimit } from "@/lib/rate-limit";
import type { ExperienceDTO } from "@/lib/experience-actions";

/** 경험담 본문 최대 길이 */
const MAX_BODY_LEN = 500;
/** 첨부 이미지 최대 용량 (클라이언트에서 리사이즈하지만 서버에서도 방어) */
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function err(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

/**
 * POST /api/experience  (multipart/form-data)
 * fields: placeId, body, image(optional File)
 * 경험담 + 사진 등록. 로그인 필수(현장 인증은 없음 — 활동 후 공유용).
 */
export async function POST(req: NextRequest) {
  if (!db)
    return err("지금은 등록할 수 없어요. 잠시 후 다시 시도해 주세요.", 503);

  const session = await auth().catch(() => null);
  const userId = session?.user?.id;
  const userName = session?.user?.name ?? "회원";
  if (!userId) return err("로그인이 필요합니다.", 401);

  // 연타 방어: 1분당 5회
  if (!rateLimit(`experience:${userId}`, 5, 60_000))
    return err("너무 잦은 요청이에요. 잠시 후 다시 시도해 주세요.", 429);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return err("요청 형식이 올바르지 않습니다.");
  }

  const placeId = String(form.get("placeId") ?? "");
  const body = String(form.get("body") ?? "").trim();
  if (!getPlaceById(placeId)) return err("장소를 찾을 수 없습니다.");
  if (!body) return err("내용을 입력해 주세요.");
  if (body.length > MAX_BODY_LEN)
    return err(`내용은 ${MAX_BODY_LEN}자 이내로 작성해 주세요.`);

  const filtered = checkReviewContent(body, userName);
  if (!filtered.ok) return err(filtered.reason ?? "등록할 수 없는 내용이에요.");

  const id = crypto.randomUUID();

  // ── 이미지 업로드(선택) ──
  let imageUrl: string | null = null;
  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/"))
      return err("이미지 파일만 올릴 수 있어요.");
    if (file.size > MAX_IMAGE_BYTES)
      return err("사진 용량이 너무 큽니다. 8MB 이하로 올려 주세요.");

    // 바이트를 한 번만 읽어 AI 검열과 업로드에 재사용
    const bytes = Buffer.from(await file.arrayBuffer());

    // AI 사진 검열 — 부적절(음란·폭력 등) 이미지 차단 (OPENAI_API_KEY 있을 때만 동작)
    const mod = await moderateImage(bytes, file.type);
    if (mod.flagged)
      return err(
        "부적절한 사진으로 판단되어 등록할 수 없어요. 다른 사진을 사용해 주세요.",
      );

    const ext = file.type === "image/png" ? "png" : "jpg";
    try {
      const blob = await put(`experience/${placeId}/${id}.${ext}`, bytes, {
        access: "public",
        contentType: file.type,
      });
      imageUrl = blob.url;
    } catch {
      // BLOB_READ_WRITE_TOKEN 미설정 등
      return err(
        "사진 업로드에 실패했어요. 사진 없이 등록하거나 잠시 후 다시 시도해 주세요.",
        502,
      );
    }
  }

  const now = new Date();
  try {
    await db.insert(schema.experiencePosts).values({
      id,
      placeId,
      userId,
      body,
      imageUrl,
      createdAt: now,
    });
  } catch {
    // 예: experiencePost 테이블 미생성(drizzle-kit push 전)
    return err("지금은 저장할 수 없어요. 잠시 후 다시 시도해 주세요.", 503);
  }

  const post: ExperienceDTO = {
    id,
    name: userName,
    body,
    imageUrl,
    createdAt: now.getTime(),
    mine: true,
  };
  return NextResponse.json({ ok: true, post });
}
