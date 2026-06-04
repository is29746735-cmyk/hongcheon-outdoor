import { Tent, Fish, Caravan, type LucideIcon } from "lucide-react";
import type { PlaceCategory } from "@/types/place";

/** 카테고리별 라인 아이콘 (lucide) */
export const CATEGORY_LUCIDE: Record<PlaceCategory, LucideIcon> = {
  camping: Tent,
  fishing: Fish,
  carcamping: Caravan,
};

export function CategoryIcon({
  category,
  className,
}: {
  category: PlaceCategory;
  className?: string;
}) {
  const Icon = CATEGORY_LUCIDE[category];
  return <Icon className={className} strokeWidth={2} aria-hidden />;
}

/**
 * 카카오 지도 마커/팝업용 SVG 문자열(React 밖에서 사용).
 * lucide 와 동일 결의 라인 아이콘.
 */
export function categoryMarkerSvg(
  category: PlaceCategory,
  color = "#fff",
  size = 15
): string {
  const open = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">`;
  const paths: Record<PlaceCategory, string> = {
    camping: `<path d="M3.5 21 14 3"/><path d="M20.5 21 10 3"/><path d="M15.5 21 12 15l-3.5 6"/><path d="M2 21h20"/>`,
    fishing: `<path d="M2 12s3.5-5 9-5c4 0 6.5 2 7.5 5-1 3-3.5 5-7.5 5-5.5 0-9-5-9-5Z"/><path d="M18.5 9.5 22 7v10l-3.5-2.5"/>`,
    carcamping: `<path d="M2 16V9a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v7"/><path d="M16 11h2l3 3v2h-2"/><path d="M2 16h3"/><path d="M12 16h5"/><circle cx="7.5" cy="16.5" r="1.6"/><circle cx="18.5" cy="16.5" r="1.6"/>`,
  };
  return `${open}${paths[category]}</svg>`;
}
