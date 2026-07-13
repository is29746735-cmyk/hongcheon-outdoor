import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GearRecommendPopup from "@/components/GearRecommendPopup";
import { auth } from "@/auth";
import { SITE } from "@/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "홍천",
    "홍천강",
    "캠핑",
    "낚시",
    "차박",
    "캠핑장",
    "낚시터",
    "오토캠핑",
    "강원 여행",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: `${SITE.name} — 홍천 캠핑·낚시·차박 큐레이션`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
    images: ["/og-default.png"],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 로그인 사용자 식별자(비로그인은 null) — 용품 팝업의 '하루 숨김'을 계정별로
  // 구분해, 로그아웃하거나 다른 계정으로 로그인하면 다시 노출되도록 한다.
  const session = await auth().catch(() => null);
  const userKey = session?.user?.id ?? null;

  return (
    <html lang="ko">
      <body className="flex min-h-screen flex-col bg-sand-50 text-neutral-800 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <GearRecommendPopup userKey={userKey} />
      </body>
    </html>
  );
}
