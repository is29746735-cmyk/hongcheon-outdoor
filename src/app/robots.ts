import type { MetadataRoute } from "next";
import { SITE } from "@/constants";

/** 검색 크롤러 정책 — 개인화 페이지(/saved)와 API는 색인 제외, 사이트맵 안내. */
export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/saved", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
