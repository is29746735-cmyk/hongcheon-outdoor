"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Search, Tent } from "lucide-react";
import "./type-lab.css";

/**
 * 타이포 비교 실험실 — `/type-lab` (검토 전용. 실제 사이트 화면은 건드리지 않는다)
 *
 * "폰트가 얇고 딱딱해서 오래된 정부 사이트 같다"는 지적을 눈으로 비교해 고르기 위한 페이지.
 * 홈 필터 영역을 실제와 같은 마크업으로 복제하고, 4개 안을 갈아끼운다.
 * 값은 type-lab.css 의 `[data-type]` 블록에 있다.
 */

const TREATMENTS = [
  {
    id: "a",
    name: "A. 현재",
    face: "Pretendard",
    spec: "카운트 10 · 안내 11/400 · 칩 12/500 · 라벨 12/600 · 본문 14 · 제목 자간 −0.025em · 작은 행간 1.33",
    note: "지금 배포된 값. 비교 기준선.",
  },
  {
    id: "b",
    name: "B. Pretendard 정리",
    face: "Pretendard",
    spec: "카운트 12/600 · 안내 13/500 · 칩 13/600 · 라벨 13/700 · 본문 15 · 제목 자간 0 · 작은 행간 1.5",
    note: "서체는 그대로. 웹폰트 추가 없음.",
  },
  {
    id: "c",
    name: "C. IBM Plex Sans KR",
    face: "IBM Plex Sans KR",
    spec: "B와 같은 스케일 · 제목 700",
    note: "휴머니스트 서체. '딱딱함'이 서체 탓인지 보는 용도.",
  },
  {
    id: "d",
    name: "D. Gothic A1",
    face: "Gothic A1",
    spec: "B와 같은 스케일 · 제목 800",
    note: "기하학적 한글 서체, 9 weight.",
  },
] as const;

type Mode = "switch" | "side";

/**
 * 구글 폰트의 한글은 unicode-range 로 잘게 서브셋돼 있어서, 해당 글자가 그려질 때
 * 비로소 파일을 받아온다. 그 상태로 안을 전환하면 **아직 폴백(generic sans)** 이
 * 보이는 순간이 있어 비교가 왜곡된다. 그래서 미리 전부 받아두고 준비됨을 표시한다.
 */
const PRELOAD: [string, number][] = [
  ["Pretendard Variable", 400],
  ["Pretendard Variable", 600],
  ["Pretendard Variable", 700],
  ["Pretendard Variable", 800],
  ["IBM Plex Sans KR", 400],
  ["IBM Plex Sans KR", 500],
  ["IBM Plex Sans KR", 600],
  ["IBM Plex Sans KR", 700],
  ["Gothic A1", 400],
  ["Gothic A1", 500],
  ["Gothic A1", 600],
  ["Gothic A1", 700],
  ["Gothic A1", 800],
];
const SAMPLE_TEXT =
  "홍천강오토캠핑장 한적함 낚시 종류 태그 강변 물놀이 오토캠핑 전체 점 개 더 같은 줄에서 여러 개를 고르면 둘 중 하나라도 해당하는 곳이 남습니다 캠핑하며 낚시까지 연계 추천 강원특별자치도 북방면 굴지강변로 카카오 등록 정보 기준 직선거리 길찾기 확인 방류 수위 0123456789()·—*#";

export default function TypeLabPage() {
  const [active, setActive] = useState<string>("b");
  const [mode, setMode] = useState<Mode>("switch");
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      PRELOAD.map(([fam, wt]) =>
        document.fonts.load(`${wt} 15px "${fam}"`, SAMPLE_TEXT).catch(() => null)
      )
    ).then(() => {
      if (!cancelled) setFontsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="border-b border-neutral-200 pb-5">
        <p className="text-xs font-bold uppercase tracking-wider text-ember-600">
          검토 전용 페이지
        </p>
        <h1 className="mt-1.5 text-2xl font-extrabold text-forest-800">
          타이포 비교 실험실
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">
          홈 필터 영역을 실제와 같은 마크업으로 복제했습니다. 아래에서 안을 바꿔가며
          비교하세요. <b className="font-semibold">이 페이지는 예시일 뿐, 실제 사이트에는
          아무 변화도 반영되지 않았습니다.</b>
        </p>
        <p
          className="mt-3 inline-flex items-center gap-1.5 rounded-sm bg-white px-2.5 py-1.5 text-xs font-semibold ring-1 ring-neutral-300"
          aria-live="polite"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              fontsReady ? "bg-[#03b26c]" : "bg-[#fe9800]"
            }`}
          />
          {fontsReady ? (
            <span className="text-neutral-700">
              서체 4종 로드 완료 — 지금 보이는 게 실제 서체입니다
            </span>
          ) : (
            <span className="text-neutral-600">
              서체 불러오는 중… 완료 전에는 C·D가 기본 서체로 보일 수 있습니다
            </span>
          )}
        </p>
      </header>

      {/* 모드 + 안 선택 */}
      <div className="sticky top-0 z-10 -mx-4 border-b border-neutral-200 bg-sand-50/95 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-bold text-neutral-500">보기</span>
          {(
            [
              { v: "switch", label: "하나씩 전환" },
              { v: "side", label: "4안 나란히" },
            ] as const
          ).map((m) => (
            <button
              key={m.v}
              type="button"
              onClick={() => setMode(m.v)}
              className={`min-h-[44px] rounded-sm px-3.5 text-sm font-semibold transition-colors ${
                mode === m.v
                  ? "bg-forest-700 text-white"
                  : "bg-white text-neutral-700 ring-1 ring-neutral-300 hover:bg-forest-50"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === "switch" && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-bold text-neutral-500">안</span>
            {TREATMENTS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t.id)}
                className={`min-h-[44px] rounded-sm px-3.5 text-sm font-semibold transition-colors ${
                  active === t.id
                    ? "bg-forest-700 text-white"
                    : "bg-white text-neutral-700 ring-1 ring-neutral-300 hover:bg-forest-50"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {mode === "switch" ? (
        <Panel treatment={TREATMENTS.find((t) => t.id === active)!} />
      ) : (
        <div className="space-y-8">
          {TREATMENTS.map((t) => (
            <Panel key={t.id} treatment={t} compact />
          ))}
        </div>
      )}

      {/* 안별 스펙 표 */}
      <section className="mt-12 overflow-x-auto">
        <h2 className="mb-3 text-lg font-extrabold text-forest-800">안별 값</h2>
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-300">
              <th className="py-2 pr-4 font-bold text-neutral-700">안</th>
              <th className="py-2 pr-4 font-bold text-neutral-700">서체</th>
              <th className="py-2 font-bold text-neutral-700">값</th>
            </tr>
          </thead>
          <tbody>
            {TREATMENTS.map((t) => (
              <tr key={t.id} className="border-b border-neutral-200 align-top">
                <td className="py-2.5 pr-4 font-semibold text-neutral-900">
                  {t.name}
                </td>
                <td className="py-2.5 pr-4 text-neutral-700">{t.face}</td>
                <td className="py-2.5 text-neutral-600">
                  {t.spec}
                  <span className="mt-0.5 block text-xs text-neutral-500">
                    {t.note}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

/** 한 안(案)의 견본 — 홈 필터 영역 + 섹션 제목 + 카드 + 면책문구 */
function Panel({
  treatment,
  compact = false,
}: {
  treatment: (typeof TREATMENTS)[number];
  compact?: boolean;
}) {
  return (
    <section className={compact ? "" : "mt-6"}>
      <div className="mb-3 mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-lg font-extrabold text-forest-800">
          {treatment.name}
        </h2>
        <span className="text-xs font-medium text-neutral-500">
          {treatment.face} · {treatment.spec}
        </span>
      </div>

      <div
        className="lab rounded-2xl border border-sand-300 bg-white p-4"
        data-type={treatment.id}
      >
        {/* 카테고리 칩 + 검색 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Chip active>
              전체 <Count n={12} />
            </Chip>
            <Chip>
              <Tent className="h-4 w-4" strokeWidth={2} />
              캠핑장 <Count n={5} />
            </Chip>
            <Chip>
              낚시 스팟 <Count n={5} />
            </Chip>
            <Chip>
              차박지 <Count n={2} />
            </Chip>
          </div>
          <div className="lab-body flex min-h-[44px] w-full items-center gap-2 rounded-lg border border-neutral-300 px-3 text-neutral-400 sm:w-64">
            <Search className="h-4 w-4 shrink-0" strokeWidth={2} />
            이름·지역·태그 검색
          </div>
        </div>

        {/* 상세 필터 */}
        <div className="mt-3 space-y-2 rounded-2xl border border-sand-300 p-3.5">
          <Row label="한적함">
            <Pill active>
              전체 <Count n={12} />
            </Pill>
            <Pill>
              3점+ <Count n={8} />
            </Pill>
            <Pill>
              4점+ <Count n={3} />
            </Pill>
            <Pill>
              5점 <Count n={1} />
            </Pill>
          </Row>
          <Row label="낚시 종류">
            <Pill>
              루어낚시 <Count n={4} />
            </Pill>
            <Pill>
              견지낚시 <Count n={4} />
            </Pill>
            <Pill>
              얼음낚시 <Count n={1} />
            </Pill>
          </Row>
          <Row label="태그">
            {[
              ["강변", 9],
              ["낚시가능", 5],
              ["차박가능", 4],
              ["물놀이", 3],
              ["오토캠핑", 3],
            ].map(([t, n]) => (
              <Pill key={t as string}>
                #{t} <Count n={n as number} />
              </Pill>
            ))}
            <span className="lab-chip inline-flex min-h-[44px] items-center gap-1 px-3 text-forest-700 underline underline-offset-2">
              태그 9개 더
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.2} />
            </span>
          </Row>
          <p className="lab-fine pt-0.5 text-neutral-500">
            같은 줄에서 여러 개를 고르면{" "}
            <b className="font-semibold">둘 중 하나라도</b> 해당하는 곳이 남습니다.
            줄이 다르면 조건이 겹쳐서 적용됩니다.
          </p>
        </div>

        {/* 섹션 제목 + 본문 — 한글 음수 자간이 보이는 자리 */}
        <div className="mt-6">
          <h3 className="lab-h2 text-forest-800">
            캠핑하며 낚시까지 — 연계 추천
          </h3>
          <p className="lab-body mt-1.5 text-neutral-600">
            캠핑·차박을 베이스로 홍천강 낚시를 함께 즐길 수 있는 검증된 장소입니다.
            수위와 방류는 방문 전 확인해 주세요.
          </p>
        </div>

        {/* 카드 견본 */}
        <div className="mt-4 rounded-3xl border border-neutral-200 p-4">
          <span className="lab-micro inline-block rounded-sm bg-forest-600 px-2 py-0.5 text-white">
            캠핑장
          </span>
          <p className="lab-card mt-2 text-forest-800">홍천강오토캠핑장</p>
          <p className="lab-fine mt-1 text-neutral-500">
            강원특별자치도 홍천군 북방면 굴지강변로
          </p>
          <p className="lab-body mt-2 text-neutral-700">
            홍천군이 직접 운영하는 강변 오토캠핑장입니다. 카라반과 오토캠핑 사이트를
            함께 갖췄습니다.
          </p>
        </div>

        {/* 면책문구 */}
        <p className="lab-fine mt-4 text-neutral-600">
          * 카카오 등록 정보 기준입니다. 표시 거리는 직선거리이며, 실제 차로·도보
          시간과 영업 여부는 길찾기에서 확인하세요.
        </p>
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="lab-label w-full text-neutral-500 sm:mr-1 sm:w-16 sm:shrink-0">
        {label}
      </span>
      {children}
    </div>
  );
}

function Chip({
  active,
  children,
}: {
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`lab-chip-lg inline-flex min-h-[44px] items-center gap-1 rounded-sm border px-4 ${
        active
          ? "border-forest-600 bg-forest-600 text-white"
          : "border-neutral-300 text-neutral-700"
      }`}
    >
      {children}
    </span>
  );
}

function Pill({
  active,
  children,
}: {
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`lab-chip inline-flex min-h-[44px] items-center gap-1 rounded-sm px-3 ${
        active ? "bg-forest-600 text-white" : "bg-sand-100 text-neutral-600"
      }`}
    >
      {children}
    </span>
  );
}

function Count({ n }: { n: number }) {
  return <span className="lab-micro opacity-70">({n})</span>;
}
