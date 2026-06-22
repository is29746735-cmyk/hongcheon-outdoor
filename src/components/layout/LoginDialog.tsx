"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { signIn } from "next-auth/react";
import { LogIn, X } from "lucide-react";

type Props = {
  kakao: boolean;
  google: boolean;
  naver: boolean;
};

/**
 * 헤더의 단일 "로그인" 버튼 → 클릭 시 소셜 제공자 선택 시트.
 * 켜진 provider(auth.ts의 enabledProviders)만 버튼으로 노출한다.
 * 헤더가 backdrop-blur(고정 컨테이닝 블록)라서 모달은 portal로 body에 렌더한다.
 */
export default function LoginDialog({ kakao, google, naver }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (provider: string) => signIn(provider, { callbackUrl: "/" });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-forest-600 px-3.5 py-2 text-sm font-bold text-white transition hover:bg-forest-700"
      >
        <LogIn className="h-4 w-4" strokeWidth={2.2} />
        로그인
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-label="로그인"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <div className="relative z-10 w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
              >
                <X className="h-4 w-4" strokeWidth={2.2} />
              </button>

              <h2 className="text-lg font-bold text-neutral-900">로그인</h2>
              <p className="mt-1 text-sm text-neutral-500">
                소셜 계정으로 간편하게 시작하세요.
              </p>

              <div className="mt-5 flex flex-col gap-2.5">
                {kakao && (
                  <button
                    type="button"
                    onClick={() => go("kakao")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-4 py-3 text-sm font-bold text-[#191600] transition hover:brightness-95"
                  >
                    카카오로 시작하기
                  </button>
                )}
                {google && (
                  <button
                    type="button"
                    onClick={() => go("google")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50"
                  >
                    구글로 시작하기
                  </button>
                )}
                {naver && (
                  <button
                    type="button"
                    onClick={() => go("naver")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#03C75A] px-4 py-3 text-sm font-bold text-white transition hover:brightness-95"
                  >
                    네이버로 시작하기
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
