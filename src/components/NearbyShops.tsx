import {
  Utensils,
  Backpack,
  Coffee,
  Store,
  MapPin,
  Navigation,
  type LucideIcon,
} from "lucide-react";
import type { NearbyShop, ShopCategory } from "@/types/place";
import { getShopDirectionsLink } from "@/lib/map-links";

const SHOP_META: Record<
  ShopCategory,
  { label: string; Icon: LucideIcon; chip: string }
> = {
  food: { label: "맛집", Icon: Utensils, chip: "bg-rose-50 text-rose-600" },
  rental: {
    label: "장비 대여",
    Icon: Backpack,
    chip: "bg-forest-50 text-forest-700",
  },
  cafe: { label: "카페", Icon: Coffee, chip: "bg-amber-50 text-amber-700" },
  store: { label: "상점", Icon: Store, chip: "bg-sky-50 text-sky-700" },
};

/**
 * 스팟 상세 하단 '함께 방문하면 좋은 로컬 스토어' 섹션.
 * 주변 맛집·장비 대여점 등을 부드러운 그리드 카드로 보여주고,
 * 각 카드에서 카카오맵 길찾기로 바로 이동할 수 있다.
 */
export default function NearbyShops({ shops }: { shops: NearbyShop[] }) {
  if (!shops || shops.length === 0) return null;

  return (
    <section className="mt-8" aria-label="함께 방문하면 좋은 로컬 스토어">
      <h2 className="flex items-center gap-2 text-base font-extrabold text-neutral-900">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-forest-50 text-forest-700">
          <Store className="h-4 w-4" strokeWidth={2} />
        </span>
        함께 방문하면 좋은 로컬 스토어
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        주변 맛집·장비 대여점을 한 번에 둘러보고 길찾기로 바로 이동하세요.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shops.map((shop, i) => {
          const meta = SHOP_META[shop.category];
          const Icon = meta.Icon;
          return (
            <div
              key={`${shop.name}-${i}`}
              className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-forest-200 hover:shadow-card-hover"
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${meta.chip}`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${meta.chip}`}
                  >
                    {meta.label}
                  </span>
                  <h3 className="mt-1 truncate text-sm font-bold text-neutral-900">
                    {shop.name}
                  </h3>
                </div>
              </div>

              {shop.description && (
                <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-neutral-600">
                  {shop.description}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between gap-2 pt-3.5">
                {shop.distance ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500">
                    <MapPin
                      className="h-3 w-3 shrink-0 text-forest-500"
                      strokeWidth={2}
                    />
                    {shop.distance}
                  </span>
                ) : (
                  <span />
                )}
                <a
                  href={getShopDirectionsLink(shop)}
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

      <p className="mt-2 text-[11px] text-neutral-400">
        * 주변 상점 정보는 예시이며, 실제 검증된 상호로 교체할 수 있습니다. 길찾기는
        지역·업종 검색으로 연결됩니다.
      </p>
    </section>
  );
}
