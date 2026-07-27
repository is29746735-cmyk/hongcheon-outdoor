/**
 * 히어로 배경(대기) 계산 — 계절 · 시간대 · 날씨.
 *
 * 그리기(캔버스)는 `HeroAtmosphere` 가 맡고, 여기서는 **무엇을 그릴지**만 정한다.
 * DOM 을 만지지 않는 순수 함수라 서버·클라이언트 어디서든 부를 수 있다.
 *
 * 원칙(프로젝트 보이스와 동일): 지어내지 않는다.
 *  - 계절·시간대는 **한국 표준시(KST)** 기준으로 계산한다. 홍천을 보러 온 사람에게는
 *    보는 사람의 현지 시각이 아니라 **홍천의 시각**이 맞다.
 *  - 일출·일몰은 대충 "6시/18시"로 두지 않고 NOAA 근사식으로 홍천 좌표에서 계산한다.
 *    (겨울엔 4시 반에 어두워지는 것이 실제 홍천이다.)
 *  - 비·눈은 **예보가 아니라 현재 관측(skyText·rainfall1h)** 으로만 내린다.
 */

import { HONGCHEON_RIVER_CENTER } from "@/constants";
import type { RiverStatusResponse } from "@/types/river";

export type Season = "spring" | "summer" | "autumn" | "winter";
export type SkyPhase = "night" | "dawn" | "morning" | "day" | "golden" | "dusk";
export type Precip = "none" | "rain" | "snow";

/** 하늘 3단 그라데이션 + 별 밝기 */
export interface Sky {
  top: string;
  mid: string;
  bottom: string;
  /** 0~1 — 별이 보이는 정도. 모닥불 밝기에도 쓴다(밤일수록 불빛이 살아난다). */
  stars: number;
  phase: SkyPhase;
}

export interface Weather {
  precip: Precip;
  /** 0~1 — 강수 세기. 관측 강수량(mm/h)에서 환산. */
  intensity: number;
  /** 흐림 여부(별·대비를 낮춘다) */
  overcast: boolean;
  /** 화면 하단 안내에 쓰는 한 줄 (예: "지금 홍천 · 눈") */
  label: string | null;
}

// ── 색 유틸 ────────────────────────────────────────────────────────
type RGB = [number, number, number];

function hex2rgb(hex: string): RGB {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgb2hex(c: RGB): string {
  return (
    "#" +
    c
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function mixRgb(a: RGB, b: RGB, t: number): RGB {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

/** 두 hex 색을 t(0~1) 비율로 섞는다 */
function mixHex(a: string, b: string, t: number): string {
  return rgb2hex(mixRgb(hex2rgb(a), hex2rgb(b), t));
}

// ── KST 시각 ──────────────────────────────────────────────────────
/** 한국 표준시 기준 {월(1~12), 일, 소수 시(0~24), 연중일수} */
export function kstParts(now: Date = new Date()) {
  // KST 는 서머타임이 없어 UTC+9 고정. 라이브러리 없이 안전하게 계산된다.
  const k = new Date(now.getTime() + 9 * 3600 * 1000);
  const startOfYear = Date.UTC(k.getUTCFullYear(), 0, 1);
  const dayOfYear =
    Math.floor((k.getTime() - startOfYear) / 86400000) + 1;
  return {
    month: k.getUTCMonth() + 1,
    date: k.getUTCDate(),
    hour: k.getUTCHours() + k.getUTCMinutes() / 60 + k.getUTCSeconds() / 3600,
    dayOfYear,
    year: k.getUTCFullYear(),
  };
}

/** 기상학적 계절(3~5 봄 / 6~8 여름 / 9~11 가을 / 12~2 겨울) */
export function seasonOf(month: number): Season {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

/**
 * 홍천 좌표의 일출·일몰(KST 소수 시). NOAA 근사식.
 * 백야 지역이 아니라 극단값 처리는 clamp 로 충분하다.
 */
export function sunTimes(dayOfYear: number): {
  sunrise: number;
  sunset: number;
  noon: number;
} {
  const { lat, lng } = HONGCHEON_RIVER_CENTER;
  const rad = Math.PI / 180;
  const g = ((2 * Math.PI) / 365) * (dayOfYear - 1);

  // 균시차(분)
  const eq =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(g) -
      0.032077 * Math.sin(g) -
      0.014615 * Math.cos(2 * g) -
      0.040849 * Math.sin(2 * g));

  // 태양 적위(라디안)
  const decl =
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g);

  // 시간각(도) — 대기굴절 포함 고도 -0.833°
  const cosH =
    Math.cos(90.833 * rad) / (Math.cos(lat * rad) * Math.cos(decl)) -
    Math.tan(lat * rad) * Math.tan(decl);
  const H = Math.acos(Math.max(-1, Math.min(1, cosH))) / rad;

  // UTC 분 → KST 시
  const toKst = (utcMin: number) => ((utcMin / 60 + 9) % 24 + 24) % 24;
  return {
    sunrise: toKst(720 - 4 * (lng + H) - eq),
    sunset: toKst(720 - 4 * (lng - H) - eq),
    noon: toKst(720 - 4 * lng - eq),
  };
}

// ── 하늘 팔레트 ────────────────────────────────────────────────────
/**
 * 팔레트는 전부 **어둡고 채도가 낮은 쪽**으로만 둔다.
 * 히어로 위 글자가 흰색이라, 한낮이라고 하늘을 밝히면 본문이 읽히지 않는다.
 * 따뜻한 색은 하늘이 아니라 **모닥불 한 곳에만** 쓴다(대담함은 한 곳에만).
 */
const PALETTES: Record<
  SkyPhase,
  { top: string; mid: string; bottom: string; stars: number }
> = {
  night: { top: "#0b1118", mid: "#0e1720", bottom: "#121e19", stars: 1 },
  dawn: { top: "#18202e", mid: "#2a2f3d", bottom: "#463a38", stars: 0.3 },
  morning: { top: "#1e2f3f", mid: "#26403d", bottom: "#2c4739", stars: 0 },
  day: { top: "#22394b", mid: "#294544", bottom: "#2e4b3c", stars: 0 },
  golden: { top: "#243444", mid: "#363a43", bottom: "#4a3c33", stars: 0.02 },
  dusk: { top: "#141d2b", mid: "#232637", bottom: "#332c33", stars: 0.5 },
};

/** 계절 틴트 — 같은 시간대라도 계절마다 공기 색이 다르다 */
const SEASON_TINT: Record<Season, { color: string; amount: number }> = {
  spring: { color: "#7d8f6a", amount: 0.1 }, // 연둣빛
  summer: { color: "#2f6b4a", amount: 0.12 }, // 짙은 초록
  autumn: { color: "#8a5c2e", amount: 0.11 }, // 마른 억새
  winter: { color: "#68809a", amount: 0.13 }, // 푸른 회색
};

interface Anchor {
  at: number;
  phase: SkyPhase;
}

/** 일출·일몰을 기준으로 시간대 앵커를 만든다(사이 값은 보간) */
function anchorsFor(sun: {
  sunrise: number;
  sunset: number;
  noon: number;
}): Anchor[] {
  return [
    { at: sun.sunrise - 1.1, phase: "night" },
    { at: sun.sunrise - 0.2, phase: "dawn" },
    { at: sun.sunrise + 1.2, phase: "morning" },
    { at: sun.noon, phase: "day" },
    { at: sun.sunset - 0.9, phase: "golden" },
    { at: sun.sunset + 0.3, phase: "dusk" },
    { at: sun.sunset + 1.5, phase: "night" },
  ];
}

/**
 * 주어진 절기·시각의 하늘.
 * 앵커 사이를 선형 보간하므로 시간이 흐르면 배경도 **끊김 없이** 흘러간다.
 */
export function skyFor(
  where: { dayOfYear: number; hour: number; season: Season },
  weather?: Weather
): Sky {
  const { hour, dayOfYear, season } = where;
  const anchors = anchorsFor(sunTimes(dayOfYear));

  let a = anchors[0];
  let b = anchors[0];
  let t = 0;
  if (hour <= anchors[0].at || hour >= anchors[anchors.length - 1].at) {
    a = b = { at: hour, phase: "night" };
  } else {
    for (let i = 0; i < anchors.length - 1; i++) {
      if (hour >= anchors[i].at && hour <= anchors[i + 1].at) {
        a = anchors[i];
        b = anchors[i + 1];
        t = (hour - a.at) / Math.max(0.0001, b.at - a.at);
        break;
      }
    }
  }

  const pa = PALETTES[a.phase];
  const pb = PALETTES[b.phase];
  const tint = SEASON_TINT[season];

  const blend = (k: "top" | "mid" | "bottom") =>
    mixHex(mixHex(pa[k], pb[k], t), tint.color, tint.amount);

  let stars = pa.stars + (pb.stars - pa.stars) * t;
  let top = blend("top");
  let mid = blend("mid");
  let bottom = blend("bottom");

  // 흐리거나 비/눈이면 공기가 뿌예지고 별이 가린다
  if (weather) {
    if (weather.precip !== "none") {
      const grey = weather.precip === "snow" ? "#48535e" : "#37414b";
      const amt = 0.16 + 0.1 * weather.intensity;
      top = mixHex(top, grey, amt);
      mid = mixHex(mid, grey, amt);
      bottom = mixHex(bottom, grey, amt);
      stars *= 0.15;
    } else if (weather.overcast) {
      top = mixHex(top, "#3a4048", 0.12);
      mid = mixHex(mid, "#3a4048", 0.12);
      bottom = mixHex(bottom, "#3a4048", 0.1);
      stars *= 0.35;
    }
  }

  return { top, mid, bottom, stars, phase: t < 0.5 ? a.phase : b.phase };
}

// ── 미리보기 오버라이드 ────────────────────────────────────────────
/**
 * `?atmos=winter,night,snow` 처럼 주소로 장면을 고정한다.
 *
 * 배경은 계절·시각·날씨에 따라 달라지는데, 그러면 **만든 사람도 1년에 한 번밖에
 * 못 보는 화면**이 생긴다. 검토·QA 용으로 열어 두되 기본 동작은 건드리지 않는다.
 * (읽기 전용이고 아무 데이터도 바꾸지 않아 노출돼도 안전하다.)
 *
 * 토큰: spring|summer|autumn|winter · dawn|morning|day|golden|dusk|night
 *       · rain|snow|clear · h14.5(시각 직접 지정)
 */
export interface AtmosOverride {
  season?: Season;
  /** 시간대 토큰(일출·일몰 기준으로 환산) */
  phase?: SkyPhase;
  /** 시각 직접 지정(0~24) */
  hour?: number;
  precip?: Precip;
}

const SEASON_TOKEN: Record<string, Season> = {
  spring: "spring",
  summer: "summer",
  autumn: "autumn",
  fall: "autumn",
  winter: "winter",
  봄: "spring",
  여름: "summer",
  가을: "autumn",
  겨울: "winter",
};

const PHASE_TOKEN: SkyPhase[] = [
  "night",
  "dawn",
  "morning",
  "day",
  "golden",
  "dusk",
];

/** 계절 대표일(연중일수) — 각 계절 한가운데 */
const SEASON_DOY: Record<Season, number> = {
  spring: 105, // 4/15
  summer: 196, // 7/15
  autumn: 288, // 10/15
  winter: 15, // 1/15
};

export function parseAtmos(search: string): AtmosOverride | null {
  const raw = new URLSearchParams(search).get("atmos");
  if (!raw) return null;
  const out: AtmosOverride = {};
  for (const t of raw.toLowerCase().split(/[,\s]+/).filter(Boolean)) {
    if (SEASON_TOKEN[t]) out.season = SEASON_TOKEN[t];
    else if ((PHASE_TOKEN as string[]).includes(t)) out.phase = t as SkyPhase;
    else if (t === "rain" || t === "비") out.precip = "rain";
    else if (t === "snow" || t === "눈") out.precip = "snow";
    else if (t === "clear" || t === "맑음") out.precip = "none";
    else if (/^h\d/.test(t)) {
      const n = parseFloat(t.slice(1));
      if (Number.isFinite(n)) out.hour = ((n % 24) + 24) % 24;
    }
  }
  return Object.keys(out).length ? out : null;
}

/** 오버라이드를 적용한 실제 절기·시각 */
export function resolveWhen(
  now: Date,
  ov: AtmosOverride | null
): { dayOfYear: number; hour: number; season: Season } {
  const parts = kstParts(now);
  const season = ov?.season ?? seasonOf(parts.month);
  const dayOfYear = ov?.season ? SEASON_DOY[ov.season] : parts.dayOfYear;
  let hour = ov?.hour ?? parts.hour;
  if (ov?.phase && ov.hour == null) {
    const s = sunTimes(dayOfYear);
    hour = {
      night: (s.sunset + 3) % 24,
      dawn: s.sunrise - 0.2,
      morning: s.sunrise + 1.2,
      day: s.noon,
      golden: s.sunset - 0.9,
      dusk: s.sunset + 0.3,
    }[ov.phase];
  }
  return { dayOfYear, hour, season };
}

// ── 날씨 해석 ──────────────────────────────────────────────────────
/**
 * `/api/river-status` 응답 → 배경에 내릴 강수.
 *
 * **예보가 아니라 현재 관측만 쓴다.** `skyText` 는 Open-Meteo 의 현재 weather_code
 * 를 번역한 값이고, `rainfall1h` 는 기상청 AWS 실측(또는 Open-Meteo 현재 강수)이다.
 * "오늘 비 예보"만 있고 지금은 맑은데 화면에 비가 내리면 그건 거짓말이 된다.
 */
export function weatherFrom(data: RiverStatusResponse | null): Weather {
  if (!data) {
    return { precip: "none", intensity: 0, overcast: false, label: null };
  }
  const sky = data.skyText ?? "";
  const mm = data.rainfall1h ?? 0;
  const temp = data.temperature;

  const snowText = sky.includes("눈");
  const rainText =
    sky.includes("비") || sky.includes("소나기") || sky.includes("뇌우");
  const wet = mm > 0;

  let precip: Precip = "none";
  if (snowText) precip = "snow";
  else if (rainText || wet) {
    // 텍스트에 없어도 기온이 영하이고 강수가 있으면 눈으로 본다
    precip = temp != null && temp <= 0 ? "snow" : "rain";
  }

  // 세기: 관측 강수량(mm/h) 기준. 값이 없으면(텍스트만 있으면) 약하게.
  const intensity =
    precip === "none" ? 0 : Math.max(0.28, Math.min(1, mm / 5));

  const overcast =
    sky.includes("흐") || sky.includes("구름") || sky.includes("안개");

  const label =
    precip === "snow"
      ? "지금 홍천 · 눈"
      : precip === "rain"
      ? "지금 홍천 · 비"
      : null;

  return { precip, intensity, overcast, label };
}
