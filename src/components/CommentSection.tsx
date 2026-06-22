"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Star,
  MessageSquare,
  Send,
  UserRound,
  MapPin,
  AlertCircle,
  Pencil,
  X,
  LogIn,
} from "lucide-react";
import type { GeoPoint } from "@/types/place";
import {
  loadReviews,
  createReview,
  updateReview,
  type ReviewDTO,
} from "@/lib/review-actions";

interface CommentSectionProps {
  /** 스팟 식별자 (리뷰 저장·1인 1리뷰 판정 키) */
  placeId: string;
  /** 스팟 좌표 — 현장(위치) 인증에 사용. 없으면 등록을 제한한다. */
  location?: GeoPoint;
}

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

function formatDate(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

/** 현재 위치 가져오기 — 캐시 금지(항상 새 측정), 고정밀 요청 */
function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("geolocation-unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}

/**
 * 스팟 상세 하단의 이용자 리뷰 섹션 (DB + 로그인 기반).
 * - 작성·수정은 로그인 필수. 비로그인은 로그인 유도.
 * - 표시 이름은 로그인 계정 이름. userId 기준 1인 1리뷰 + 본인 리뷰 수정.
 * - 현장(GPS) 인증: 작성은 스팟 반경 내에서만(서버 검증), 수정은 위치 무관.
 * - 욕설·스팸 자동 필터(서버).
 * 정적 페이지의 클라이언트 섬: 마운트 시 리뷰·로그인 상태를 서버 액션으로 로드.
 */
export default function CommentSection({
  placeId,
  location,
}: CommentSectionProps) {
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [myReviewId, setMyReviewId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    loadReviews(placeId)
      .then((d) => {
        if (!active) return;
        setReviews(d.reviews);
        setLoggedIn(d.loggedIn);
        setMyReviewId(d.myReviewId);
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, [placeId]);

  const alreadyReviewed = myReviewId !== null;
  const myReview = reviews.find((r) => r.id === myReviewId) ?? null;
  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
  const canSubmit = content.trim().length > 0 && !submitting;

  const resetForm = () => {
    setContent("");
    setRating(5);
    setHover(0);
  };

  // 신규 등록 — 클라이언트 GPS 측정 후 서버에서 거리·1인1리뷰·욕설 검증
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (content.trim().length === 0) return;
    if (!location) {
      setError(
        "이 장소는 위치 정보가 없어 현장 인증을 할 수 없어 등록이 제한됩니다.",
      );
      return;
    }
    setSubmitting(true);
    try {
      const pos = await getCurrentPosition();
      const res = await createReview(placeId, rating, content, {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy ?? Number.MAX_SAFE_INTEGER,
      });
      if (!res.ok || !res.review) {
        setError(res.error ?? "등록에 실패했어요. 잠시 후 다시 시도해 주세요.");
        return;
      }
      setReviews((prev) => [res.review!, ...prev]);
      setMyReviewId(res.review.id);
      resetForm();
    } catch {
      setError(
        "현장 인증을 위해 위치 권한이 필요해요. 위치 권한을 허용한 뒤 다시 시도해 주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = () => {
    if (!myReview) return;
    setRating(myReview.rating);
    setContent(myReview.content);
    setHover(0);
    setError(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setError(null);
    resetForm();
  };

  // 수정 저장 — 위치 인증 없음(어디서나), 욕설·스팸 필터는 서버에서 유지
  const saveEdit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!myReviewId || content.trim().length === 0) return;
    setSubmitting(true);
    try {
      const res = await updateReview(myReviewId, rating, content);
      if (!res.ok || !res.review) {
        setError(res.error ?? "수정에 실패했어요.");
        return;
      }
      setReviews((prev) =>
        prev.map((r) => (r.id === myReviewId ? res.review! : r)),
      );
      setEditing(false);
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  const showForm = loggedIn && (!alreadyReviewed || editing);

  return (
    <section className="mt-8" aria-label="이용자 리뷰">
      <h2 className="flex items-center gap-2 text-base font-extrabold text-neutral-900">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-forest-50 text-forest-700">
          <MessageSquare className="h-4 w-4" strokeWidth={2} />
        </span>
        이용자 리뷰
        <span className="rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-bold text-forest-600">
          {reviews.length}
        </span>
      </h2>

      {/* 평균 별점 (제목 바로 아래) */}
      {reviews.length > 0 ? (
        <div className="mt-2 flex items-center gap-3">
          <span className="text-2xl font-extrabold leading-none tabular-nums text-neutral-900">
            {avg.toFixed(1)}
          </span>
          <span className="flex flex-col gap-1">
            <StarRow value={Math.round(avg)} />
            <span className="text-xs text-neutral-500">
              5점 만점 · 리뷰 {reviews.length}개
            </span>
          </span>
        </div>
      ) : (
        <p className="mt-2 text-sm text-neutral-400">
          {hydrated ? "현재 리뷰가 없습니다." : "리뷰 불러오는 중…"}
        </p>
      )}

      {/* 비로그인 → 로그인 유도 */}
      {hydrated && !loggedIn && (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-6 text-center">
          <p className="text-sm text-neutral-600">
            리뷰는 로그인 후 작성할 수 있어요.
          </p>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("hco:open-login"))}
            className="inline-flex items-center gap-1.5 rounded-full bg-forest-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-forest-700"
          >
            <LogIn className="h-4 w-4" strokeWidth={2.2} />
            로그인하고 리뷰 쓰기
          </button>
        </div>
      )}

      {/* 작성/수정 폼 (로그인 + 미작성/수정중) */}
      {showForm && (
        <form
          onSubmit={editing ? saveEdit : handleCreate}
          className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-card"
        >
          {editing ? (
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
              리뷰 수정 중 — 수정은 현장이 아니어도 가능합니다
            </p>
          ) : (
            location && (
              <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-forest-50 px-3 py-1.5 text-xs font-semibold text-forest-700">
                <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                리뷰는 현장(스팟 근처)에서만 등록됩니다
              </p>
            )
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
              placeholder="한줄평을 남겨주세요 (예: 강 바로 앞이라 낚시하기 최고예요!)"
              aria-label="한줄평"
              maxLength={100}
              className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
            />
            {editing ? (
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-forest-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-4 w-4" strokeWidth={2.2} />
                  {submitting ? "저장 중…" : "수정 완료"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-200"
                >
                  <X className="h-4 w-4" strokeWidth={2.2} />
                  취소
                </button>
              </div>
            ) : (
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-forest-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" strokeWidth={2.2} />
                {submitting ? "현장 확인 중…" : "등록"}
              </button>
            )}
          </div>

          {error && (
            <p className="mt-3 flex items-start gap-1.5 text-xs font-medium text-rose-600">
              <AlertCircle
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                strokeWidth={2}
              />
              <span>{error}</span>
            </p>
          )}
        </form>
      )}

      {/* 이미 작성한 경우(로그인) */}
      {loggedIn && alreadyReviewed && !editing && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-forest-200 bg-forest-50 px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-medium text-forest-700">
            <UserRound className="h-4 w-4 shrink-0" strokeWidth={2} />
            이미 이 장소에 리뷰를 남기셨습니다. 감사합니다! (1인 1리뷰)
          </span>
          <button
            type="button"
            onClick={startEdit}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-forest-700 ring-1 ring-forest-200 transition hover:bg-forest-100"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2.2} />
            수정
          </button>
        </div>
      )}

      {/* 리뷰 목록 */}
      {reviews.length > 0 && (
        <ul className="mt-4 space-y-3">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-forest-200 hover:shadow-card"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sand-100 text-forest-700">
                  <UserRound className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="text-sm font-bold text-neutral-900">
                  {r.name}
                </span>
                {r.mine && (
                  <span className="rounded-full bg-forest-50 px-1.5 py-0.5 text-[10px] font-bold text-forest-600">
                    내 리뷰
                  </span>
                )}
                <StarRow value={r.rating} />
                <span className="ml-auto shrink-0 text-xs tabular-nums text-neutral-400">
                  {formatDate(r.updatedAt ?? r.createdAt)}
                  {r.updatedAt ? " · 수정됨" : ""}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-neutral-700">
                {r.content}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">
        * 리뷰는 로그인 후 작성되며, 욕설·스팸 필터 / 1인 1리뷰(수정 가능) / 현장(GPS)
        인증이 적용됩니다.
      </p>
    </section>
  );
}
