import { NextRequest, NextResponse } from "next/server";
import { getAllPlaces, getPlacesByCategory } from "@/data/places";
import type { PlaceCategory } from "@/types/place";

const VALID_CATEGORIES: PlaceCategory[] = ["camping", "fishing", "carcamping"];

/**
 * GET /api/places
 * 홍천 아웃도어 장소 데이터 공개 API.
 * 텔레그램 봇·외부 서비스에서 활용 가능.
 *
 * Query params:
 *   category  camping | fishing | carcamping  (없으면 전체)
 *   featured  true  (featured 장소만)
 *   q         검색어 (name, summary, tags에서 포함 검색)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const featuredOnly = searchParams.get("featured") === "true";
  const query = searchParams.get("q")?.trim().toLowerCase();

  let places = category && VALID_CATEGORIES.includes(category as PlaceCategory)
    ? getPlacesByCategory(category as PlaceCategory)
    : getAllPlaces();

  if (featuredOnly) {
    places = places.filter((p) => p.featured);
  }

  if (query) {
    places = places.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.summary.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query)) ||
        (p.filterTags ?? []).some((t) => t.toLowerCase().includes(query))
    );
  }

  // 외부 노출용 — 내부 전용 필드(partnerId 등)는 제외
  const result = places.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    summary: p.summary,
    region: p.region,
    phone: p.phone ?? null,
    location: p.location ?? null,
    tags: p.tags,
    filterTags: p.filterTags ?? [],
    activities: p.activities ?? [],
    official: p.official ?? false,
    connectedFishing: p.connectedFishing ?? false,
    connectionNote: p.connectionNote ?? null,
    featured: p.featured ?? false,
    sourceName: p.sourceName ?? null,
    sourceUrl: p.sourceUrl ?? null,
    mapQuery: p.mapQuery,
  }));

  return NextResponse.json(
    { count: result.length, places: result },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
