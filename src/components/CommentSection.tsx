"use client";

import { useState, type FormEvent } from "react";
import { Star, MessageSquare, Send, UserRound } from "lucide-react";

interface Review {
  id: string;
  nickname: string;
  /** 별점 1~5 */
  rating: number;
  content: string;
  /** 작성 시각 (ISO) */
  createdAt: string;
}

interface CommentSectionProps {
  /** 스팟 식별자 (리뷰를 스팟별로 구분 — 추후 실제 API 연동 시 사용) */
  placeId: string;
}

/** 읽기 전용 별점 표시 */
function StarRow({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-label={`별점 ${value}점`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${
            n <= value ? "fill-amber-400 text-amber-400" : "text-neutral-300"
          }`}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * 스팟 상세 하단의 이용자 리뷰 섹션.
 * 닉네임 · 별점(1~5) · 한줄평을 입력하고 [등록]하면 화면에 즉시 추가된다.
 *
 * ⚠️ 데모용 모의 로직: 리뷰는 컴포넌트 로컬 상태(useState)에만 저장되며,
 *    새로고침하면 초기화된다. (백엔드 연동 전 단계)
 */
export default function CommentSection({ placeId }: CommentSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [nickname, setNickname] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");

  const canSubmit = nickname.trim().length > 0 && content.trim().length > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const review: Review = {
      id: newId(),
      nickname: nickname.trim(),
      rating,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [review, ...prev]); // 최신 리뷰가 위로
    setNickname("");
    setContent("");
    setRating(5);
    setHover(0);
  };

  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <section className="mt-8" aria-label="이용자 리뷰" data-place-id={placeId}>
      <h2 className="flex items-center gap-2 text-base font-extrabold text-neutral-900">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-forest-50 text-forest-700">
          <MessageSquare className="h-4 w-4" strokeWidth={2} />
        </span>
        이용자 리뷰
        <span className="rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-bold text-forest-600">
          {reviews.length}
        </span>
        {reviews.length > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 text-sm font-bold text-amber-500">
            <Star
              className="h-4 w-4 fill-amber-400 text-amber-400"
              strokeWidth={1.5}
            />
            {avg.toFixed(1)}
          </span>
        )}
      </h2>

      {/* 작성 폼 */}
      <form
        onSubmit={handleSubmit}
        className="mt-4 rounded-3xl border border-neutral-200 bg-white p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임"
            aria-label="닉네임"
            maxLength={20}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-forest-500 focus:ring-2 focus:ring-forest-100 sm:w-40"
          />

          {/* 별점 선택 */}
          <div
            className="flex items-center gap-0.5"
            role="radiogroup"
            aria-label="별점 선택"
            onMouseLeave={() => setHover(0)}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n}점`}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                className="p-0.5"
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    n <= (hover || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-neutral-300"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
            ))}
            <span className="ml-1 text-sm font-semibold text-neutral-500">
              {rating}점
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="한줄평을 남겨주세요 (예: 강 바로 앞이라 낚시하기 좋았어요!)"
            aria-label="한줄평"
            maxLength={100}
            className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-forest-500 focus:ring-2 focus:ring-forest-100"
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-forest-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" strokeWidth={2.2} />
            등록
          </button>
        </div>
      </form>

      {/* 리뷰 목록 */}
      {reviews.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-neutral-200 bg-sand-50 px-4 py-8 text-center text-sm text-neutral-400">
          아직 등록된 리뷰가 없어요. 첫 리뷰를 남겨보세요!
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sand-100 text-forest-700">
                  <UserRound className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="text-sm font-bold text-neutral-800">
                  {r.nickname}
                </span>
                <StarRow value={r.rating} />
                <span className="ml-auto shrink-0 text-xs text-neutral-400">
                  {formatDate(r.createdAt)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-neutral-700">
                {r.content}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-2 text-[11px] text-neutral-400">
        * 데모용 리뷰입니다. 현재는 이 화면(브라우저)에만 저장되며 새로고침하면
        초기화됩니다.
      </p>
    </section>
  );
}
