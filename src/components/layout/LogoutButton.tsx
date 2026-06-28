"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { signOut } from "next-auth/react";
import { LogOut, UserRound, X } from "lucide-react";
import { useFocusTrap } from "@/lib/useFocusTrap";

/**
 * 헤더 로그아웃 버튼 + 확인 모달.
 * 클릭 시 바로 로그아웃하지 않고 "정말 로그아웃할까요?" 확인을 한 번 받는다.
 * 헤더가 backdrop-blur(고정 컨테이닝 블록)라 모달은 portal로 body에 렌더한다.
 * (LoginDialog 와 동일한 모달 패턴)
 */
export default function LogoutButton({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pending, setPending] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open && mounted, panelRef);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, pending]);

  const confirmLogout = () => {
    setPending(true);
    void signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="hidden items-center gap-1.5 text-sm font-semibold text-forest-700 sm:inline-flex">
        <UserRound className="h-4 w-4" strokeWidth={2} />
        {name}
      </span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-200"
      >
        <LogOut className="h-4 w-4" strokeWidth={2} />
        로그아웃
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-label="로그아웃 확인"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => !pending && setOpen(false)}
            />
            <div
              ref={panelRef}
              className="relative z-10 w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                aria-label="닫기"
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-50"
              >
                <X className="h-4 w-4" strokeWidth={2.2} />
              </button>

              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-neutral-100 text-neutral-600">
                <LogOut className="h-5 w-5" strokeWidth={2} />
              </div>
              <h2 className="mt-4 text-lg font-bold text-neutral-900">
                로그아웃할까요?
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                로그아웃해도 저장한 장소와 리뷰는 그대로 보관돼요. 다시 로그인하면
                이어서 볼 수 있어요.
              </p>

              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="flex-1 rounded-xl bg-neutral-100 px-4 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-200 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={confirmLogout}
                  disabled={pending}
                  className="flex-1 rounded-xl bg-neutral-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-neutral-900 disabled:opacity-60"
                >
                  {pending ? "로그아웃 중…" : "로그아웃"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
