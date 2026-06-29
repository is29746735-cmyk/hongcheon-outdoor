/**
 * 홍천강 실시간 상태 + 아웃도어 지수 도메인 타입.
 * Open-Meteo 기상 API 응답을 정규화한 형태입니다.
 */

export type OutdoorIndexLevel = "safe" | "caution" | "danger";

export interface OutdoorIndex {
  level: OutdoorIndexLevel;
  /** 한글 라벨: 안전 / 주의 / 위험 */
  label: string;
  /** 판정 근거 한 줄 설명 */
  reason: string;
}

export interface RiverStatus {
  /** 관측 지점명 */
  location: string;
  /** 관측 시각 (ISO 문자열) */
  observedAt: string;
  /** 기온(°C) — 없으면 null */
  temperature: number | null;
  /** 1시간 강수량(mm) — 없으면 null */
  rainfall1h: number | null;
  /** 하늘/강수 상태 텍스트 (예: 맑음, 비) */
  skyText: string | null;
  /** 데이터 출처: 기상청 실측(kma) / Open-Meteo(live) / 예시(mock) */
  source: "kma" | "live" | "mock";
}

/** 오늘의 날씨 예보 */
export interface DailyForecast {
  /** 비/눈 등 강수 예보 여부 */
  willPrecipitate: boolean;
  /** 강수확률(%) — 없으면 null */
  precipProbability: number | null;
  /** 예보 요약 문구 (예: "오늘 비 예보가 있습니다 (강수확률 69%)") */
  message: string;
}

/** 일자별 예보 (오늘 포함 N일치) */
export interface DayForecast {
  /** 날짜 (YYYY-MM-DD, Asia/Seoul) */
  date: string;
  /** 하늘/강수 상태 텍스트 (예: 맑음, 비) */
  skyText: string;
  /** 최고 기온(°C) — 없으면 null */
  tempMax: number | null;
  /** 최저 기온(°C) — 없으면 null */
  tempMin: number | null;
  /** 강수확률(%) — 없으면 null */
  precipProbability: number | null;
  /** 비/눈 예보 여부 */
  willPrecipitate: boolean;
}

/** API 라우트가 반환하는 최종 응답 형태 */
export interface RiverStatusResponse extends RiverStatus {
  index: OutdoorIndex;
  /** 오늘의 예보 (없으면 null) */
  forecast: DailyForecast | null;
  /** 오늘 포함 며칠치 일자별 예보 (오늘 이후는 정확도가 낮음) */
  days: DayForecast[];
}
