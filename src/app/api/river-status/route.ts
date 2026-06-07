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
 * 홍천강 인근의 실시간 기상(기온·강수·날씨)을 Open-Meteo API로 가져와
 * 아웃도어 지수를 함께 반환합니다.
 *
 * Open-Meteo(https://open-meteo.com)는 비상업적 사용 시 API 키·회원가입이
 * 필요 없는 무료 기상 API입니다. 호출 실패 시 예시(mock) 데이터로 폴백합니다.
 */

// 매 요청 시 최신값을 받도록 동적 처리
export const dynamic = "force-dynamic";

const OPEN_METEO_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
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
  let result: { status: RiverStatus; forecast: DailyForecast | null };
  try {
    result = await fetchFromOpenMeteo();
  } catch {
    // 외부 API 장애 시에도 위젯이 깨지지 않도록 폴백
    result = mockStatus();
  }

  const body: RiverStatusResponse = {
    ...result.status,
    index: computeOutdoorIndex(result.status),
    forecast: result.forecast,
  };

  return NextResponse.json(body, {
    headers: { "Cache-Control": "no-store" },
  });
}
