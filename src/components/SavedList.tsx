"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { BookmarkX } from "lucide-react";
import { toggleSave } from "@/lib/saved-actions";
import { CATEGORY_LABELS } from "@/constants";
import type { PlaceCategory } from "@/types/place";

export interface SavedItem {
  id: string;
  name: string;
  category: PlaceCategory;
  region: string;
  summary: string;
}

/**
 * 저장한 장소 목록 (클라이언트).
 * 항목별 "저장 취소" 버튼으로 toggleSave 를 호출하고, 성공 시 목록에서 즉시 제거한다(낙관적).
 * 마지막 항목까지 제거되면 빈 상태를 보여준다. 세션이 끊겼으면 로그인 모달을 띄운다.
 */
export default function SavedList({ initial }: { initial: SavedItem[] }) {
  const [items, setItems] = useState<SavedItem[]>(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const unsave = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      const res = await toggleSave(id);
      if (!res.loggedIn) {
        window.dispatchEvent(new Event("hco:open-login"));
      } else if (!res.saved) {
        setItems((prev) => prev.filter((p) => p.id !== id));
      }
      setPendingId(null);
    });
  };

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
        <p className="text-sm leading-relaxed text-neutral-500">
          저장한 장소가 없어요. 장소 상세 페이지에서{" "}
          <span className="font-bold text-forest-700">이 장소 저장</span> 버튼을
          눌러 추가하세요.
        </p>
        <Link
          href="/#list"
          className="mt-4 inline-block rounded-sm bg-forest-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-forest-700"
        >
          장소 둘러보기
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mt-1 text-sm text-neutral-500">{items.length}곳 저장됨</p>
      <ul className="mt-6 space-y-3">
        {items.map((place) => (
          <li
            key={place.id}
            className="relative rounded-2xl border border-neutral-200 bg-white p-4 shadow-card"
          >
            <Link href={`/spots/${place.id}`} className="block pr-24">
              <div className="flex items-center gap-2">
                <span className="rounded-sm bg-forest-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                  {CATEGORY_LABELS[place.category]}
                </span>
                <span className="truncate text-xs text-neutral-400">
                  {place.region}
                </span>
              </div>
              <h2 className="mt-1.5 text-base font-extrabold text-neutral-900">
                {place.name}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                {place.summary}
              </p>
            </Link>
            <button
              type="button"
              onClick={() => unsave(place.id)}
              disabled={pendingId === place.id}
              aria-label={`${place.name} 저장 취소`}
              className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-sm bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-600 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
            >
              <BookmarkX className="h-3.5 w-3.5" strokeWidth={2.2} />
              {pendingId === place.id ? "취소 중…" : "저장 취소"}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
