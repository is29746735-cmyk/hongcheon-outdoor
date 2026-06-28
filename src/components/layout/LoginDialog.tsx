"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { signIn } from "next-auth/react";
import { LogIn, X } from "lucide-react";
import { useFocusTrap } from "@/lib/useFocusTrap";

type Props = {
  kakao: boolean;
  google: boolean;
  naver: boolean;
};

/** provider 브랜드 로고 (인라인 SVG) */
function KakaoMark() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.88 5.33 4.7 6.74-.16.55-.86 2.97-.88 3.16 0 0-.02.16.08.22.1.06.22.01.22.01.28-.04 3.2-2.1 3.7-2.46.69.1 1.42.16 2.18.16 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
    </svg>
  );
}
function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.87z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3.01c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.27a12 12 0 0 0 0 10.74l4-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.27 6.63l4 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}
function NaverMark() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
      <path d="M16.27 12.85 7.53 0H0v24h7.73V11.15L16.47 24H24V0h-7.73z" />
    </svg>
  );
}

/**
 * 헤더의 단일 "로그인" 버튼 → 클릭 시 소셜 제공자 선택 시트.
 * 켜진 provider(auth.ts의 enabledProviders)만 버튼으로 노출한다.
 * 헤더가 backdrop-blur(고정 컨테이닝 블록)라서 모달은 portal로 body에 렌더한다.
 */
export default function LoginDialog({ kakao, google, naver }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open && mounted, panelRef);

  useEffect(() => {
    setMounted(true);
    // 다른 컴포넌트(저장 버튼·저장 페이지 등)에서 로그인 유도 시 모달을 연다.
    const openLogin = () => setOpen(true);
    window.addEventListener("hco:open-login", openLogin);
    return () => window.removeEventListener("hco:open-login", openLogin);
  }, []);

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

  // 로그인 후 현재 보던 페이지로 복귀 (저장 페이지/상세에서 로그인 유도 시 자연스럽게)
  const go = (provider: string) =>
    signIn(provider, { callbackUrl: window.location.href });

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
            <div
              ref={panelRef}
              className="relative z-10 w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
            >
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
                    <KakaoMark />
                    카카오로 시작하기
                  </button>
                )}
                {google && (
                  <button
                    type="button"
                    onClick={() => go("google")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50"
                  >
                    <GoogleMark />
                    구글로 시작하기
                  </button>
                )}
                {naver && (
                  <button
                    type="button"
                    onClick={() => go("naver")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#03C75A] px-4 py-3 text-sm font-bold text-white transition hover:brightness-95"
                  >
                    <NaverMark />
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
