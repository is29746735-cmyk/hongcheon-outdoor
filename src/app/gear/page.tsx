import type { Metadata } from "next";
import GearCatalog from "@/components/gear/GearCatalog";

export const metadata: Metadata = {
  title: "낚시·캠핑 용품",
  description:
    "홍천강 낚시·캠핑 준비물부터 감성 아이템·먹거리까지 한곳에서. 품목별 구매 팁과 실사용 주의사항을 함께 정리했습니다.",
  alternates: { canonical: "/gear" },
};

export default function GearPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header>
        <h1 className="text-2xl font-extrabold text-forest-800">용품</h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          홍천강 낚시와 캠핑에 필요한 용품을 한곳에 모았습니다. 품목을 누르면 설명과
          구매 팁·주의사항을 볼 수 있습니다.
        </p>

        <p className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs leading-relaxed text-neutral-500">
          쇼핑 버튼은 쿠팡 파트너스 링크로 운영될 예정입니다. 이 페이지는 쿠팡
          파트너스 활동의 일환으로, 구매 시 일정 수수료를 받을 수 있습니다. 현재는
          예시로, 실제 링크는 아직 연결되어 있지 않습니다.
        </p>
      </header>

      <GearCatalog />
    </main>
  );
}
