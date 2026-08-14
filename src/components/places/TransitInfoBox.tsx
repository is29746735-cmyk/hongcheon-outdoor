import { Bus, TriangleAlert } from "lucide-react";
import type { Place } from "@/types/place";

/** 홍천군 대중교통정보 — 시각은 여기서 확인한다(우리는 시각을 적지 않는다) */
const TIMETABLE_URL = "https://www.hongcheonbus.kr/index.php?mp=p2_4";

/**
 * 제목 옆 요약 칩 — 한눈에 "버스로 갈 만한가"만 답한다.
 *
 * 상세 덩어리(TransitInfoBox)는 방문 정보 카드 안에 있는데, 모바일에서는
 * 사진·헤더·예약 박스를 지나 실측 y=1,108px 라 한 화면을 넘긴다. 결정에 필요한
 * 한 줄은 제목 바로 아래(y≈350px)에서 끝나야 해서 칩을 따로 세웠다.
 */
export function TransitChip({ place }: { place: Place }) {
  const t = place.transit;

  const [text, tone] = t
    ? [`버스 ${t.runsPerDay}`, t.level === "sparse" ? "warn" : "ok"]
    : ["버스 노선 없음", "none"];

  const styles =
    tone === "warn"
      ? "bg-amber-50 text-[#9a5b00]"
      : tone === "ok"
        ? "bg-forest-50 text-forest-700"
        : "bg-neutral-100 text-neutral-600";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-3 py-1 text-xs font-semibold tabular-nums ${styles}`}
    >
      <Bus className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
      {text}
    </span>
  );
}

/**
 * 대중교통 접근성 — 방문 정보 카드 안에 들어가는 한 덩어리.
 *
 * 이 자리에 둔 이유: 이 카드는 모바일에서 본문보다 **위**에 온다.
 * "버스로 갈 수 있나"는 가기 전에 정해지는 문제라 설명을 다 읽고 알면 늦다.
 *
 * ★ 원칙 세 가지
 * 1. **시각을 쓰지 않는다.** 계절·요일마다 바뀌어 반드시 낡는다 → 공식 시간표로 넘긴다.
 * 2. **도보 시간·거리를 쓰지 않는다.** 정류장~목적지 거리는 검증하지 못했다.
 *    지어내면 그게 사람을 길에 세운다 → 지도 길찾기로 넘긴다.
 * 3. **모르면 모른다고 쓴다.** transit 이 없으면 빈칸이 아니라
 *    "확인된 노선 없음"을 보여준다. 빈칸은 "된다"로 읽힌다.
 */
export default function TransitInfoBox({ place }: { place: Place }) {
  const t = place.transit;

  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
        <Bus className="h-3.5 w-3.5" strokeWidth={2.2} />
        대중교통
      </dt>

      {t ? (
        <dd className="mt-1">
          <p className="text-sm font-medium text-neutral-900">
            {t.stop} 정류장
          </p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-neutral-600">
            {t.route}
          </p>

          {/*
            하루 편수가 이 화면에서 제일 중요한 숫자다 — 하루 두세 편이면
            "갈 수 있나"가 아니라 "그 시간에 맞출 수 있나"의 문제가 된다.
            그래서 sparse 는 주의색으로 따로 세운다.
          */}
          <p
            className={`mt-1.5 inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[13px] font-bold tabular-nums ${
              t.level === "sparse"
                ? "bg-amber-50 text-[#9a5b00]"
                : "bg-forest-50 text-forest-700"
            }`}
          >
            {t.level === "sparse" && (
              <TriangleAlert className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
            )}
            {t.runsPerDay}
            {t.level === "sparse" && (
              <span className="font-medium">· 시간표에 일정을 맞춰야 합니다</span>
            )}
          </p>

          {t.note && (
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-600">
              {t.note}
            </p>
          )}
        </dd>
      ) : (
        <dd className="mt-1">
          <p className="text-sm font-medium text-neutral-900">
            확인된 노선이 없습니다
          </p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-neutral-600">
            홍천군 농어촌버스 노선표에서 이곳으로 가는 정류장을 찾지 못했습니다.
            자가용을 권합니다.
          </p>
        </dd>
      )}

      <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
        첫차·막차와 정류장에서 걷는 거리는{" "}
        <a
          href={TIMETABLE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-forest-700 underline underline-offset-2 hover:text-forest-800"
        >
          홍천군 대중교통정보
        </a>
        와 지도 앱에서 확인하세요.
      </p>
    </div>
  );
}
