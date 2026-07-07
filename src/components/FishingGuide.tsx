import {
  Fish,
  Ban,
  Waves,
  TriangleAlert,
  MapPinOff,
  Leaf,
  CalendarX,
  ExternalLink,
} from "lucide-react";
import {
  FISHING_CLOSED_SEASONS,
  FISHING_NO_NATIONAL_RULE,
  FISHING_CAUTIONS,
  FISHING_SOURCES,
} from "@/data/fishingInfo";

/** 주의사항 항목별 아이콘 (FISHING_CAUTIONS 순서에 대응) */
const CAUTION_ICONS = [Ban, Waves, TriangleAlert, MapPinOff, Leaf] as const;

/**
 * 낚시 전 확인 안내 — 금어기·금지체장 + 안전·법규·환경 주의사항.
 * 검증된 사실만 노출하며, 규정은 개정·구간에 따라 달라질 수 있어 출처와 확인 안내를 함께 표기합니다.
 * 낚시 스팟(category=fishing) 또는 캠핑+낚시 연계 장소(connectedFishing) 상세페이지에 노출합니다.
 */
export default function FishingGuide() {
  return (
    <section className="mt-6 rounded-3xl border border-river-200 bg-river-50/70 p-6">
      <h2 className="flex items-center gap-2 text-base font-extrabold text-neutral-900">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-river-100 text-river-700">
          <Fish className="h-4 w-4" strokeWidth={2} />
        </span>
        낚시 전 확인 · 금어기와 주의사항
      </h2>

      {/* 금어기 · 금지체장 */}
      <div className="mt-4 space-y-3">
        {FISHING_CLOSED_SEASONS.map((r) => (
          <div
            key={r.species}
            className="rounded-2xl border border-amber-200 bg-white p-4"
          >
            <div className="flex items-center gap-1.5 text-sm font-bold text-amber-700">
              <CalendarX className="h-4 w-4" strokeWidth={2} />
              {r.species} 금어기
            </div>
            <dl className="mt-2.5 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl bg-amber-50 px-3 py-2">
                <dt className="text-xs font-semibold text-amber-700/80">금어기</dt>
                <dd className="mt-0.5 text-sm font-medium tabular-nums text-neutral-800">
                  {r.closedSeason}
                </dd>
              </div>
              <div className="rounded-xl bg-amber-50 px-3 py-2">
                <dt className="text-xs font-semibold text-amber-700/80">
                  금지체장
                </dt>
                <dd className="mt-0.5 text-sm font-medium tabular-nums text-neutral-800">
                  {r.minSize}
                </dd>
              </div>
            </dl>
            {r.note && (
              <p className="mt-2.5 text-xs leading-relaxed text-neutral-500">
                {r.note}
              </p>
            )}
          </div>
        ))}
        <p className="text-xs leading-relaxed text-neutral-600">
          {FISHING_NO_NATIONAL_RULE}
        </p>
      </div>

      {/* 안전·법규·환경 주의사항 */}
      <ul className="mt-5 space-y-3">
        {FISHING_CAUTIONS.map((c, i) => {
          const Icon = CAUTION_ICONS[i] ?? TriangleAlert;
          return (
            <li key={c.title} className="flex gap-3">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-river-700">
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <div>
                <p className="text-sm font-bold text-neutral-900">{c.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-neutral-700">
                  {c.body}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* 출처 · 면책 */}
      <div className="mt-5 border-t border-river-200 pt-3">
        <p className="text-[11px] leading-relaxed text-neutral-500">
          규정은 개정되거나 수역·구간에 따라 달라질 수 있습니다. 방문 전 최신
          정보를 확인하세요.
        </p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {FISHING_SOURCES.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-river-700 hover:underline"
            >
              <ExternalLink className="h-3 w-3" strokeWidth={2} />
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
