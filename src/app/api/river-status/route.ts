import { NextResponse } from "next/server";
import { computeOutdoorIndex } from "@/lib/outdoor-index";
import { HONGCHEON_RIVER_CENTER } from "@/constants";
import type { RiverStatus, RiverStatusResponse } from "@/types/river";

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
}

/** Open-Meteo 호출 후 RiverStatus 로 정규화 */
async function fetchFromOpenMeteo(): Promise<RiverStatus> {
  const params = new URLSearchParams({
    latitude: String(HONGCHEON_RIVER_CENTER.lat),
    longitude: String(HONGCHEON_RIVER_CENTER.lng),
    current: "temperature_2m,precipitation,weather_code",
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
    location: LOCATION_NAME,
    observedAt,
    temperature: current.temperature_2m,
    rainfall1h: current.precipitation ?? 0,
    skyText: weatherCodeToText(current.weather_code),
    source: "live",
  };
}

/** 외부 API 장애 시 사용하는 예시 데이터 */
function mockStatus(): RiverStatus {
  return {
    location: LOCATION_NAME,
    observedAt: new Date().toISOString(),
    temperature: 21,
    rainfall1h: 0,
    skyText: "맑음",
    source: "mock",
  };
}

export async function GET() {
  let status: RiverStatus;
  try {
    status = await fetchFromOpenMeteo();
  } catch {
    // 외부 API 장애 시에도 위젯이 깨지지 않도록 폴백
    status = mockStatus();
  }

  const body: RiverStatusResponse = {
    ...status,
    index: computeOutdoorIndex(status),
  };

  return NextResponse.json(body, {
    headers: { "Cache-Control": "no-store" },
  });
}
