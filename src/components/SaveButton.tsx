"use client";

import { useEffect, useState, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { getSaveState, toggleSave } from "@/lib/saved-actions";

/**
 * 장소 저장(북마크) 버튼.
 * - 로그인 상태면 토글(서버 액션 → DB).
 * - 비로그인이면 전역 이벤트로 헤더 로그인 모달을 띄워 로그인 유도.
 * 정적 페이지의 클라이언트 섬: 마운트 시 저장 상태를 비동기로 가져온다.
 *
 * 문구는 **누르면 무슨 일이 생기는지**를 그대로 적는다 —
 * 비로그인 상태에서 "장소 저장"이라고만 쓰면 눌렀을 때 로그인 창이 뜨는 게 예상 밖이 된다.
 *
 * variant:
 * - `block`   상세 페이지 사이드바용 전체폭 버튼(기본)
 * - `compact` 슬라이드오버 헤더처럼 좁은 자리에 들어가는 인라인 알약
 */
export default function SaveButton({
  placeId,
  variant = "block",
}: {
  placeId: string;
  variant?: "block" | "compact";
}) {
  const [state, setState] = useState<{ loggedIn: boolean; saved: boolean }>({
    loggedIn: false,
    saved: false,
  });
  const [ready, setReady] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    getSaveState(placeId)
      .then((s) => {
        if (active) setState(s);
      })
      .catch(() => {
        // 상태 조회 실패 시 비로그인 기본값 유지
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [placeId]);

  const onClick = () => {
    if (!state.loggedIn) {
      window.dispatchEvent(new Event("hco:open-login"));
      return;
    }
    startTransition(async () => {
      setState(await toggleSave(placeId));
    });
  };

  const { loggedIn, saved } = state;
  const label = saved
    ? "저장됨"
    : loggedIn
    ? "장소 저장하기"
    : "로그인하고 저장하기";

  const compact = variant === "compact";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending || !ready}
      aria-pressed={saved}
      aria-label={saved ? "저장 해제" : label}
      title={label}
      className={
        compact
          ? `inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-sm px-3 text-xs font-bold transition disabled:opacity-50 ${
              saved
                ? "bg-forest-600 text-white hover:bg-forest-700"
                : "bg-white text-forest-700 ring-1 ring-forest-300 hover:bg-forest-50"
            }`
          : `inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-sm px-4 text-sm font-bold transition disabled:opacity-50 ${
              saved
                ? "bg-forest-600 text-white hover:bg-forest-700"
                : "bg-white text-neutral-700 ring-1 ring-neutral-300 hover:bg-neutral-50"
            }`
      }
    >
      {saved ? (
        <BookmarkCheck className="h-4 w-4 shrink-0" strokeWidth={2.2} />
      ) : (
        <Bookmark className="h-4 w-4 shrink-0" strokeWidth={2.2} />
      )}
      {label}
    </button>
  );
}
