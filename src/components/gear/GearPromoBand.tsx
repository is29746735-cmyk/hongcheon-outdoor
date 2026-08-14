import Link from "next/link";
import { Tent, Fish, Sparkles, Utensils, ArrowRight } from "lucide-react";

/**
 * 용품 진입 배너 — 커머스 진입점(그레이-그린 박스 + 오렌지 강조).
 *
 * 원래 홈 맨 아래에 있었고, 장소 카드 격자 사이에는 인피드 용품 카드가 한 장 끼어 있었다.
 * 2026-07-25 사용자 판단으로 그 인피드 카드를 없애고 이 배너를 **연계 추천과 장소 목록
 * 사이**로 옮겼다 — 목록(장소 카드) 흐름을 끊지 않으면서 눈에는 들어오는 자리.
 * (구매 유도가 열람을 방해하지 않는다는 기존 원칙과도 맞다)
 */

/** 홈 → 용품 진입용 카테고리 바로가기 */
const GEAR_CATS = [
  { key: "camping", label: "캠핑용품", Icon: Tent },
  { key: "fishing", label: "낚시용품", Icon: Fish },
  { key: "aesthetic", label: "감성 아이템", Icon: Sparkles },
  { key: "food", label: "먹거리", Icon: Utensils },
] as const;

export default function GearPromoBand({
  className = "",
}: {
  className?: string;
}) {
  return (
    <section className={className} aria-label="용품 준비하기">
      <div className="relative overflow-hidden rounded-sm bg-moss-700 p-6 text-white sm:p-8">
        {/* 등고선/그리드 시그니처(옅게) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent 0 33px,#fff 33px 34px),repeating-linear-gradient(90deg,transparent 0 33px,#fff 33px 34px)",
          }}
        />
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-sm bg-ember-500/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.12em] text-white/60">
              <ShoppingBagGlyph />
              준비물 · 쿠팡 최저가
            </span>
            <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-[1.7rem]">
              떠나기 전, 용품 준비하기
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
              캠핑·낚시 필수품부터 감성 아이템·먹거리까지. 품목별 구매 팁과 실사용
              주의사항을 함께 정리했어요.
            </p>
          </div>
          {/* CTA는 ember-600 — 500(#e8552b)은 흰 15px 텍스트와 3.64:1로 AA 미달, 600은 4.9:1 */}
          <Link
            href="/gear"
            className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-sm bg-ember-600 px-5 text-sm font-bold text-white transition-colors hover:bg-ember-700"
          >
            용품 전체 보기
            <ArrowRight size={16} strokeWidth={2.4} />
          </Link>
        </div>
        <div className="relative mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {GEAR_CATS.map(({ key, label, Icon }) => (
            <Link
              key={key}
              href={`/gear#${key}`}
              className="group flex min-h-[44px] items-center gap-2.5 rounded-sm border border-white/10 bg-white/[0.06] px-4 py-3.5 transition-colors hover:border-ember-400/60 hover:bg-white/[0.1]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-white/10 text-white transition-colors group-hover:bg-ember-600 group-hover:text-white">
                <Icon size={18} strokeWidth={2} />
              </span>
              <span className="text-sm font-bold text-white">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 인라인 쇼핑백 글리프 (배지용 — lucide 대신 작은 커스텀) */
function ShoppingBagGlyph() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
