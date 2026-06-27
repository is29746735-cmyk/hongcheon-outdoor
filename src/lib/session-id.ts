/**
 * 익명 세션 식별자 — 리스팅 이벤트(노출·클릭) 집계용.
 * 로그인과 무관하게 같은 브라우저 세션을 묶기 위한 용도이며 sessionStorage에만 보관한다.
 * (개인 식별 정보 아님 · 탭/세션 종료 시 소멸)
 */
export function getSessionId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const existing = sessionStorage.getItem("hco_sid");
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem("hco_sid", id);
    return id;
  } catch {
    // 프라이빗 모드 등 sessionStorage 접근 불가 시 집계만 건너뛴다
    return undefined;
  }
}
