"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Check } from "lucide-react";
import { getAllPlaces } from "@/data/places";
import { CATEGORY_LABELS } from "@/constants";
import { CategoryIcon } from "@/components/icons";
import {
  PICKER_STEPS,
  conflictsWith,
  recommendPlaces,
  toggleAnswer,
  type Answers,
  type PickerKey,
} from "@/lib/recommend";

/**
 * 히어로의 선택지 추천 — 예전 검색창을 대체한다.
 *
 * 검색은 바로 아래 목록에도 있어 중복이었다(2026-07-27 사용자 지적). 대신 몇 가지를
 * 고르면 조건에 맞는 곳을 2~3곳 골라준다. 매칭 규칙과 근거는 `lib/recommend.ts`.
 */
export default function HeroPicker() {
  const places = useMemo(() => getAllPlaces(), []);
  const [answers, setAnswers] = useState<Answers>({});
  /*
   * 단계를 답의 유무로 계산하지 않고 따로 들고 있는다.
   * 여러 개를 고를 수 있게 되면서 "하나 골랐다 = 다음 단계"가 성립하지 않는다 —
   * 골라 놓고 더 고르는 중일 수 있으니 넘어가는 건 사용자가 정한다.
   */
  const [stepIndex, setStepIndex] = useState(0);

  const done = stepIndex >= PICKER_STEPS.length;
  const current = done ? null : PICKER_STEPS[stepIndex];
  const picked = current ? answers[current.key] ?? [] : [];

  const results = useMemo(
    () => (done ? recommendPlaces(places, answers) : []),
    [done, places, answers]
  );

  const pick = (value: string) => {
    if (!current) return;
    const next = toggleAnswer(current, picked, value);
    setAnswers((prev) => ({ ...prev, [current.key]: next }));
    // 하나만 고르는 단계는 고르는 즉시 넘어간다(누를 것이 하나뿐이라 확인이 군더더기)
    if (!current.multi) setStepIndex((i) => i + 1);
  };

  /** 이 단계부터 뒤의 답을 지운다 — 앞 단계를 고치면 뒤는 다시 골라야 한다 */
  const resetFrom = (key: PickerKey) =>
    setAnswers((prev) => {
      const next: Answers = {};
      for (const [i, s] of PICKER_STEPS.entries()) {
        if (s.key === key) {
          setStepIndex(i);
          break;
        }
        if (prev[s.key]?.length) next[s.key] = prev[s.key];
      }
      return next;
    });

  return (
    <div className="mx-auto mt-8 max-w-2xl">
      <div className="rounded-sm bg-white/[0.08] p-4 ring-1 ring-white/20 backdrop-blur sm:p-5">
        {/* 고른 답 — 누르면 그 단계로 되돌아간다 */}
        {Object.keys(answers).length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            {PICKER_STEPS.filter((s) => answers[s.key]?.length).map((s) => {
              // 고른 순서가 아니라 **선택지 순서**로 적는다.
              // 껐다 켤 때마다 라벨 순서가 뒤바뀌면 같은 조건이 달라 보인다.
              const chosen = answers[s.key] ?? [];
              const labels = s.options
                .filter((o) => chosen.includes(o.value))
                .map((o) => o.label)
                .join(" · ");
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => resetFrom(s.key)}
                  className="inline-flex min-h-[36px] items-center gap-1 rounded-sm bg-white/15 px-2.5 text-[13px] font-bold text-white ring-1 ring-white/25 transition-colors hover:bg-white/25"
                  title="이 단계부터 다시 고르기"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                  {labels}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setAnswers({});
                setStepIndex(0);
              }}
              className="inline-flex min-h-[36px] items-center gap-1 px-2 text-[13px] font-bold text-white/70 underline underline-offset-2 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.4} />
              처음부터
            </button>
          </div>
        )}

        {current ? (
          <>
            <p className="text-[13px] font-bold text-white/60">
              {stepIndex + 1} / {PICKER_STEPS.length}
            </p>
            <p className="mt-1 text-lg font-extrabold text-white sm:text-xl">
              {current.question}
            </p>
            {current.note && (
              <p className="mt-1 text-[13px] font-medium text-white/60">
                {current.note}
              </p>
            )}
            <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {current.options.map((o) => {
                const on = picked.includes(o.value);
                // 이걸 누르면 꺼지는 것들 — 미리 알려 준다("캠핑 대신")
                const drops = conflictsWith(current, picked, o.value)
                  .map((v) => current.options.find((x) => x.value === v)?.label)
                  .filter(Boolean);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => pick(o.value)}
                    aria-pressed={current.multi ? on : undefined}
                    className={`group flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-sm px-3 py-2.5 ring-1 transition-colors ${
                      on
                        ? "bg-ember-500 ring-ember-400"
                        : "bg-white/12 ring-white/25 hover:bg-ember-500 hover:ring-ember-400"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1 text-[15px] font-bold text-white">
                      {current.multi && on && (
                        <Check className="h-3.5 w-3.5" strokeWidth={2.8} />
                      )}
                      {o.label}
                    </span>
                    {(drops.length > 0 || o.hint) && (
                      <span className="text-[12px] font-medium text-white/60 group-hover:text-white/85">
                        {drops.length > 0 ? `${drops.join("·")} 대신` : o.hint}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {current.multi && (
              <button
                type="button"
                onClick={() => setStepIndex((i) => i + 1)}
                disabled={picked.length === 0}
                className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-sm bg-white px-5 text-sm font-bold text-forest-800 transition-colors hover:bg-sand-100 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/60 sm:w-auto"
              >
                {stepIndex === PICKER_STEPS.length - 1 ? "추천 보기" : "다음"}
                <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-[13px] font-bold text-white/60">
              고르신 조건에 맞는 곳
            </p>
            <ul className="mt-2.5 space-y-2">
              {results.map(({ place, reasons }) => (
                <li key={place.id}>
                  <Link
                    href={`/spots/${place.id}`}
                    className="flex items-start gap-3 rounded-sm bg-white px-3.5 py-3 transition-colors hover:bg-sand-100"
                  >
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-forest-50 text-forest-700">
                      <CategoryIcon category={place.category} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[15px] font-extrabold text-forest-800">
                          {place.name}
                        </span>
                        <span className="rounded-sm bg-forest-50 px-1.5 py-0.5 text-[12px] font-bold text-forest-600">
                          {CATEGORY_LABELS[place.category]}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] text-neutral-500">
                        {place.region}
                      </span>
                      {/* 왜 골랐는지 — 전부 실제 데이터에서 나온 근거 */}
                      {reasons.length > 0 && (
                        <span className="mt-1.5 flex flex-wrap gap-1">
                          {reasons.slice(0, 4).map((r) => (
                            <span
                              key={r}
                              className="rounded-sm bg-sand-100 px-1.5 py-0.5 text-[12px] font-medium text-neutral-600"
                            >
                              {r}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                    <ArrowRight
                      className="mt-2 h-4 w-4 shrink-0 text-neutral-400"
                      strokeWidth={2.2}
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <a
              href="#list"
              className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-bold text-white underline underline-offset-4 hover:text-ember-300"
            >
              전체 {places.length}곳 목록 보기
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </a>
          </>
        )}
      </div>
    </div>
  );
}
