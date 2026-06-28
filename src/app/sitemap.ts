import type { MetadataRoute } from "next";
import { getAllPlaces } from "@/data/places";
import { SITE } from "@/constants";

/** 홈 + 모든 장소 상세(SSG)를 사이트맵에 노출. /saved·/api는 robots에서 제외. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url.replace(/\/$/, "");
  const now = new Date();

  const spots: MetadataRoute.Sitemap = getAllPlaces().map((p) => ({
    url: `${base}/spots/${p.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...spots,
  ];
}
