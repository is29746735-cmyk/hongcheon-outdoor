import Link from "next/link";
import type { Place } from "@/types/place";
import { CATEGORY_LABELS } from "@/constants";
import PlaceImage from "@/components/PlaceImage";
import MapLinkButtons from "@/components/MapLinkButtons";

interface PlaceCardProps {
  place: Place;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <Link href={`/places/${place.id}`} className="relative block">
        <PlaceImage place={place} className="aspect-[4/3]" />
        {/* 하단 그라디언트 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-forest-700 shadow-sm backdrop-blur">
          {CATEGORY_LABELS[place.category]}
        </span>
        {place.connectedFishing && (
          <span className="absolute right-3 top-3 rounded-full bg-sky-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            🎣 캠핑+낚시
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/places/${place.id}`} className="block">
          <h3 className="text-[15px] font-bold leading-snug text-neutral-900 transition-colors group-hover:text-forest-700">
            {place.name}
            {place.official && (
              <span className="ml-1.5 align-middle rounded bg-forest-50 px-1.5 py-0.5 text-[10px] font-bold text-forest-600">
                공식
              </span>
            )}
          </h3>
        </Link>
        <p className="mt-1.5 flex items-center gap-1 text-xs text-neutral-500">
          <span className="text-forest-500">📍</span>
          <span className="truncate">{place.region}</span>
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-600">
          {place.summary}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {place.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-sand-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-auto border-t border-neutral-100 pt-3.5">
          <MapLinkButtons place={place} compact />
        </div>
      </div>
    </div>
  );
}
