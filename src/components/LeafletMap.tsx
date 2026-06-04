"use client";

import "leaflet/dist/leaflet.css";
import type * as L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Place, PlaceCategory } from "@/types/place";
import { getAllPlaces } from "@/data/places";
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  HONGCHEON_RIVER_CENTER,
} from "@/constants";
import { formatRating } from "@/lib/utils";
import { getMapLinks } from "@/lib/map-links";

/**
 * OpenStreetMap(Leaflet) 기반 지도. API 키·회원가입이 필요 없습니다.
 * 각 장소를 카테고리 이모지 마커로 표시하고, 마커 클릭 시 팝업에
 * 이름·별점·주소와 네이버/카카오/구글 지도 링크를 보여줍니다.
 */

const CATEGORY_ORDER: PlaceCategory[] = ["camping", "fishing", "carcamping"];

/** 마커 팝업 HTML */
function buildPopupHtml(place: Place): string {
  const links = getMapLinks(place);
  const linkStyle =
    "display:inline-block;padding:3px 8px;border-radius:9999px;font-size:11px;text-decoration:none;border:1px solid #d4d4d4;color:#404040;";
  return `
    <div style="min-width:190px;font-family:system-ui,sans-serif;">
      <div style="font-size:11px;color:#236340;font-weight:600;">
        ${CATEGORY_ICONS[place.category]} ${CATEGORY_LABELS[place.category]}
      </div>
      <div style="margin-top:2px;font-size:15px;font-weight:700;color:#171717;">${place.name}</div>
      <div style="margin-top:3px;font-size:13px;color:#f59e0b;">${formatRating(place.rating)}</div>
      <div style="margin-top:3px;font-size:12px;color:#525252;line-height:1.4;">${place.region}</div>
      <div style="margin-top:8px;display:flex;gap:5px;flex-wrap:wrap;">
        <a href="${links.naver}" target="_blank" rel="noopener" style="${linkStyle}">네이버</a>
        <a href="${links.kakao}" target="_blank" rel="noopener" style="${linkStyle}">카카오</a>
        <a href="${links.google}" target="_blank" rel="noopener" style="${linkStyle}">구글</a>
      </div>
      <a href="/places/${place.id}" style="display:inline-block;margin-top:8px;font-size:12px;color:#236340;text-decoration:underline;">자세히 보기 →</a>
    </div>
  `;
}

interface LeafletMapProps {
  places?: Place[];
  /** 지도 컨테이너 높이 (Tailwind). 기본 h-[70vh] */
  className?: string;
}

export default function LeafletMap({ places, className }: LeafletMapProps) {
  const data = useMemo(() => places ?? getAllPlaces(), [places]);

  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, { marker: L.Marker; place: Place }>>(
    new Map()
  );

  const [ready, setReady] = useState(false);
  const [activeCategories, setActiveCategories] = useState<Set<PlaceCategory>>(
    new Set()
  );

  const toggleCategory = (category: PlaceCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  // 지도 + 마커 초기화 (Leaflet은 window 의존이라 동적 import)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !elRef.current || mapRef.current) return;

      const map = L.map(elRef.current).setView(
        [HONGCHEON_RIVER_CENTER.lat, HONGCHEON_RIVER_CENTER.lng],
        11
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;

      const markers = new Map<string, { marker: L.Marker; place: Place }>();
      data.forEach((place) => {
        if (!place.location) return;
        const icon = L.divIcon({
          className: "hc-marker",
          html: `<div style="font-size:26px;line-height:1;transform:translate(-50%,-100%);">${
            CATEGORY_ICONS[place.category]
          }</div>`,
          iconSize: [0, 0],
        });
        const marker = L.marker([place.location.lat, place.location.lng], {
          icon,
          title: place.name,
        })
          .addTo(map)
          .bindPopup(buildPopupHtml(place));
        markers.set(place.id, { marker, place });
      });
      markersRef.current = markers;
      setReady(true);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [data]);

  // 필터 변경 시 마커 노출/숨김
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;
    markersRef.current.forEach(({ marker, place }) => {
      const visible =
        activeCategories.size === 0 || activeCategories.has(place.category);
      if (visible) marker.addTo(map);
      else marker.remove();
    });
  }, [ready, activeCategories]);

  return (
    <div className="flex flex-col gap-3">
      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2">
        <FilterButton
          active={activeCategories.size === 0}
          onClick={() => setActiveCategories(new Set())}
        >
          전체
        </FilterButton>
        {CATEGORY_ORDER.map((category) => (
          <FilterButton
            key={category}
            active={activeCategories.has(category)}
            onClick={() => toggleCategory(category)}
          >
            {CATEGORY_ICONS[category]} {CATEGORY_LABELS[category]}
          </FilterButton>
        ))}
      </div>

      {/* 지도 */}
      <div
        ref={elRef}
        className={`w-full overflow-hidden rounded-2xl border border-neutral-200 ${
          className ?? "h-[70vh]"
        }`}
      />
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-forest-600 bg-forest-600 text-white"
          : "border-neutral-300 bg-white text-neutral-700 hover:border-forest-500 hover:text-forest-600"
      }`}
    >
      {children}
    </button>
  );
}
