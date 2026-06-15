/**
 * 리뷰 욕설·스팸 자동 필터 (기본형, 확장 가능).
 * 클라이언트 1차 차단용 — 실제 운영에서는 서버에서도 동일 검증을 해야 한다.
 * 동음이의 오탐(예: "병 신청", "고기 씹다")을 피하려고 띄어쓰기를 유지한
 * 원문 검사 + 우회(띄어쓰기/특수문자) 차단용 압축 검사를 함께 쓴다.
 */

export interface FilterResult {
  ok: boolean;
  reason?: string;
}

const PROFANITY_MSG = "부적절한 표현(욕설)이 포함되어 있어 등록할 수 없어요.";

/** 띄어쓰기·특수문자 우회를 막기 위한 압축 정규화 */
function compact(s: string): string {
  return s.replace(/[\s.,_\-*~|/\\()[\]{}<>!@#$%^&+=:;?'"`·ㆍ]/g, "");
}

/** 원문(띄어쓰기 유지)에서 차단 — 오탐 방지를 위해 명백한 표현만 */
const BANNED: string[] = [
  "씨발", "시발", "씨바", "씨팔", "시팔", "씨불", "쓰발",
  "개새끼", "개색기", "개세끼", "개쉐이", "개자식",
  "병신", "븅신", "빙신",
  "지랄", "지롤",
  "좆", "좆같", "조까", "좆까", "존나",
  "닥쳐", "닥치고",
  "미친놈", "미친년", "미친새끼", "또라이",
  "쌍놈", "쌍년", "느금마", "니애미", "니애비",
  "엿먹어", "후레자식", "창녀", "걸레년",
  "fuck", "fuxk", "shit", "bitch", "asshole", "cunt", "dickhead",
];

/** 압축본에서도 차단(띄어쓰기 우회 대비) — 압축 시 오탐이 없는 표현만 */
const BANNED_EVASION: string[] = [
  "씨발", "시발", "씨팔", "개새끼", "지랄", "좆같",
  "fuck", "shit", "bitch",
  "ㅅㅂ", "ㅄ", "ㅂㅅ", "ㅈㄹ",
];

export function checkReviewContent(
  content: string,
  nickname = ""
): FilterResult {
  const text = `${nickname} ${content}`.toLowerCase();

  for (const w of BANNED) {
    if (text.includes(w)) return { ok: false, reason: PROFANITY_MSG };
  }
  const packed = compact(text);
  for (const w of BANNED_EVASION) {
    if (packed.includes(w)) return { ok: false, reason: PROFANITY_MSG };
  }

  // 링크 스팸
  if (
    /(https?:\/\/|www\.|\.com|\.net|\.shop|\.io|\.co\.kr|\.gg|t\.me|bit\.ly)/i.test(
      content
    )
  ) {
    return { ok: false, reason: "링크는 등록할 수 없어요." };
  }
  // 연락처 스팸
  if (/01[0-9][\s.-]?\d{3,4}[\s.-]?\d{4}/.test(content)) {
    return { ok: false, reason: "연락처(전화번호)는 등록할 수 없어요." };
  }
  // 같은 문자 과도 반복(도배)
  if (/(.)\1{9,}/.test(content)) {
    return { ok: false, reason: "같은 문자를 너무 많이 반복했어요." };
  }

  return { ok: true };
}
