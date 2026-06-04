"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Place, PlaceCategory } from "@/types/place";
import { getAllPlaces } from "@/data/places";
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  HONGCHEON_RIVER_CENTER,
} from "@/constants";
import { formatRating } from "@/lib/utils";

/**
 * 네이버 지도 v3 JS API 연동 컴포넌트.
 *
 * 사용 전 준비:
 *  1) 네이버 클라우드 플랫폼(NCP) > Maps > Application 등록 후 Client ID 발급
 *  2) 프로젝트 루트 `.env.local` 에 아래 값 설정
 *       NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=발급받은_client_id
 *  3) NCP 콘솔에서 서비스 URL(예: http://localhost:3000)을 Web 서비스 URL로 등록
 *
 * 카카오맵을 쓰려면 스크립트 src 와 window.naver.maps 호출부만 카카오 SDK로 바꾸면 됩니다.
 */

// 네이버 지도 SDK는 런타임에 주입되므로 최소한의 타입만 선언합니다.
declare global {
  interface Window {
    naver: any;
  }
}

const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
const SCRIPT_ID = "naver-maps-sdk";

/** SDK 스크립트를 한 번만 로드하고 Promise 로 완료를 알린다. */
function loadNaverMapsSdk(clientId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return;
    if (window.naver?.maps) {
      resolve();
      return;
    }

    const existing = document.getElementById(
      SCRIPT_ID
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("네이버 지도 SDK 로드 실패"))
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("네이버 지도 SDK 로드 실패"));
    document.head.appendChild(script);
  });
}

/** 마커 클릭 시 뜨는 InfoWindow 내부 HTML */
function buildInfoWindowContent(place: Place): string {
  return `
    <div style="padding:12px 14px;min-width:180px;max-width:240px;font-family:system-ui,sans-serif;">
      <div style="font-size:11px;color:#236340;font-weight:600;">
        ${CATEGORY_ICONS[place.category]} ${CATEGORY_LABELS[place.category]}
      </div>
      <div style="margin-top:2px;font-size:15px;font-weight:700;color:#171717;">
        ${place.name}
      </div>
      <div style="margin-top:4px;font-size:13px;color:#f59e0b;">
        ${formatRating(place.rating)}
      </div>
      <div style="margin-top:4px;font-size:12px;color:#525252;line-height:1.4;">
        ${place.region}
      </div>
      <a href="/places/${place.id}"
         style="display:inline-block;margin-top:8px;font-size:12px;color:#236340;text-decoration:underline;">
        자세히 보기 →
      </a>
    </div>
  `;
}

const CATEGORY_ORDER: PlaceCategory[] = ["camping", "fishing", "carcamping"];

interface MapProps {
  places?: Place[];
  /** 지도 컨테이너 높이 (Tailwind 클래스). 기본 h-[70vh] */
  className?: string;
}

export default function NaverMap({ places, className }: MapProps) {
  const data = useMemo(() => places ?? getAllPlaces(), [places]);

  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  // place.id -> { marker, place }
  const markersRef = useRef<Map<string, { marker: any; place: Place }>>(
    new Map()
  );

  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  // 선택된 카테고리 집합. 비어 있으면 "전체" 표시.
  const [activeCategories, setActiveCategories] = useState<Set<PlaceCategory>>(
    new Set()
  );

  const isVisible = useCallback(
    (category: PlaceCategory) =>
      activeCategories.size === 0 || activeCategories.has(category),
    [activeCategories]
  );

  const toggleCategory = (category: PlaceCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const resetCategories = () => setActiveCategories(new Set());

  // 1) SDK 로드 + 지도/마커 초기화 (최초 1회)
  useEffect(() => {
    if (!NAVER_CLIENT_ID) {
      setStatus("error");
      return;
    }

    let cancelled = false;

    loadNaverMapsSdk(NAVER_CLIENT_ID)
      .then(() => {
        if (cancelled || !mapElRef.current) return;
        const { naver } = window;

        const map = new naver.maps.Map(mapElRef.current, {
          center: new naver.maps.LatLng(
            HONGCHEON_RIVER_CENTER.lat,
            HONGCHEON_RIVER_CENTER.lng
          ),
          zoom: 12,
          zoomControl: true,
          zoomControlOptions: {
            position: naver.maps.Position.TOP_RIGHT,
          },
        });
        mapRef.current = map;

        const infoWindow = new naver.maps.InfoWindow({
          content: "",
          borderWidth: 0,
          disableAnchor: false,
          backgroundColor: "#fff",
          anchorColor: "#fff",
          pixelOffset: new naver.maps.Point(0, -8),
        });
        infoWindowRef.current = infoWindow;

        const markers = new Map<string, { marker: any; place: Place }>();

        data.forEach((place) => {
          if (!place.location) return;
          const marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(
              place.location.lat,
              place.location.lng
            ),
            map,
            title: place.name,
            icon: {
              content: `<div style="font-size:26px;line-height:1;transform:translate(-50%,-100%);">${
                CATEGORY_ICONS[place.category]
              }</div>`,
              anchor: new naver.maps.Point(0, 0),
            },
          });

          naver.maps.Event.addListener(marker, "click", () => {
            infoWindow.setContent(buildInfoWindowContent(place));
            infoWindow.open(map, marker);
          });

          markers.set(place.id, { marker, place });
        });

        // 빈 지도 클릭 시 InfoWindow 닫기
        naver.maps.Event.addListener(map, "click", () => infoWindow.close());

        markersRef.current = markers;
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      markersRef.current?.forEach(({ marker }) => marker.setMap?.(null));
      infoWindowRef.current?.close?.();
    };
    // data 는 최초 마운트 시점 기준으로만 마커를 생성한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) 필터 변경 시 마커 노출/숨김 토글
  useEffect(() => {
    if (status !== "ready") return;
    markersRef.current.forEach(({ marker, place }) => {
      const visible = isVisible(place.category);
      marker.setMap(visible ? mapRef.current : null);
      if (!visible) {
        // 숨겨진 마커에 InfoWindow 가 열려 있으면 닫는다.
        infoWindowRef.current?.close?.();
      }
    });
  }, [status, isVisible]);

  return (
    <div className="flex flex-col gap-3">
      {/* 카테고리 필터 버튼 바 */}
      <div className="flex flex-wrap gap-2">
        <FilterButton
          active={activeCategories.size === 0}
          onClick={resetCategories}
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

      {/* 지도 컨테이너 */}
      <div
        className={`relative w-full overflow-hidden rounded-2xl border border-neutral-200 ${
          className ?? "h-[70vh]"
        }`}
      >
        <div ref={mapElRef} className="h-full w-full" />

        {status === "loading" && (
          <Overlay>지도를 불러오는 중…</Overlay>
        )}
        {status === "error" && (
          <Overlay>
            <div className="text-center">
              <p className="font-semibold text-neutral-700">
                지도를 표시할 수 없습니다
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                {NAVER_CLIENT_ID
                  ? "SDK 로드에 실패했습니다. 네트워크 또는 NCP 서비스 URL 설정을 확인하세요."
                  : "환경변수 NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 가 설정되지 않았습니다."}
              </p>
            </div>
          </Overlay>
        )}
      </div>
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

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-neutral-50/80 text-neutral-500 backdrop-blur-sm">
      {children}
    </div>
  );
}
