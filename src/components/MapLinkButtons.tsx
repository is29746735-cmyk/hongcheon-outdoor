import type { Place } from "@/types/place";
import { getMapLinks } from "@/lib/map-links";

/** 장소를 네이버·카카오·구글 지도에서 여는 링크 버튼 모음 */
export default function MapLinkButtons({
  place,
  compact = false,
}: {
  place: Place;
  /** 카드 등 좁은 공간용 작은 버튼 */
  compact?: boolean;
}) {
  const links = getMapLinks(place);

  const items = [
    {
      key: "naver",
      label: "네이버 지도",
      short: "네이버",
      href: links.naver,
      className: "bg-[#03c75a] text-white hover:opacity-90",
    },
    {
      key: "kakao",
      label: "카카오맵",
      short: "카카오",
      href: links.kakao,
      className: "bg-[#fee500] text-[#3c1e1e] hover:opacity-90",
    },
    {
      key: "google",
      label: "구글 지도",
      short: "구글",
      href: links.google,
      className:
        "border border-neutral-300 bg-white text-neutral-800 hover:border-neutral-400",
    },
  ];

  const size = compact ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm";

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <a
          key={item.key}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-full font-medium transition ${size} ${item.className}`}
        >
          {compact ? item.short : `${item.label}에서 보기`}
        </a>
      ))}
    </div>
  );
}
