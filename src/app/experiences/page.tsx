import type { Metadata } from "next";
import { Camera } from "lucide-react";
import ExperienceFeed from "@/components/ExperienceFeed";

export const metadata: Metadata = {
  title: "경험담 · 사진",
  description:
    "홍천강 캠핑·낚시·차박을 다녀온 방문자들이 남긴 사진과 후기를 한곳에서. 실제 방문자의 생생한 경험을 확인해 보세요.",
  alternates: { canonical: "/experiences" },
};

export default function ExperiencesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* ── 커뮤니티 헤더 — river(강물/사람) 톤 + 등고선 시그니처 ── */}
      <header className="relative overflow-hidden rounded-3xl border border-river-100 bg-gradient-to-br from-river-50 to-forest-50 p-6 sm:p-8">
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full text-river-300 opacity-[0.18]"
          viewBox="0 0 1200 320"
          preserveAspectRatio="none"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M-20 90 C 250 50, 500 130, 760 80 S 1180 60, 1230 100" />
          <path d="M-20 160 C 280 120, 520 200, 780 150 S 1180 130, 1230 170" />
          <path d="M-20 230 C 240 190, 540 270, 800 220 S 1180 210, 1230 240" />
        </svg>
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-river-100/50 blur-2xl" />

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-river-500 px-2.5 py-1 text-xs font-bold text-white">
            <Camera className="h-3.5 w-3.5" strokeWidth={2.4} />
            방문자 커뮤니티
          </span>
          <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-forest-900 sm:text-[1.9rem]">
            경험담 · 사진 모아보기
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-600">
            홍천강을 다녀온 분들이 남긴 사진과 후기입니다. 사진을 누르면 해당
            장소로 이동해요. 경험담 작성은 각 장소 상세 페이지에서 할 수
            있습니다.
          </p>
        </div>
      </header>

      <ExperienceFeed />
    </main>
  );
}
