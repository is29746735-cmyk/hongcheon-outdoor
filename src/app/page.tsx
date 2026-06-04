import Link from "next/link";
import OutdoorIndexWidget from "@/components/OutdoorIndexWidget";
import PlaceBrowser from "@/components/PlaceBrowser";
import { SITE } from "@/constants";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      {/* 오늘의 아웃도어 지수 위젯 */}
      <div className="pt-6">
        <OutdoorIndexWidget />
      </div>

      {/* Hero */}
      <section className="py-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          홍천에서 즐기는 <span className="text-forest-600">캠핑 &amp; 낚시</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-neutral-600">
          {SITE.description}
        </p>
        <Link
          href="#list"
          className="mt-6 inline-block rounded-full bg-forest-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-forest-700"
        >
          목록 바로보기 ↓
        </Link>
      </section>

      {/* 장소 목록 (메인에서 바로 보고 고르기) */}
      <PlaceBrowser />
    </div>
  );
}
