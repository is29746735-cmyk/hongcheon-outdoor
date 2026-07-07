"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, ImagePlus, Trash2, X, Loader2 } from "lucide-react";
import {
  loadExperiences,
  deleteExperience,
  type ExperienceDTO,
} from "@/lib/experience-actions";
import LoginPromptButton from "@/components/LoginPromptButton";

const MAX_BODY_LEN = 500;

/** 업로드 전 클라이언트에서 이미지 리사이즈(용량·비용 절감). 실패 시 원본 반환. */
async function compressImage(
  file: File,
  maxDim = 1280,
  quality = 0.82,
): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", quality),
    );
    return blob ?? file;
  } catch {
    return file;
  }
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ExperienceSection({ placeId }: { placeId: string }) {
  const [posts, setPosts] = useState<ExperienceDTO[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    loadExperiences(placeId)
      .then((r) => {
        if (!active) return;
        setPosts(r.posts);
        setLoggedIn(r.loggedIn);
        setStatus("ready");
      })
      .catch(() => active && setStatus("ready"));
    return () => {
      active = false;
    };
  }, [placeId]);

  // preview object URL 정리
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

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
        post?: ExperienceDTO;
        error?: string;
      };
      if (!json.ok || !json.post) {
        setError(
          json.error ?? "등록에 실패했어요. 잠시 후 다시 시도해 주세요.",
        );
        return;
      }
      setPosts((prev) => [json.post as ExperienceDTO, ...prev]);
      setBody("");
      pickFile(null);
    } catch {
      setError("등록에 실패했어요. 네트워크를 확인해 주세요.");
    } finally {
      setSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body, file, placeId]);

  const remove = async (id: string) => {
    if (!window.confirm("이 경험담을 삭제할까요?")) return;
    const res = await deleteExperience(id);
    if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== id));
    else setError(res.error ?? "삭제에 실패했어요.");
  };

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-neutral-900">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-forest-50 text-forest-700">
            <Camera className="h-4 w-4" strokeWidth={2} />
          </span>
          경험담 · 사진
          {posts.length > 0 && (
            <span className="text-sm font-semibold tabular-nums text-neutral-400">
              {posts.length}
            </span>
          )}
        </h2>
        <Link
          href="/experiences"
          className="shrink-0 text-sm font-semibold text-river-600 transition-colors hover:text-river-700"
        >
          전체 보기 →
        </Link>
      </div>
      <p className="mt-1.5 text-sm text-neutral-500">
        다녀온 후 사진과 경험을 남겨보세요. 다른 분들에게 큰 도움이 됩니다.
      </p>

      {/* 작성 폼 (로그인 시) / 로그인 유도 */}
      {status === "ready" &&
        (loggedIn ? (
          <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
            {preview && (
              <div className="relative mb-3 overflow-hidden rounded-xl">
                {/* 미리보기 — 사용자가 방금 고른 로컬 이미지 */}
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
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={MAX_BODY_LEN}
              rows={3}
              placeholder="예) 강물이 맑아서 아이들과 물놀이하기 좋았어요. 쏘가리도 한 마리 잡았습니다!"
              className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 text-sm leading-relaxed text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-forest-500"
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
                  disabled={submitting || !body.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-forest-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest-700 disabled:opacity-50"
                >
                  {submitting && (
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      strokeWidth={2.2}
                    />
                  )}
                  {submitting ? "올리는 중…" : "올리기"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center">
            <p className="text-sm text-neutral-500">
              사진과 경험담을 남기려면 로그인하세요.
            </p>
            <LoginPromptButton />
          </div>
        ))}

      {/* 목록 */}
      <div className="mt-5 space-y-4">
        {status === "loading" && (
          <div className="h-24 animate-pulse rounded-2xl bg-neutral-100" />
        )}
        {status === "ready" && posts.length === 0 && (
          <p className="rounded-2xl border border-dashed border-neutral-200 py-8 text-center text-sm text-neutral-400">
            아직 경험담이 없어요. 첫 이야기를 남겨보세요.
          </p>
        )}
        {posts.map((p) => (
          <article
            key={p.id}
            className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
          >
            {p.imageUrl && (
              <div className="relative aspect-[4/3] w-full bg-neutral-100">
                <Image
                  src={p.imageUrl}
                  alt={`${p.name}님의 경험 사진`}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
                {p.body}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                <span>
                  <span className="font-semibold text-neutral-600">
                    {p.name}
                  </span>
                  {" · "}
                  {formatDate(p.createdAt)}
                </span>
                {p.mine && (
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    className="inline-flex items-center gap-1 text-neutral-400 transition hover:text-[#f04452]"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                    삭제
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
