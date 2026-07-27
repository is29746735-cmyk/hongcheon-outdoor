import type { Place } from "@/types/place";

/**
 * 선택지 기반 장소 추천.
 *
 * 히어로의 검색창이 아래 목록의 검색과 중복이라, 몇 가지 질문에 답하면 조건에 맞는
 * 곳을 골라주는 방식으로 바꿨다(2026-07-27).
 *
 * 원칙:
 * - **검증된 필드만 쓴다.** 점수는 `filterTags`·`category`·`isolationScore`·
 *   `connectedFishing`처럼 실제로 확인된 값에서만 나온다. "당신에게 92% 맞음" 같은
 *   가짜 정밀도는 만들지 않는다.
 * - 추천마다 **이유를 함께 돌려준다.** 화면에서 왜 골랐는지 그대로 보여주기 위함.
 * - 하드 필터가 아니라 **가중치**다. 어떤 조합을 골라도 빈 화면이 나오지 않는다
 *   (장소가 12곳뿐이라 조건을 겹쳐 거르면 금방 0건이 된다).
 */

export type PickerKey = "who" | "what" | "mood";
export type Answers = Partial<Record<PickerKey, string>>;

export interface PickerStep {
  key: PickerKey;
  question: string;
  options: { value: string; label: string; hint?: string }[];
}

export const PICKER_STEPS: PickerStep[] = [
  {
    key: "who",
    question: "누구와 함께 가시나요?",
    options: [
      { value: "family", label: "가족과", hint: "아이 동반" },
      { value: "couple", label: "둘이서" },
      { value: "solo", label: "혼자서" },
      { value: "friends", label: "친구·모임과" },
    ],
  },
  {
    key: "what",
    question: "무엇을 하고 싶으신가요?",
    options: [
      { value: "camping", label: "캠핑" },
      { value: "fishing", label: "낚시" },
      { value: "carcamping", label: "차박" },
      { value: "water", label: "물놀이" },
    ],
  },
  {
    key: "mood",
    question: "어떤 곳이 좋으신가요?",
    options: [
      { value: "quiet", label: "한적한 곳" },
      { value: "amenity", label: "편의시설 갖춘 곳" },
      { value: "any", label: "상관없어요" },
    ],
  },
];

export interface Recommendation {
  place: Place;
  score: number;
  /** 이 장소가 뽑힌 근거 — 전부 실제 데이터에서 나온 문구 */
  reasons: string[];
}

/** 한 규칙: 조건이 맞으면 점수와 이유를 더한다 */
type Rule = { when: (p: Place, tags: Set<string>) => boolean; score: number; reason: string };

const RULES: Record<PickerKey, Record<string, Rule[]>> = {
  who: {
    family: [
      { when: (_p, t) => t.has("가족"), score: 3, reason: "가족 이용 정보 있음" },
      { when: (_p, t) => t.has("물놀이"), score: 2, reason: "물놀이 가능" },
      { when: (_p, t) => t.has("편의시설"), score: 2, reason: "편의시설 있음" },
    ],
    couple: [
      { when: (_p, t) => t.has("리버뷰"), score: 3, reason: "리버뷰" },
      { when: (_p, t) => t.has("강변"), score: 1, reason: "강변" },
      { when: (p) => (p.isolationScore ?? 0) >= 3, score: 1, reason: "비교적 한적" },
    ],
    solo: [
      { when: (p) => (p.isolationScore ?? 0) >= 4, score: 3, reason: "한적함 4점 이상" },
      { when: (_p, t) => t.has("노지"), score: 2, reason: "노지" },
      { when: (_p, t) => t.has("저수지"), score: 1, reason: "저수지" },
    ],
    friends: [
      { when: (_p, t) => t.has("오토캠핑"), score: 2, reason: "오토캠핑" },
      { when: (_p, t) => t.has("편의시설"), score: 2, reason: "편의시설 있음" },
      { when: (_p, t) => t.has("수상레저"), score: 2, reason: "수상레저" },
      { when: (_p, t) => t.has("카라반"), score: 1, reason: "카라반" },
    ],
  },
  what: {
    camping: [
      { when: (p) => p.category === "camping", score: 4, reason: "캠핑장" },
      { when: (_p, t) => t.has("오토캠핑") || t.has("카라반"), score: 1, reason: "오토캠핑·카라반" },
    ],
    fishing: [
      { when: (p) => p.category === "fishing", score: 4, reason: "낚시 스팟" },
      { when: (p) => !!p.connectedFishing, score: 2, reason: "낚시 연계" },
      { when: (_p, t) => t.has("낚시가능"), score: 1, reason: "낚시 가능" },
    ],
    carcamping: [
      { when: (p) => p.category === "carcamping", score: 4, reason: "차박지" },
      { when: (_p, t) => t.has("차박가능"), score: 3, reason: "차박 가능" },
    ],
    water: [
      { when: (_p, t) => t.has("물놀이"), score: 4, reason: "물놀이 가능" },
      { when: (_p, t) => t.has("수상레저"), score: 2, reason: "수상레저" },
      { when: (_p, t) => t.has("강변"), score: 1, reason: "강변" },
    ],
  },
  mood: {
    quiet: [
      { when: (p) => (p.isolationScore ?? 0) >= 4, score: 3, reason: "한적함 4점 이상" },
      { when: (p) => (p.isolationScore ?? 0) === 3, score: 1.5, reason: "한적함 3점" },
    ],
    amenity: [
      { when: (_p, t) => t.has("편의시설"), score: 3, reason: "편의시설 있음" },
      { when: (_p, t) => t.has("공공운영"), score: 1, reason: "공공 운영" },
      { when: (_p, t) => t.has("장비대여"), score: 1, reason: "장비 대여" },
    ],
    any: [],
  },
};

function tagSet(p: Place): Set<string> {
  return new Set([...(p.filterTags ?? []), ...p.tags]);
}

/**
 * 답변에 맞는 장소를 점수순으로. 기본 3곳.
 * 점수가 0인 곳은 근거가 하나도 없다는 뜻이라 제외하되, 그렇게 하면 2곳 미만이
 * 되는 경우에만 나머지를 채운다(빈손으로 돌려보내지 않는다).
 */
export function recommendPlaces(
  places: Place[],
  answers: Answers,
  limit = 3
): Recommendation[] {
  const scored: Recommendation[] = places.map((place) => {
    const tags = tagSet(place);
    let score = 0;
    const reasons: string[] = [];
    (Object.keys(RULES) as PickerKey[]).forEach((key) => {
      const answer = answers[key];
      if (!answer) return;
      (RULES[key][answer] ?? []).forEach((rule) => {
        if (rule.when(place, tags)) {
          score += rule.score;
          if (!reasons.includes(rule.reason)) reasons.push(rule.reason);
        }
      });
    });
    return { place, score, reasons };
  });

  const byScore = (a: Recommendation, b: Recommendation) =>
    b.score - a.score || a.place.name.localeCompare(b.place.name, "ko");

  const matched = scored.filter((r) => r.score > 0).sort(byScore);
  if (matched.length >= 2) return matched.slice(0, limit);
  const rest = scored.filter((r) => r.score === 0).sort(byScore);
  return [...matched, ...rest].slice(0, limit);
}
