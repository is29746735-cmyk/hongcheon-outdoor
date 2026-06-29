import type { Metadata } from "next";
import { Fish, Tent, ShoppingBag } from "lucide-react";
import { getGearByCategory, type GearCategory, type GearItem } from "@/data/gear";

export const metadata: Metadata = {
  title: "낚시·캠핑 용품",
  description:
    "홍천강 낚시와 캠핑에 필요한 용품을 한곳에서. 쿠팡·네이버 등 쇼핑몰에서 바로 찾아볼 수 있도록 정리했습니다.",
  alternates: { canonical: "/gear" },
};

const SECTIONS: {
  key: GearCategory;
  label: string;
  Icon: typeof Fish;
}[] = [
  { key: "fishing", label: "낚시용품", Icon: Fish },
  { key: "camping", label: "캠핑용품", Icon: Tent },
];

function GearCard({ item }: { item: GearItem }) {
  return (
    <div className="flex flex-col rounded-2xl bg-white p-5 shadow-card">
      <h3 className="text-base font-bold text-neutral-900">{item.name}</h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-neutral-600">
        {item.summary}
      </p>

      {item.tags && item.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-forest-50 px-2.5 py-1 text-xs font-medium text-forest-700"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {item.shops.map((shop) =>
          shop.url ? (
            <a
              key={shop.store}
              href={shop.url}
              target="_blank"
              rel="noopener noreferrer sponsored nofollow"
              className="inline-flex items-center gap-1.5 rounded-xl bg-forest-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-forest-700"
            >
              <ShoppingBag size={15} strokeWidth={2.2} />
              {shop.store}에서 보기
            </a>
          ) : (
            <span
              key={shop.store}
              aria-disabled="true"
              title="제휴 링크 준비 중 (예시)"
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-sm font-semibold text-neutral-400"
            >
              <ShoppingBag size={15} strokeWidth={2.2} />
              {shop.store}
            </span>
          )
        )}
      </div>
    </div>
  );
}

export default function GearPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header>
        <h1 className="text-2xl font-extrabold text-forest-800">용품</h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          홍천강 낚시와 캠핑에 필요한 용품을 한곳에 모았습니다. 쿠팡·네이버 등
          쇼핑몰에서 바로 찾아볼 수 있습니다.
        </p>

        <nav className="mt-5 flex gap-2">
          {SECTIONS.map(({ key, label, Icon }) => (
            <a
              key={key}
              href={`#${key}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-forest-50 px-3.5 py-2 text-sm font-semibold text-forest-700 transition-colors hover:bg-forest-100"
            >
              <Icon size={15} strokeWidth={2.2} />
              {label}
            </a>
          ))}
        </nav>

        <p className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs leading-relaxed text-neutral-500">
          이 페이지의 쇼핑 버튼은 제휴(쿠팡 파트너스·네이버 등) 링크로 운영될
          예정이며, 구매 시 일정 수수료를 받을 수 있습니다. 현재는 예시로, 실제
          링크는 아직 연결되어 있지 않습니다.
        </p>
      </header>

      {SECTIONS.map(({ key, label, Icon }) => {
        const items = getGearByCategory(key);
        return (
          <section key={key} id={key} className="mt-10 scroll-mt-20">
            <div className="flex items-center gap-2">
              <Icon className="text-forest-600" size={22} strokeWidth={2.2} />
              <h2 className="text-xl font-extrabold text-forest-800">{label}</h2>
              <span className="text-sm font-semibold tabular-nums text-neutral-400">
                {items.length}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <GearCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
