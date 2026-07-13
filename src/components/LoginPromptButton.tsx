"use client";

import { LogIn } from "lucide-react";

/** 비로그인 화면(저장 페이지 등)에서 헤더 로그인 모달을 띄우는 CTA 버튼. */
export default function LoginPromptButton({
  label = "로그인하고 저장 시작",
}: {
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("hco:open-login"))}
      className="inline-flex items-center gap-1.5 rounded-sm bg-forest-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-forest-700"
    >
      <LogIn className="h-4 w-4" strokeWidth={2.2} />
      {label}
    </button>
  );
}
