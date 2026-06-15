"use client";

import { useEffect, useState } from "react";
import {
  Store,
  ShoppingCart,
  Backpack,
  Fuel,
  MapPin,
  Navigation,
  Phone,
  type LucideIcon,
} from "lucide-react";
import type { Place } from "@/types/place";
import { KAKAO_KEY, loadKakaoSdk } from "@/lib/kakao";

/**
 * 함께 방문하면 좋은 로컬 스토어.
 * 이 장소(캠핑장·낚시터 등) 주변의 '실제 카카오 등록' 가게 중 종류별로
 * 가장 가까운 한 곳씩만 찾아 보여준다. 길찾기는 이 장소에서 출발(from)하여
 * 해당 가게(to)로 연결되며, 차로/도보 시간은 카카오맵에서 정확히 확인한다.
 * (임의 좌표·임의 시간을 만들지 않음 — 표시 거리는 직선 거리)
 */

interface FoundShop {
  label: string;
  Icon: LucideIcon;
  chip: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distM: number;
  phone: string;
}

const CATS: {
  label: string;
  code?: string;
  keyword?: string;
  /** 키워드 검색 시, 결과의 category_name 에 이 중 하나가 포함돼야 채택 (오검색 방지) */
  catFilter?: string[];
  Icon: LucideIcon;
  chip: string;
}[] = [
  { label: "편의점", code: "CS2", Icon: Store, chip: "bg-sky-50 text-sky-700" },
  {
    label: "마트",
    code: "MT1",
    Icon: ShoppingCart,
    chip: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "낚시",
    keyword: "낚시",
    catFilter: ["낚시", "스포츠,레저"],
    Icon: Backpack,
    chip: "bg-forest-50 text-forest-700",
  },
  { label: "주유소", code: "OL7", Icon: Fuel, chip: "bg-amber-50 text-amber-700" },
];

const RADIUS = 10000; // m — 농촌 지역 특성상 넉넉히 (없으면 카드 생략)

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

export default function NearbyShops({ place }: { place: Place }) {
  const loc = place.location;
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [shops, setShops] = useState<FoundShop[]>([]);

  useEffect(() => {
    if (!KAKAO_KEY || !loc) {
      setStatus("error");
      return;
    }
    let cancelled = false;

    loadKakaoSdk(KAKAO_KEY)
      .then(() => {
        if (cancelled) return;
        const { kakao } = window;
        const center = new kakao.maps.LatLng(loc.lat, loc.lng);
        const ps = new kakao.maps.services.Places();
        const opts = {
          location: center,
          radius: RADIUS,
          sort: "distance",
          size: 5,
        };

        // 가장 가까운 1곳 선택 — 이 장소 자신/너무 가까운 동일 지점은 제외
        const pick = (
          data: any[],
          st: string,
          cat: (typeof CATS)[number]
        ): FoundShop | null => {
          if (st !== kakao.maps.services.Status.OK || !data || !data.length)
            return null;
          const d = data.find((x: any) => {
            const p = { lat: +x.y, lng: +x.x };
            const n: string = x.place_name || "";
            const c: string = x.category_name || "";
            return (
              distanceM(loc, p) > 50 &&
              !n.includes(place.name) &&
              !place.name.includes(n) &&
              (!cat.catFilter || cat.catFilter.some((f) => c.includes(f)))
            );
          });
          if (!d) return null;
          const p = { lat: +d.y, lng: +d.x };
          return {
            label: cat.label,
            Icon: cat.Icon,
            chip: cat.chip,
            name: d.place_name,
            address: d.road_address_name || d.address_name || "",
            lat: p.lat,
            lng: p.lng,
            distM: distanceM(loc, p),
            phone: d.phone || "",
          };
        };

        const searchOne = (
          cat: (typeof CATS)[number]
        ): Promise<FoundShop | null> =>
          new Promise((resolve) => {
            const cb = (data: any[], st: string) => resolve(pick(data, st, cat));
            if (cat.code) ps.categorySearch(cat.code, cb, opts);
            else ps.keywordSearch(cat.keyword as string, cb, opts);
          });

        Promise.all(CATS.map(searchOne)).then((results) => {
          if (cancelled) return;
          // 같은 가게가 여러 종류로 중복되면 CATS 우선순위상 처음 것만 유지
          const seen = new Set<string>();
          const found: FoundShop[] = [];
          for (const r of results) {
            if (r && !seen.has(r.name)) {
              seen.add(r.name);
              found.push(r);
            }
          }
          found.sort((a, b) => a.distM - b.distM);
          setShops(found);
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
    <section className="mt-8" aria-label="함께 방문하면 좋은 로컬 스토어">
      <h2 className="flex items-center gap-2 text-base font-extrabold text-neutral-900">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-forest-50 text-forest-700">
          <Store className="h-4 w-4" strokeWidth={2} />
        </span>
        함께 방문하면 좋은 로컬 스토어
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        이 장소에서 가장 가까운 실제 편의점·마트·낚시·주유소를 안내합니다.
        길찾기는 이 장소에서 출발합니다.
      </p>

      {status === "loading" && (
        <p className="mt-4 rounded-xl bg-sand-100 px-4 py-3 text-sm text-neutral-500">
          주변 가게를 찾는 중…
        </p>
      )}
      {status === "error" && (
        <p className="mt-4 rounded-xl bg-sand-100 px-4 py-3 text-sm text-neutral-500">
          {KAKAO_KEY
            ? "주변 가게 정보를 불러올 수 없습니다."
            : "지도 키가 설정되지 않았습니다."}
        </p>
      )}
      {status === "ready" && shops.length === 0 && (
        <p className="mt-4 rounded-xl bg-sand-100 px-4 py-3 text-sm text-neutral-500">
          주변에서 등록된 가게를 찾지 못했습니다.
        </p>
      )}

      {status === "ready" && shops.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop, i) => {
            const Icon = shop.Icon;
            const href = `https://map.kakao.com/link/from/${encodeURIComponent(
              place.name
            )},${loc.lat},${loc.lng}/to/${encodeURIComponent(shop.name)},${
              shop.lat
            },${shop.lng}`;
            return (
              <div
                key={`${shop.name}-${i}`}
                className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-forest-200 hover:shadow-card-hover"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${shop.chip}`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${shop.chip}`}
                    >
                      {shop.label}
                    </span>
                    <h3 className="mt-1 truncate text-sm font-bold text-neutral-900">
                      {shop.name}
                    </h3>
                  </div>
                </div>

                {shop.address && (
                  <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-neutral-600">
                    {shop.address}
                  </p>
                )}
                {shop.phone && (
                  <a
                    href={`tel:${shop.phone}`}
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-neutral-500 transition hover:text-forest-600"
                  >
                    <Phone className="h-3 w-3" strokeWidth={2} />
                    {shop.phone}
                  </a>
                )}

                <div className="mt-auto flex items-center justify-between gap-2 pt-3.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500">
                    <MapPin
                      className="h-3 w-3 shrink-0 text-forest-500"
                      strokeWidth={2}
                    />
                    직선 {fmtKm(shop.distM)}
                  </span>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-forest-50 px-2.5 py-1 text-xs font-semibold text-forest-700 transition hover:bg-forest-100"
                  >
                    <Navigation className="h-3 w-3" strokeWidth={2.2} />
                    길찾기
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-2 text-[11px] text-neutral-400">
        * 카카오 등록 정보 기준 종류별 가장 가까운 한 곳입니다. 표시 거리는 직선
        거리이며, 실제 차로·도보 시간과 영업 여부는 길찾기(카카오맵)에서
        확인하세요.
      </p>
    </section>
  );
}
