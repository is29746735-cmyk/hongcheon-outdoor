import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SITE } from "@/constants";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const notoSerifKr = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${notoSerifKr.variable}`}>
      <body className="flex min-h-screen flex-col bg-sand-50 text-neutral-800 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
