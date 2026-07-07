/**
 * OpenAI Moderation(omni-moderation-latest, 무료)으로 업로드 이미지의 부적절성 검사.
 *
 * 이미지 카테고리: sexual, violence, violence/graphic, self-harm(+intent/instructions).
 * 정책:
 *  - OPENAI_API_KEY 미설정 → 검사 생략(통과). 키를 넣기 전엔 기능이 그대로 동작.
 *  - API 오류·타임아웃 → 통과(fail-open). 일시 장애로 정상 사용자의 업로드를 막지 않는다.
 *  - flagged=true → 차단(reason에 걸린 카테고리).
 * (서버 전용 — 라우트 핸들러에서만 import)
 */
export type ModerationResult = { flagged: boolean; reason?: string };

interface ModerationResponse {
  results?: Array<{
    flagged?: boolean;
    categories?: Record<string, boolean>;
  }>;
}

export async function moderateImage(
  bytes: Buffer,
  contentType: string,
): Promise<ModerationResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { flagged: false }; // 키 없으면 검사 생략

  try {
    const dataUrl = `data:${contentType};base64,${bytes.toString("base64")}`;
    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "omni-moderation-latest",
        input: [{ type: "image_url", image_url: { url: dataUrl } }],
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn("[moderateImage] moderation API 오류:", res.status);
      return { flagged: false }; // fail-open
    }

    const json = (await res.json()) as ModerationResponse;
    const result = json.results?.[0];
    if (result?.flagged) {
      const cats = Object.entries(result.categories ?? {})
        .filter(([, on]) => on)
        .map(([k]) => k)
        .join(", ");
      console.warn("[moderateImage] flagged:", cats);
      return { flagged: true, reason: cats };
    }
    return { flagged: false };
  } catch (e) {
    console.warn("[moderateImage] 실패(통과 처리):", e);
    return { flagged: false }; // fail-open
  }
}
