"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ImagePlus, X, Loader2, MapPin } from "lucide-react";
import LoginPromptButton from "@/components/LoginPromptButton";
import { compressImage } from "@/lib/compress-image";
import { CATEGORY_LABELS } from "@/constants";
import type { PlaceCategory } from "@/types/place";
import type { AllExperienceDTO } from "@/lib/experience-actions";

const MAX_BODY_LEN = 500;

export type PlacePick = { id: string; name: string; category: PlaceCategory };

/**
 * 경험담 전체 페이지용 작성 폼 — 상세 페이지와 달리 장소를 직접 골라서 작성한다.
 * 로그인 필수. 등록 성공 시 onCreated로 새 글을 부모(피드)에 전달해 즉시 반영.
 */
export default function ExperienceComposer({
  places,
  loggedIn,
  onCreated,
}: {
  places: PlacePick[];
  loggedIn: boolean;
  onCreated: (post: AllExperienceDTO) => void;
}) {
  const [placeId, setPlaceId] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 카테고리별로 묶어 <optgroup>으로 노출
  const grouped = useMemo(() => {
    const cats: PlaceCategory[] = ["camping", "fishing", "carcamping"];
    return cats
      .map((cat) => ({ cat, items: places.filter((p) => p.category === cat) }))
      .filter((g) => g.items.length > 0);
  }, [places]);

  const pickFile = (f: File | null) => {
    if (preview) URL.revokeObjectURL(preview);
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const submit = useCallback(async () => {
    setError(null);
    if (!placeId) {
      setError("장소를 선택해 주세요.");
      return;
    }
    const text = body.trim();
    if (!text) {
      setError("내용을 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("placeId", placeId);
      fd.append("body", text);
      if (file) {
        const blob = await compressImage(file);
        fd.append("image", blob, "photo.jpg");
      }
      const res = await fetch("/api/experience", { method: "POST", body: fd });
      const json = (await res.json()) as {
        ok: boolean;
        post?: Omit<AllExperienceDTO, "placeId" | "placeName">;
        error?: string;
      };
      if (!json.ok || !json.post) {
        setError(
          json.error ?? "등록에 실패했어요. 잠시 후 다시 시도해 주세요.",
        );
        return;
      }
      const place = places.find((p) => p.id === placeId);
      onCreated({
        ...json.post,
        placeId,
        placeName: place?.name ?? "홍천 아웃도어",
      });
      setBody("");
      setPlaceId("");
      pickFile(null);
    } catch {
      setError("등록에 실패했어요. 네트워크를 확인해 주세요.");
    } finally {
      setSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId, body, file, places, onCreated]);

  if (!loggedIn) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-center">
        <p className="text-sm text-neutral-500">
          사진과 경험담을 남기려면 로그인하세요.
        </p>
        <LoginPromptButton />
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-3xl border border-neutral-200 bg-white p-4 sm:p-5">
      {/* 장소 선택 */}
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-neutral-800">
        <MapPin className="h-4 w-4 text-river-600" strokeWidth={2.2} />
        어디에서의 경험인가요?
      </label>
      <select
        value={placeId}
        onChange={(e) => setPlaceId(e.target.value)}
        aria-label="장소 선택"
        className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2.5 text-sm text-neutral-800 outline-none focus:border-forest-500"
      >
        <option value="" disabled>
          장소를 선택하세요
        </option>
        {grouped.map((g) => (
          <optgroup key={g.cat} label={CATEGORY_LABELS[g.cat]}>
            {g.items.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {/* 사진 미리보기 */}
      {preview && (
        <div className="relative mt-3 overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="첨부 사진 미리보기"
            className="max-h-64 w-full object-cover"
          />
          <button
            type="button"
            onClick={() => pickFile(null)}
            aria-label="사진 제거"
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
          >
            <X className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>
      )}

      {/* 내용 */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={MAX_BODY_LEN}
        rows={3}
        placeholder="예) 강물이 맑아서 아이들과 물놀이하기 좋았어요. 쏘가리도 한 마리 잡았습니다!"
        className="mt-3 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 text-sm leading-relaxed text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-forest-500"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
      />
      {error && <p className="mt-2 text-sm text-[#f04452]">{error}</p>}

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3.5 py-2 text-sm font-semibold text-neutral-600 transition hover:border-forest-400 hover:text-forest-600"
        >
          <ImagePlus className="h-4 w-4" strokeWidth={2} />
          {file ? "사진 변경" : "사진 추가"}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs tabular-nums text-neutral-400">
            {body.length}/{MAX_BODY_LEN}
          </span>
          <button
            type="button"
            onClick={submit}
            disabled={submitting || !placeId || !body.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-forest-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest-700 disabled:opacity-50"
          >
            {submitting && (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.2} />
            )}
            {submitting ? "올리는 중…" : "올리기"}
          </button>
        </div>
      </div>
    </div>
  );
}
