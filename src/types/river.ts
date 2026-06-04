/**
 * 홍천강 실시간 상태 + 아웃도어 지수 도메인 타입.
 * 기상청 초단기실황(또는 수자원 API) 응답을 정규화한 형태입니다.
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
  /** 데이터 출처: 실시간 API / 예시(mock) */
  source: "live" | "mock";
}

/** API 라우트가 반환하는 최종 응답 형태 */
export interface RiverStatusResponse extends RiverStatus {
  index: OutdoorIndex;
}
