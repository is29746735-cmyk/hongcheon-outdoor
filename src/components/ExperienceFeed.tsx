"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Trash2, MessageSquareText } from "lucide-react";
import {
  loadAllExperiences,
  deleteExperience,
  type AllExperienceDTO,
} from "@/lib/experience-actions";
import ExperienceComposer, {
  type PlacePick,
} from "@/components/ExperienceComposer";

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 모든 장소의 경험담·사진을 모아 보여주는 피드 (전체 보기 페이지 본문).
 * 클라이언트 섬: 마운트 시 서버 액션으로 목록을 불러오고,
 * 상단 작성 폼(장소 선택+사진+내용)으로 바로 등록하며, 본인 글은 삭제할 수 있다.
 */
export default function ExperienceFeed({ places }: { places: PlacePick[] }) {
  const [posts, setPosts] = useState<AllExperienceDTO[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadAllExperiences()
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
  }, []);

  const remove = async (id: string) => {
    if (!window.confirm("이 경험담을 삭제할까요?")) return;
    const res = await deleteExperience(id);
    if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== id));
    else setError(res.error ?? "삭제에 실패했어요.");
  };

  return (
    <>
      {/* 작성 폼 (로그인 시) / 로그인 유도 — 준비되면 노출 */}
      {status === "ready" && (
        <ExperienceComposer
          places={places}
          loggedIn={loggedIn}
          onCreated={(post) => setPosts((prev) => [post, ...prev])}
        />
      )}

      {error && <p className="mt-4 text-sm text-[#f04452]">{error}</p>}

      {status === "loading" && (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl bg-neutral-100"
            />
          ))}
        </div>
      )}

      {status === "ready" && posts.length === 0 && (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-3xl border border-dashed border-neutral-200 py-16 text-center">
          <MessageSquareText
            className="h-8 w-8 text-neutral-300"
            strokeWidth={1.8}
          />
          <p className="text-sm text-neutral-400">
            아직 등록된 경험담이 없어요.
          </p>
          <p className="text-xs text-neutral-400">
            위에서 첫 이야기를 남겨보세요.
          </p>
        </div>
      )}

      {posts.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <article
              key={p.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow hover:shadow-card"
            >
              {p.imageUrl && (
                <Link
                  href={`/spots/${p.placeId}`}
                  className="relative block aspect-[4/3] w-full bg-neutral-100"
                >
                  <Image
                    src={p.imageUrl}
                    alt={`${p.name}님이 ${p.placeName}에서 남긴 사진`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                    className="object-cover"
                  />
                </Link>
              )}
              <div className="flex flex-1 flex-col p-4">
                {/* 장소 칩 (river 톤) */}
                <Link
                  href={`/spots/${p.placeId}`}
                  className="inline-flex w-fit items-center gap-1 rounded-full bg-river-50 px-2.5 py-1 text-xs font-bold text-river-700 transition-colors hover:bg-river-100"
                >
                  <MapPin className="h-3 w-3" strokeWidth={2.4} />
                  {p.placeName}
                </Link>

                <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
                  {p.body}
                </p>

                <div className="mt-3 flex items-center justify-between pt-1 text-xs text-neutral-400">
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
      )}
    </>
  );
}
