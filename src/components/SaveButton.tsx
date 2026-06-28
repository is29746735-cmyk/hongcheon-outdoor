"use client";

import { useEffect, useState, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { getSaveState, toggleSave } from "@/lib/saved-actions";

/**
 * 장소 저장(북마크) 버튼 — 상세 페이지용.
 * - 로그인 상태면 토글(서버 액션 → DB).
 * - 비로그인이면 전역 이벤트로 헤더 로그인 모달을 띄워 로그인 유도.
 * 정적 페이지의 클라이언트 섬: 마운트 시 저장 상태를 비동기로 가져온다.
 */
export default function SaveButton({ placeId }: { placeId: string }) {
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

  const saved = state.saved;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending || !ready}
      aria-pressed={saved}
      aria-label={saved ? "저장 해제" : "이 장소 저장"}
      className={`inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold transition disabled:opacity-50 ${
        saved
          ? "bg-forest-600 text-white hover:bg-forest-700"
          : "bg-white text-neutral-700 ring-1 ring-neutral-300 hover:bg-neutral-50"
      }`}
    >
      {saved ? (
        <>
          <BookmarkCheck className="h-4 w-4" strokeWidth={2.2} />
          저장됨
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" strokeWidth={2.2} />이 장소 저장
        </>
      )}
    </button>
  );
}
