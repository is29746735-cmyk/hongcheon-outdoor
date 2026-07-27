"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Check } from "lucide-react";
import { getAllPlaces } from "@/data/places";
import { CATEGORY_LABELS } from "@/constants";
import { CategoryIcon } from "@/components/icons";
import {
  PICKER_STEPS,
  recommendPlaces,
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

  const stepIndex = PICKER_STEPS.findIndex((s) => !answers[s.key]);
  const done = stepIndex === -1;
  const current = done ? null : PICKER_STEPS[stepIndex];

  const results = useMemo(
    () => (done ? recommendPlaces(places, answers) : []),
    [done, places, answers]
  );

  const pick = (key: PickerKey, value: string) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  /** 이 단계부터 뒤의 답을 지운다 — 앞 단계를 고치면 뒤는 다시 골라야 한다 */
  const resetFrom = (key: PickerKey) =>
    setAnswers((prev) => {
      const next: Answers = {};
      for (const s of PICKER_STEPS) {
        if (s.key === key) break;
        if (prev[s.key]) next[s.key] = prev[s.key];
      }
      return next;
    });

  return (
    <div className="mx-auto mt-8 max-w-2xl">
      <div className="rounded-sm bg-white/[0.08] p-4 ring-1 ring-white/20 backdrop-blur sm:p-5">
        {/* 고른 답 — 누르면 그 단계로 되돌아간다 */}
        {Object.keys(answers).length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            {PICKER_STEPS.filter((s) => answers[s.key]).map((s) => {
              const opt = s.options.find((o) => o.value === answers[s.key]);
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => resetFrom(s.key)}
                  className="inline-flex min-h-[36px] items-center gap-1 rounded-sm bg-white/15 px-2.5 text-[13px] font-bold text-white ring-1 ring-white/25 transition-colors hover:bg-white/25"
                  title="이 단계부터 다시 고르기"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                  {opt?.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setAnswers({})}
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
            <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {current.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => pick(current.key, o.value)}
                  className="group flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-sm bg-white/12 px-3 py-2.5 ring-1 ring-white/25 transition-colors hover:bg-ember-500 hover:ring-ember-400"
                >
                  <span className="text-[15px] font-bold text-white">
                    {o.label}
                  </span>
                  {o.hint && (
                    <span className="text-[12px] font-medium text-white/60 group-hover:text-white/85">
                      {o.hint}
                    </span>
                  )}
                </button>
              ))}
            </div>
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
