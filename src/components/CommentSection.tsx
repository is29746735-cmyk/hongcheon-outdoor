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
} from "lucide-react";
import type { GeoPoint } from "@/types/place";
import { checkReviewContent } from "@/lib/contentFilter";

interface Review {
  id: string;
  nickname: string;
  /** 별점 1~5 */
  rating: number;
  content: string;
  /** 작성 시각 (ISO) */
  createdAt: string;
  /** 마지막 수정 시각 (ISO) — 수정된 경우에만 */
  updatedAt?: string;
}

interface CommentSectionProps {
  /** 스팟 식별자 (리뷰 저장·1인 1리뷰 판정 키) */
  placeId: string;
  /** 스팟 좌표 — 현장(위치) 인증에 사용. 없으면 등록을 제한한다. */
  location?: GeoPoint;
}

/** 현장 인증 허용 반경 (m) — 넓은 캠핑장·강변 + GPS 오차 감안 */
const MAX_DISTANCE_M = 1000;
/** 허용 가능한 위치 정확도 한계 (m) — 이보다 부정확하면 GPS가 아닌 IP 추정으로 보고 거부 */
const ACCURACY_LIMIT_M = 500;

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

/** 두 좌표 사이 거리(m) — 하버사인 */
function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${Math.round(m)}m`;
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
 * 스팟 상세 하단의 이용자 리뷰 섹션.
 * - 평균 별점을 제목 아래에 표시(없으면 "현재 리뷰가 없습니다").
 * - 욕설·스팸 자동 필터(작성·수정 모두 적용).
 * - 1인 1리뷰 + 본인 리뷰 수정(내용·별점) 가능.
 * - 현장(GPS) 인증: 작성은 스팟 반경 내에서만, 수정은 위치 무관 허용.
 *
 * ⚠️ 데모: 리뷰·본인 리뷰 식별은 브라우저 localStorage 기준. 실제 운영은 로그인·서버 검증 필요.
 */
export default function CommentSection({
  placeId,
  location,
}: CommentSectionProps) {
  const storageKey = `hco-reviews-${placeId}`;
  const myIdKey = `hco-myreview-${placeId}`;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [myReviewId, setMyReviewId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  // 최초 1회: localStorage 복원
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setReviews(JSON.parse(raw) as Review[]);
      const id = localStorage.getItem(myIdKey);
      if (id) setMyReviewId(id);
    } catch {
      /* localStorage 불가 시 무시 */
    }
    setHydrated(true);
  }, [storageKey, myIdKey]);

  // 리뷰 변경 시 저장(복원 이후에만)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(reviews));
    } catch {
      /* 무시 */
    }
  }, [reviews, hydrated, storageKey]);

  const alreadyReviewed = myReviewId !== null;
  const myReview = reviews.find((r) => r.id === myReviewId) ?? null;
  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
  const canSubmit =
    nickname.trim().length > 0 && content.trim().length > 0 && !locating;

  const resetForm = () => {
    setNickname("");
    setContent("");
    setRating(5);
    setHover(0);
  };

  // 신규 등록 — 현장(GPS) 인증 필수
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (nickname.trim().length === 0 || content.trim().length === 0) return;

    if (alreadyReviewed) {
      setError("이미 이 장소에 리뷰를 남기셨습니다. (1인 1리뷰)");
      return;
    }
    const filtered = checkReviewContent(content, nickname);
    if (!filtered.ok) {
      setError(filtered.reason ?? "등록할 수 없는 내용이에요.");
      return;
    }
    // 좌표가 없으면 현장 인증 불가 → 등록 제한
    if (!location) {
      setError("이 장소는 위치 정보가 없어 현장 인증을 할 수 없어 등록이 제한됩니다.");
      return;
    }

    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      const acc = pos.coords.accuracy ?? Number.MAX_SAFE_INTEGER;
      // 위치 정확도가 너무 낮으면(=IP 추정 등) 신뢰 불가 → 거부
      if (acc > ACCURACY_LIMIT_M) {
        setError(
          `정확한 GPS 위치를 가져오지 못했어요(오차 약 ${formatDistance(
            acc
          )}). 실외에서 GPS를 켜고 다시 시도해 주세요.`
        );
        return;
      }
      const dist = distanceMeters(
        pos.coords.latitude,
        pos.coords.longitude,
        location.lat,
        location.lng
      );
      if (dist > MAX_DISTANCE_M) {
        setError(
          `리뷰는 현장에서만 작성할 수 있어요. 지금 스팟에서 약 ${formatDistance(
            dist
          )} 떨어져 있습니다.`
        );
        return;
      }
    } catch {
      setError(
        "현장 인증을 위해 위치 권한이 필요해요. 위치 권한을 허용한 뒤 다시 시도해 주세요."
      );
      return;
    } finally {
      setLocating(false);
    }

    const review: Review = {
      id: newId(),
      nickname: nickname.trim(),
      rating,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [review, ...prev]);
    try {
      localStorage.setItem(myIdKey, review.id);
    } catch {
      /* 무시 */
    }
    setMyReviewId(review.id);
    resetForm();
  };

  // 수정 시작 — 본인 리뷰 값을 폼에 불러온다
  const startEdit = () => {
    if (!myReview) return;
    setNickname(myReview.nickname);
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

  // 수정 저장 — 위치 인증 없음(어디서나 가능), 욕설·스팸 필터는 유지
  const saveEdit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (nickname.trim().length === 0 || content.trim().length === 0) return;

    const filtered = checkReviewContent(content, nickname);
    if (!filtered.ok) {
      setError(filtered.reason ?? "등록할 수 없는 내용이에요.");
      return;
    }
    setReviews((prev) =>
      prev.map((r) =>
        r.id === myReviewId
          ? {
              ...r,
              nickname: nickname.trim(),
              rating,
              content: content.trim(),
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
    setEditing(false);
    resetForm();
  };

  const showForm = !alreadyReviewed || editing;

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
        <div className="mt-1.5 flex items-center gap-1.5 text-sm">
          <StarRow value={Math.round(avg)} />
          <span className="font-bold text-amber-500">{avg.toFixed(1)}</span>
          <span className="text-neutral-400">/ 5 · 리뷰 {reviews.length}개</span>
        </div>
      ) : (
        <p className="mt-1.5 text-sm text-neutral-400">현재 리뷰가 없습니다.</p>
      )}

      {/* 작성/수정 폼 또는 '이미 작성' 패널 */}
      {showForm ? (
        <form
          onSubmit={editing ? saveEdit : handleCreate}
          className="mt-4 rounded-3xl border border-neutral-200 bg-white p-5"
        >
          {editing ? (
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
              리뷰 수정 중 — 수정은 현장이 아니어도 가능합니다
            </p>
          ) : (
            location && (
              <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700">
                <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                리뷰는 현장(스팟 근처)에서만 등록됩니다
              </p>
            )
          )}

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
              className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-forest-500 focus:ring-2 focus:ring-forest-100"
            />
            {editing ? (
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-forest-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-4 w-4" strokeWidth={2.2} />
                  수정 완료
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50"
                >
                  <X className="h-4 w-4" strokeWidth={2.2} />
                  취소
                </button>
              </div>
            ) : (
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-forest-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" strokeWidth={2.2} />
                {locating ? "현장 확인 중…" : "등록"}
              </button>
            )}
          </div>

          {error && (
            <p className="mt-3 flex items-start gap-1.5 text-xs font-medium text-rose-600">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span>{error}</span>
            </p>
          )}
        </form>
      ) : (
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
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sand-100 text-forest-700">
                  <UserRound className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="text-sm font-bold text-neutral-800">
                  {r.nickname}
                </span>
                {r.id === myReviewId && (
                  <span className="rounded-full bg-forest-50 px-1.5 py-0.5 text-[10px] font-bold text-forest-600">
                    내 리뷰
                  </span>
                )}
                <StarRow value={r.rating} />
                <span className="ml-auto shrink-0 text-xs text-neutral-400">
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
        * 데모용 리뷰입니다. 이 브라우저에 저장되며, 욕설·스팸 필터 / 1인 1리뷰(수정
        가능) / 현장(GPS) 인증이 적용됩니다.
      </p>
    </section>
  );
}
