import type { MetadataRoute } from "next";
import { SITE } from "@/constants";

/**
 * 검색 크롤러 정책 — 개인화 페이지(/saved)·API·검토 전용 페이지(/type-lab)는 색인 제외,
 * 사이트맵 안내.
 */
export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/saved", "/api/", "/type-lab"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
