import { NextResponse } from "next/server";
import { computeOutdoorIndex } from "@/lib/outdoor-index";
import { HONGCHEON_RIVER_CENTER } from "@/constants";
import type {
  DailyForecast,
  RiverStatus,
  RiverStatusResponse,
} from "@/types/river";

/**
 * GET /api/river-status
 *
 * 홍천강 인근의 날씨(기온·강수·하늘상태)와 오늘 예보를 아웃도어 지수와 함께 반환합니다.
 *
 * 데이터 소스(하이브리드):
 *  - 현재 기온·강수: 기상청 AWS 1분 실측(공공데이터포털, KMA_SERVICE_KEY 필요) — 거의 실시간.
 *    키가 없거나 호출 실패 시 Open-Meteo 값으로 폴백.
 *  - 하늘상태(맑음/흐림 등)·오늘 강수 예보: Open-Meteo(키 불필요).
 *  - 둘 다 실패하면 예시(mock) 데이터로 폴백해 위젯이 깨지지 않게 합니다.
 */

// 매 요청 시 최신값을 받도록 동적 처리
export const dynamic = "force-dynamic";

const OPEN_METEO_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
// 기상청 AWS(방재) 1분 관측 — 공공데이터포털
const KMA_AWS_ENDPOINT =
  "https://apis.data.go.kr/1360000/Aws1miInfoService/getAws1miList";
const LOCATION_NAME = "홍천강 (홍천군)";

/** WMO weather code → 한글 텍스트 */
function weatherCodeToText(code: number | undefined): string {
  if (code == null) return "정보 없음";
  if (code === 0) return "맑음";
  if (code === 1) return "대체로 맑음";
  if (code === 2) return "구름 조금";
  if (code === 3) return "흐림";
  if (code === 45 || code === 48) return "안개";
  if (code >= 51 && code <= 57) return "이슬비";
  if (code >= 61 && code <= 67) return "비";
  if (code >= 71 && code <= 77) return "눈";
  if (code >= 80 && code <= 82) return "소나기";
  if (code === 85 || code === 86) return "소나기눈";
  if (code >= 95) return "뇌우";
  return "정보 없음";
}

interface OpenMeteoResponse {
  current?: {
    time?: string;
    temperature_2m?: number;
    precipitation?: number;
    weather_code?: number;
  };
  daily?: {
    weather_code?: number[];
    precipitation_probability_max?: number[];
    precipitation_sum?: number[];
  };
}

/** WMO 코드가 눈 계열인지 */
function isSnowCode(code: number | undefined): boolean {
  return code != null && [71, 73, 75, 77, 85, 86].includes(code);
}

/** 오늘의 예보 요약 생성 */
function buildForecast(daily: OpenMeteoResponse["daily"]): DailyForecast | null {
  if (!daily) return null;
  const code = daily.weather_code?.[0];
  const prob = daily.precipitation_probability_max?.[0] ?? null;
  const sum = daily.precipitation_sum?.[0] ?? 0;

  const snow = isSnowCode(code);
  const willPrecipitate =
    snow ||
    (code != null && code >= 51) || // 이슬비 이상
    (prob != null && prob >= 50) ||
    sum >= 0.5;

  const probText = prob != null ? ` (강수확률 ${prob}%)` : "";
  let message: string;
  if (snow) {
    message = `오늘 눈 예보가 있습니다${probText}`;
  } else if (willPrecipitate) {
    message = `오늘 비 예보가 있습니다${probText}`;
  } else if (code != null && code <= 1) {
    message = "오늘은 대체로 맑겠습니다";
  } else {
    message = "오늘은 비 예보가 없습니다";
  }

  return { willPrecipitate, precipProbability: prob, message };
}

/** Open-Meteo 호출 후 현재 상태 + 오늘 예보로 정규화 */
async function fetchFromOpenMeteo(): Promise<{
  status: RiverStatus;
  forecast: DailyForecast | null;
}> {
  const params = new URLSearchParams({
    latitude: String(HONGCHEON_RIVER_CENTER.lat),
    longitude: String(HONGCHEON_RIVER_CENTER.lng),
    current: "temperature_2m,precipitation,weather_code",
    daily: "weather_code,precipitation_probability_max,precipitation_sum",
    forecast_days: "1",
    timezone: "Asia/Seoul",
  });

  const res = await fetch(`${OPEN_METEO_ENDPOINT}?${params.toString()}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Open-Meteo 응답 오류: ${res.status}`);

  const json = (await res.json()) as OpenMeteoResponse;
  const current = json.current;
  if (!current || current.temperature_2m == null) {
    throw new Error("Open-Meteo 응답에 현재 관측값이 없습니다.");
  }

  // current.time 은 "2024-06-03T19:00" (Asia/Seoul 로컬). ISO 로 변환.
  const observedAt = current.time
    ? `${current.time}:00+09:00`
    : new Date().toISOString();

  return {
    status: {
      location: LOCATION_NAME,
      observedAt,
      temperature: current.temperature_2m,
      rainfall1h: current.precipitation ?? 0,
      skyText: weatherCodeToText(current.weather_code),
      source: "live",
    },
    forecast: buildForecast(json.daily),
  };
}

// ── 기상청 AWS 1분 실측 ──────────────────────────────────────────
interface KmaAwsItem {
  ta?: string | number;
  rn60M?: string | number;
  rn?: string | number;
}
interface KmaAwsResponse {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: { items?: { item?: KmaAwsItem | KmaAwsItem[] } };
  };
}

/** 숫자 파싱 (빈 값/결측 마커 -99·-999 등은 null 처리) */
function num(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = parseFloat(String(v));
  if (!Number.isFinite(n) || n <= -50) return null;
  return n;
}

/** KST(UTC+9) 기준 분 단위 시각 문자열(YYYYMMDDHHmm), minutesBack 분 전 */
function kstStamp(minutesBack: number): string {
  const d = new Date(Date.now() + 9 * 3600 * 1000 - minutesBack * 60000);
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}` +
    `${p(d.getUTCHours())}${p(d.getUTCMinutes())}`
  );
}

/** YYYYMMDDHHmm → ISO(+09:00) */
function stampToIso(s: string): string {
  return (
    `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` +
    `T${s.slice(8, 10)}:${s.slice(10, 12)}:00+09:00`
  );
}

/**
 * 기상청 AWS 1분 실측에서 현재 기온·강수를 가져온다.
 * 최신 분이 아직 게시 전일 수 있어 최근 몇 분을 거슬러 시도한다.
 * 키가 없거나 모두 실패하면 null 을 반환해 Open-Meteo 로 폴백한다.
 */
async function fetchFromKma(): Promise<{
  temperature: number | null;
  rainfall1h: number | null;
  observedAt: string;
} | null> {
  const key = process.env.KMA_SERVICE_KEY;
  if (!key) return null;
  const station = process.env.KMA_AWS_STATION || "212"; // 212 = 홍천

  for (let back = 1; back <= 5; back++) {
    const stamp = kstStamp(back);
    const url =
      `${KMA_AWS_ENDPOINT}?serviceKey=${key}&dataType=JSON&pageNo=1` +
      `&numOfRows=10&awsDt=${stamp}&awsId=${station}`;
    try {
      const res = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      });
      // 401/403 은 키·권한 문제이므로 재시도하지 않고 즉시 폴백한다
      if (res.status === 401 || res.status === 403) return null;
      if (!res.ok) continue;
      const json = (await res.json()) as KmaAwsResponse;
      const code = json.response?.header?.resultCode;
      if (code !== "00") {
        // 키 미등록(30)·만료(31)·한도초과(22) 는 재시도 무의미 → 폴백
        if (code === "30" || code === "31" || code === "22") return null;
        continue; // 03(NO_DATA) 등은 이전 분으로 재시도
      }
      const items = json.response?.body?.items?.item;
      const item = Array.isArray(items) ? items[0] : items;
      if (!item) continue;
      const ta = num(item.ta);
      if (ta == null) continue; // 기온이 없으면 유효 관측으로 보지 않음
      const rn = num(item.rn60M ?? item.rn); // 최근 1시간 강수 우선
      return { temperature: ta, rainfall1h: rn, observedAt: stampToIso(stamp) };
    } catch {
      // 다음 분으로 재시도
    }
  }
  return null;
}

/** 외부 API 장애 시 사용하는 예시 데이터 */
function mockStatus(): { status: RiverStatus; forecast: DailyForecast | null } {
  return {
    status: {
      location: LOCATION_NAME,
      observedAt: new Date().toISOString(),
      temperature: 21,
      rainfall1h: 0,
      skyText: "맑음",
      source: "mock",
    },
    forecast: null,
  };
}

export async function GET() {
  // Open-Meteo(예보 + 폴백 현재값)와 기상청 실측을 병렬로 요청
  const [base, kma] = await Promise.all([
    fetchFromOpenMeteo().catch(() => mockStatus()),
    fetchFromKma().catch(() => null),
  ]);

  let status = base.status;

  // 기상청 실측이 있으면 현재 기온·강수·관측시각을 실시간 값으로 교체
  // (하늘상태 skyText 는 AWS 에 없으므로 Open-Meteo 값을 유지)
  if (kma) {
    status = {
      ...status,
      temperature: kma.temperature ?? status.temperature,
      rainfall1h: kma.rainfall1h ?? status.rainfall1h,
      observedAt: kma.observedAt,
      source: "kma",
    };
  }

  const body: RiverStatusResponse = {
    ...status,
    index: computeOutdoorIndex(status, base.forecast),
    forecast: base.forecast,
  };

  // CDN에서 60초 캐시(+5분 stale-while-revalidate)로 외부 API(기상청·Open-Meteo) 호출량 제한.
  // 데이터 granularity가 1~15분이라 60초 캐시는 신선도 손실이 거의 없다.
  // CORS 허용 — 텔레그램 봇·외부 위젯(브라우저 포함)에서 호출 가능.
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
