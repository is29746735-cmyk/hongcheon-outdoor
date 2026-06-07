"use client";

import { useEffect, useRef, useState } from "react";
import {
  UtensilsCrossed,
  Landmark,
  Coffee,
  Store,
  Route as RouteIcon,
  MapPin,
  Navigation,
  type LucideIcon,
} from "lucide-react";
import type { Place } from "@/types/place";
import { KAKAO_KEY, loadKakaoSdk } from "@/lib/kakao";

/**
 * AI 추천 코스 — 장소 인근의 실제(카카오 등록) 맛집·관광지·카페를 찾아
 * 최근접 이웃(nearest-neighbor)으로 동선을 최적화해 지도에 선으로 표시한다.
 * 가까운 연계가 어려운 지역이면 동선을 그리지 않고 주변 추천 활동만 안내한다.
 * (모든 장소는 카카오 DB의 실제 등록 장소 — 임의 생성하지 않음)
 */

interface Stop {
  label: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  color: string;
}

const PLACE_COLOR = "#206e47";
const CATS: {
  code?: string;
  fallback?: string;
  keyword?: string;
  label: string;
  color: string;
  Icon: LucideIcon;
}[] = [
  { code: "FD6", label: "맛집", color: "#e2562a", Icon: UtensilsCrossed },
  { code: "AT4", fallback: "CT1", label: "관광지", color: "#2563eb", Icon: Landmark },
  { code: "CE7", label: "카페", color: "#7c3aed", Icon: Coffee },
  { keyword: "전통시장", label: "전통시장", color: "#0891b2", Icon: Store },
];

const SEARCH_RADIUS = 7000; // m — 이 안에서만 "가까운" 연계로 인정

function distanceM(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371000;
  const toR = (x: number) => (x * Math.PI) / 180;
  const dLat = toR(b.lat - a.lat);
  const dLng = toR(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function fmtKm(m: number): string {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

/** 출발점에서 시작하는 최근접 이웃 경로 정렬 */
function nearestNeighborOrder(
  start: { lat: number; lng: number },
  pois: Stop[]
): Stop[] {
  const order: Stop[] = [];
  const remaining = [...pois];
  let cur: { lat: number; lng: number } = start;
  while (remaining.length) {
    let bi = 0;
    let bd = Infinity;
    remaining.forEach((p, i) => {
      const d = distanceM(cur, p);
      if (d < bd) {
        bd = d;
        bi = i;
      }
    });
    const [next] = remaining.splice(bi, 1);
    order.push(next);
    cur = next;
  }
  return order;
}

export default function CourseMap({ place }: { place: Place }) {
  const loc = place.location;
  const elRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [steps, setSteps] = useState<Stop[]>([]);
  const [feasible, setFeasible] = useState(false);

  useEffect(() => {
    if (!KAKAO_KEY || !loc) {
      setStatus("error");
      return;
    }
    let cancelled = false;

    loadKakaoSdk(KAKAO_KEY)
      .then(() => {
        if (cancelled || !elRef.current) return;
        const { kakao } = window;
        const center = new kakao.maps.LatLng(loc.lat, loc.lng);
        const map = new kakao.maps.Map(elRef.current, { center, level: 6 });
        map.setZoomable(false);
        map.setDraggable(false);
        const ps = new kakao.maps.services.Places();
        const info = new kakao.maps.InfoWindow({ removable: true });

        const opts = {
          location: center,
          radius: SEARCH_RADIUS,
          sort: "distance",
          size: 5,
        };
        // 출발 장소 자신(같은 위치/이름)은 제외하고 가장 가까운 곳 선택
        const pickNearest = (data: any[], st: string, label: string, color: string) => {
          if (st !== kakao.maps.services.Status.OK) return null;
          const d = data.find((x: any) => {
            const p = { lat: +x.y, lng: +x.x };
            const n: string = x.place_name || "";
            return !(
              distanceM(loc, p) < 120 ||
              n.includes(place.name) ||
              place.name.includes(n)
            );
          });
          return d
            ? {
                label,
                name: d.place_name,
                address: d.road_address_name || d.address_name || "",
                lat: +d.y,
                lng: +d.x,
                color,
              }
            : null;
        };

        // 카테고리(코드) 또는 키워드로 가장 가까운 1곳 검색
        const searchOne = (cat: (typeof CATS)[number]): Promise<Stop | null> =>
          new Promise((resolve) => {
            const { label, color } = cat;
            if (cat.keyword) {
              ps.keywordSearch(
                cat.keyword,
                (data: any[], st: string) =>
                  resolve(pickNearest(data, st, label, color)),
                opts
              );
              return;
            }
            const run = (c: string, retry: boolean) =>
              ps.categorySearch(
                c,
                (data: any[], st: string) => {
                  const stop = pickNearest(data, st, label, color);
                  if (stop) resolve(stop);
                  else if (cat.fallback && retry) run(cat.fallback, false);
                  else resolve(null);
                },
                opts
              );
            run(cat.code as string, true);
          });

        Promise.all(CATS.map((c) => searchOne(c))).then((results) => {
          if (cancelled) return;
          const seen = new Set<string>();
          const found = results.filter((r): r is Stop => {
            if (!r || seen.has(r.name)) return false;
            seen.add(r.name);
            return true;
          });
          const ordered = nearestNeighborOrder(loc, found);
          const canRoute = found.length >= 2;

          const bounds = new kakao.maps.LatLngBounds();
          bounds.extend(center);

          // 출발(현재 장소) 마커
          const startEl = document.createElement("div");
          startEl.style.cssText = `transform:translate(-50%,-50%);display:flex;align-items:center;gap:4px;background:${PLACE_COLOR};color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:9999px;border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,.3);white-space:nowrap;`;
          startEl.textContent = "출발";
          new kakao.maps.CustomOverlay({
            position: center,
            content: startEl,
            yAnchor: 0.5,
            xAnchor: 0.5,
          }).setMap(map);

          // 코스 선(동선) — 연계 가능할 때만
          if (canRoute) {
            const path = [center, ...ordered.map((s) => new kakao.maps.LatLng(s.lat, s.lng))];
            new kakao.maps.Polyline({
              path,
              strokeWeight: 4,
              strokeColor: PLACE_COLOR,
              strokeOpacity: 0.85,
              strokeStyle: "solid",
            }).setMap(map);
          }

          // 각 스팟 번호 마커
          ordered.forEach((s, i) => {
            const pos = new kakao.maps.LatLng(s.lat, s.lng);
            const el = document.createElement("div");
            el.title = s.name;
            el.style.cssText = `cursor:pointer;transform:translate(-50%,-50%);width:22px;height:22px;border-radius:50%;background:${s.color};color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.3);`;
            el.textContent = String(i + 1);
            el.addEventListener("click", () => {
              info.setContent(
                `<div style="padding:8px 10px;width:190px;font-size:13px;font-family:system-ui;line-height:1.45;word-break:keep-all;"><b>${i + 1}. ${s.name}</b><div style="margin-top:2px;color:#888;font-size:11px;">${s.label}</div><div style="margin-top:3px;color:#666;font-size:12px;">${s.address}</div></div>`
              );
              info.setPosition(pos);
              info.open(map);
            });
            new kakao.maps.CustomOverlay({
              position: pos,
              content: el,
              yAnchor: 0.5,
              xAnchor: 0.5,
              clickable: true,
            }).setMap(map);
            bounds.extend(pos);
          });

          if (!bounds.isEmpty()) map.setBounds(bounds);
          setSteps(ordered);
          setFeasible(canRoute);
          setStatus("ready");
        });
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!loc) return null;

  return (
    <section className="mt-8">
      <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900">
        <RouteIcon className="h-5 w-5 text-forest-600" strokeWidth={2} />
        AI 추천 코스
      </h2>
      <p className="mt-1 text-sm text-neutral-600">
        이 장소 주변의 실제 등록된 맛집·관광지·카페를 가까운 순으로 이어 동선을
        제안합니다.
      </p>

      {/* 지도 */}
      <div className="relative mt-3 h-[320px] w-full overflow-hidden rounded-2xl border border-neutral-200">
        <div ref={elRef} className="isolate h-full w-full" />
        {status !== "ready" && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-50/90 px-4 text-center text-sm text-neutral-500">
            {status === "loading"
              ? "주변 코스를 분석하는 중…"
              : KAKAO_KEY
              ? "코스를 표시할 수 없습니다."
              : "지도 키가 설정되지 않았습니다."}
          </div>
        )}
      </div>

      {/* 코스 단계 / 추천 활동 */}
      {status === "ready" &&
        (steps.length === 0 ? (
          <p className="mt-3 rounded-xl bg-sand-100 px-4 py-3 text-sm text-neutral-600">
            주변에 연계할 만한 장소 정보가 충분하지 않습니다. 캠핑·낚시 등 이
            장소 본연의 활동을 즐겨보세요.
          </p>
        ) : (
          <>
            {!feasible && (
              <p className="mt-3 text-sm text-amber-700">
                이 지역은 가까운 연계 동선이 어려워, 주변에서 즐길 만한 활동만
                안내합니다.
              </p>
            )}
            <ol className="mt-3 space-y-2">
              <li className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-forest-600 text-white">
                  <MapPin className="h-4 w-4" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neutral-900">
                    {place.name}
                  </p>
                  <p className="text-xs text-neutral-500">출발 (현재 장소)</p>
                </div>
              </li>
              {steps.map((s, i) => {
                const meta = CATS.find((c) => c.label === s.label);
                const Icon = meta?.Icon ?? MapPin;
                const dist = distanceM(
                  i === 0 ? loc : steps[i - 1],
                  s
                );
                return (
                  <li
                    key={`${s.name}-${i}`}
                    className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2.5"
                  >
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white"
                      style={{ background: s.color }}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-neutral-900">
                        {feasible ? `${i + 1}. ` : ""}
                        {s.name}
                        <span className="ml-1.5 text-xs font-medium text-neutral-400">
                          {s.label}
                        </span>
                      </p>
                      <p className="truncate text-xs text-neutral-500">
                        {s.address}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {feasible && (
                        <span className="text-xs font-medium text-neutral-400">
                          ~{fmtKm(dist)}
                        </span>
                      )}
                      <a
                        href={`https://map.kakao.com/?sName=${encodeURIComponent(
                          place.name
                        )}&eName=${encodeURIComponent(s.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 rounded-full bg-forest-50 px-2 py-0.5 text-[11px] font-semibold text-forest-700 hover:bg-forest-100"
                      >
                        <Navigation className="h-3 w-3" strokeWidth={2.2} />
                        길찾기
                      </a>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="mt-2 text-xs text-neutral-400">
              ※ 동선은 직선 거리 기준 자동 제안이며, 실제 도로 경로·영업 여부는
              방문 전 확인하세요.
            </p>
          </>
        ))}
    </section>
  );
}
