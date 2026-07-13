"use client";

import { useState } from "react";
import { Check, Link2, Navigation } from "lucide-react";
import type { Place } from "@/types/place";
import { getDirectionsLink } from "@/lib/map-links";

/**
 * 스팟 상세 페이지용 액션 버튼 — 링크 복사 / 길찾기.
 * (슬라이드오버의 동작과 동일하게 동작한다.)
 */
export default function SpotActions({ place }: { place: Place }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const url = `${window.location.origin}/spots/${place.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard API 미지원/거부 시 폴백
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <button
        type="button"
        onClick={copyLink}
        aria-live="polite"
        className={`inline-flex items-center justify-center gap-1.5 rounded-sm px-4 py-2.5 text-sm font-bold transition ${
          copied
            ? "bg-forest-50 text-forest-700 ring-1 ring-forest-200"
            : "bg-white text-neutral-700 ring-1 ring-neutral-300 hover:bg-neutral-50"
        }`}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" strokeWidth={2.4} />
            복사됨!
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4" strokeWidth={2.2} />
            링크 복사
          </>
        )}
      </button>
      <a
        href={getDirectionsLink(place)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-forest-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-forest-800"
      >
        <Navigation className="h-4 w-4" strokeWidth={2.2} />
        길찾기
      </a>
    </div>
  );
}
