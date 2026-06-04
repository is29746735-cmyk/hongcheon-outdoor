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
    <div className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 transition-shadow hover:shadow-lg">
      <Link href={`/places/${place.id}`} className="group relative block">
        <PlaceImage place={place} className="aspect-[4/3]" />
        <span className="absolute left-3 top-3 rounded-full bg-forest-600 px-2.5 py-1 text-xs font-semibold text-white">
          {CATEGORY_LABELS[place.category]}
        </span>
        {place.connectedFishing && (
          <span className="absolute right-3 top-3 rounded-full bg-sky-600 px-2.5 py-1 text-xs font-semibold text-white">
            🎣 캠핑+낚시
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/places/${place.id}`}>
          <h3 className="font-semibold text-neutral-900 hover:text-forest-600">
            {place.name}
            {place.official && (
              <span className="ml-2 align-middle text-xs font-medium text-forest-600">
                공식
              </span>
            )}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-neutral-500">📍 {place.region}</p>
        <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
          {place.summary}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {place.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-forest-50 px-2 py-0.5 text-xs text-forest-700"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* 외부 지도 링크 */}
        <div className="mt-auto pt-4">
          <MapLinkButtons place={place} compact />
        </div>
      </div>
    </div>
  );
}
