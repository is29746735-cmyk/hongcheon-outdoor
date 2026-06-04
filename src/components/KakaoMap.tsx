"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CategoryFilter, Place, PlaceCategory } from "@/types/place";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  HONGCHEON_RIVER_CENTER,
} from "@/constants";
import { CategoryIcon, categoryMarkerSvg } from "@/components/icons";

/**
 * 카카오맵 동적 지도 컴포넌트.
 * - 좌표를 임의로 만들지 않고, place.location(검증된 좌표)이 있으면 그것을,
 *   없으면 카카오 장소검색(keyword)·주소검색(geocoder)으로 실제 등록 좌표를 받아 마커를 찍는다.
 * - activeCategory 가 바뀌면 해당 카테고리 마커만 실시간으로 보이도록 필터링한다.
 *
 * 사용 전: 카카오 개발자센터(developers.kakao.com)에서 JavaScript 키를 발급받아
 *   .env.local 의 NEXT_PUBLIC_KAKAO_MAP_KEY 에 넣고, 플랫폼 도메인을 등록해야 합니다.
 */

declare global {
  interface Window {
    kakao: any;
  }
}

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
const SCRIPT_ID = "kakao-maps-sdk";

/** Kakao SDK(services 라이브러리 포함)를 한 번만 로드 */
function loadKakaoSdk(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return;
    if (window.kakao?.maps) {
      resolve();
      return;
    }
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () =>
        window.kakao.maps.load(() => resolve())
      );
      existing.addEventListener("error", () =>
        reject(new Error("Kakao SDK load failed"))
      );
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services&autoload=false`;
    script.onload = () => window.kakao.maps.load(() => resolve());
    script.onerror = () => reject(new Error("Kakao SDK load failed"));
    document.head.appendChild(script);
  });
}

interface KakaoMapProps {
  places: Place[];
  /** 상단 카테고리 버튼과 공유되는 현재 필터 */
  activeCategory: CategoryFilter;
  className?: string;
}

export default function KakaoMap({
  places,
  activeCategory,
  className,
}: KakaoMapProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const infoRef = useRef<any>(null);
  const markersRef = useRef<{ overlay: any; category: PlaceCategory }[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  /** 현재 카테고리에 맞는 마커만 표시하고, 보이는 마커에 맞춰 화면을 맞춘다 */
  const applyFilter = useCallback((cat: CategoryFilter) => {
    const map = mapRef.current;
    if (!map || !window.kakao) return;
    const bounds = new window.kakao.maps.LatLngBounds();
    let any = false;
    markersRef.current.forEach(({ overlay, category }) => {
      const visible = cat === "all" || category === cat;
      overlay.setMap(visible ? map : null);
      if (visible) {
        bounds.extend(overlay.getPosition());
        any = true;
      }
    });
    infoRef.current?.close?.();
    if (any && !bounds.isEmpty()) map.setBounds(bounds);
  }, []);

  // 지도 초기화 + 마커 생성 (최초 1회)
  useEffect(() => {
    if (!KAKAO_KEY) {
      setStatus("error");
      return;
    }
    let cancelled = false;

    loadKakaoSdk(KAKAO_KEY)
      .then(() => {
        if (cancelled || !elRef.current) return;
        const { kakao } = window;
        const map = new kakao.maps.Map(elRef.current, {
          center: new kakao.maps.LatLng(
            HONGCHEON_RIVER_CENTER.lat,
            HONGCHEON_RIVER_CENTER.lng
          ),
          level: 9,
        });
        mapRef.current = map;
        infoRef.current = new kakao.maps.InfoWindow({ removable: true });

        // 지도 빈 곳을 클릭하면 열린 설명창을 닫는다 (X 버튼은 그대로 유지)
        kakao.maps.event.addListener(map, "click", () => {
          infoRef.current?.close?.();
        });

        const geocoder = new kakao.maps.services.Geocoder();
        const ps = new kakao.maps.services.Places();

        const addMarker = (place: Place, lat: number, lng: number) => {
          const pos = new kakao.maps.LatLng(lat, lng);
          const color = CATEGORY_COLORS[place.category];

          // 카테고리 색상 핀 (HTML 커스텀 오버레이)
          const el = document.createElement("div");
          el.title = place.name;
          el.style.cssText = `cursor:pointer;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;`;
          el.innerHTML = `<span style="display:flex;transform:rotate(45deg);">${categoryMarkerSvg(
            place.category,
            "#fff",
            15
          )}</span>`;
          el.addEventListener("click", () => {
            infoRef.current.setContent(
              `<div style="padding:9px 12px;width:200px;font-size:13px;font-family:system-ui;line-height:1.45;word-break:keep-all;white-space:normal;">
                 <b style="display:flex;align-items:center;gap:5px;">${categoryMarkerSvg(
                   place.category,
                   CATEGORY_COLORS[place.category],
                   14
                 )}<span>${place.name}</span></b>
                 <div style="margin-top:3px;color:#666;font-size:12px;word-break:keep-all;">${place.region}</div>
               </div>`
            );
            infoRef.current.setPosition(pos);
            infoRef.current.open(map);
          });

          const overlay = new kakao.maps.CustomOverlay({
            position: pos,
            content: el,
            xAnchor: 0.5,
            yAnchor: 1,
            clickable: true,
          });
          overlay.setMap(map);
          markersRef.current.push({ overlay, category: place.category });
        };

        const buildMarkers = () => {
          if (places.length === 0) {
            setStatus("ready");
            return;
          }
          let pending = places.length;
          const done = () => {
            pending -= 1;
            if (pending <= 0 && !cancelled) {
              setStatus("ready");
              applyFilter(activeCategory);
            }
          };
          places.forEach((place) => {
            // 1) 검증된 좌표 우선
            if (place.location) {
              addMarker(place, place.location.lat, place.location.lng);
              done();
              return;
            }
            // 2) 장소명 검색
            ps.keywordSearch(place.mapQuery, (data: any[], st: string) => {
              if (st === kakao.maps.services.Status.OK && data[0]) {
                addMarker(place, parseFloat(data[0].y), parseFloat(data[0].x));
                done();
                return;
              }
              // 3) 주소 검색(괄호 보조설명 제거)
              const addr = place.region.replace(/\s*\(.*\)\s*$/, "");
              geocoder.addressSearch(addr, (res: any[], st2: string) => {
                if (st2 === kakao.maps.services.Status.OK && res[0]) {
                  addMarker(place, parseFloat(res[0].y), parseFloat(res[0].x));
                }
                done();
              });
            });
          });
        };

        // 지도 타일이 로드(레이아웃 완료)된 뒤 마커를 추가해야 CustomOverlay가 확실히 렌더된다.
        let built = false;
        const onReady = () => {
          if (built || cancelled) return;
          built = true;
          buildMarkers();
        };
        kakao.maps.event.addListener(map, "tilesloaded", onReady);
        setTimeout(onReady, 1500); // 안전장치
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 카테고리 변경 시 마커 필터링
  useEffect(() => {
    if (status === "ready") applyFilter(activeCategory);
  }, [activeCategory, status, applyFilter]);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-neutral-200 ${
        className ?? "h-[60vh]"
      }`}
    >
      <div ref={elRef} className="h-full w-full" />
      {status !== "ready" && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-50/90 px-4 text-center text-sm text-neutral-500 backdrop-blur-sm">
          {status === "loading" ? (
            "지도를 불러오는 중…"
          ) : (
            <div>
              <p className="font-semibold text-neutral-700">
                지도를 표시할 수 없습니다
              </p>
              <p className="mt-1">
                {KAKAO_KEY
                  ? "Kakao 지도 SDK 로드에 실패했습니다. 카카오 개발자센터의 플랫폼 도메인 등록을 확인하세요."
                  : "환경변수 NEXT_PUBLIC_KAKAO_MAP_KEY 가 설정되지 않았습니다. (목록은 정상 동작합니다)"}
              </p>
            </div>
          )}
        </div>
      )}
      {status === "ready" && (
        <>
          {/* 색상 범례 */}
          <div className="pointer-events-none absolute right-3 top-3 flex flex-col gap-1 rounded-xl bg-white/90 px-3 py-2 text-xs text-neutral-700 shadow">
            {(["camping", "fishing", "carcamping"] as PlaceCategory[]).map(
              (c) => (
                <div key={c} className="flex items-center gap-1.5">
                  <span
                    className="grid h-4 w-4 place-items-center rounded-full text-white"
                    style={{ background: CATEGORY_COLORS[c] }}
                  >
                    <CategoryIcon category={c} className="h-2.5 w-2.5" />
                  </span>
                  {CATEGORY_LABELS[c]}
                </div>
              )
            )}
          </div>
          {/* 현재 필터 배지 */}
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-xs text-neutral-600 shadow">
            {activeCategory === "all"
              ? "전체 스팟"
              : `${CATEGORY_LABELS[activeCategory]} 만 표시 중`}
          </div>
        </>
      )}
    </div>
  );
}
