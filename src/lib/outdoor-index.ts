import type { DailyForecast, OutdoorIndex, RiverStatus } from "@/types/river";

/**
 * 홍천강 아웃도어 지수 산정.
 * 현재 강수량·기온에 더해, 오늘 강수 예보(forecast)까지 반영해
 * 안전 / 주의 / 위험을 판정한다.
 * (현장 안전 기준은 추후 지자체 가이드에 맞춰 임계값만 조정하면 됩니다.)
 */
export function computeOutdoorIndex(
  status: RiverStatus,
  forecast?: DailyForecast | null
): OutdoorIndex {
  const { rainfall1h, temperature } = status;
  const rain = rainfall1h ?? 0;

  // 1) 위험: 현재 강한 비
  if (rain >= 10) {
    return {
      level: "danger",
      label: "위험",
      reason: "강수량이 많아 하천 접근이 위험합니다. 활동을 자제하세요.",
    };
  }

  // 2) 주의: 현재 약한 비 · 극한 기온 · 오늘 강수 예보
  const tempExtreme =
    temperature != null && (temperature <= 0 || temperature >= 33);
  const rainForecast = forecast?.willPrecipitate ?? false;

  if (rain >= 1 || tempExtreme || rainForecast) {
    let reason: string;
    if (rain >= 1) {
      reason = "비가 내리고 있어 하천 수위·유속 변화에 주의가 필요합니다.";
    } else if (rainForecast) {
      reason =
        "오늘 강수 예보가 있어 하천 상황이 갑자기 변할 수 있습니다. 안전 수칙을 지키며 활동하세요.";
    } else {
      reason =
        "기온 변화가 큰 날입니다. 보온·수분 보충 등 안전 수칙을 지키며 활동하세요.";
    }
    return { level: "caution", label: "주의", reason };
  }

  // 3) 안전
  return {
    level: "safe",
    label: "안전",
    reason: "아웃도어 활동하기 좋은 상태입니다.",
  };
}
