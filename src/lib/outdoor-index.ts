import type { OutdoorIndex, RiverStatus } from "@/types/river";

/**
 * 홍천강 아웃도어 지수 산정.
 * 강수량 · 수위 · 기온을 종합해 안전 / 주의 / 위험을 판정한다.
 * (현장 안전 기준은 추후 지자체 가이드에 맞춰 임계값만 조정하면 됩니다.)
 */
export function computeOutdoorIndex(status: RiverStatus): OutdoorIndex {
  const { rainfall1h, temperature } = status;

  // 1) 위험: 강한 비
  if ((rainfall1h ?? 0) >= 10) {
    return {
      level: "danger",
      label: "위험",
      reason: "강수량이 많아 하천 접근이 위험합니다. 활동을 자제하세요.",
    };
  }

  // 2) 주의: 약한 비 또는 극한 기온
  if (
    (rainfall1h ?? 0) >= 1 ||
    (temperature != null && (temperature <= 0 || temperature >= 33))
  ) {
    return {
      level: "caution",
      label: "주의",
      reason: "기상·수위 변화가 있습니다. 안전 수칙을 지키며 활동하세요.",
    };
  }

  // 3) 안전
  return {
    level: "safe",
    label: "안전",
    reason: "아웃도어 활동하기 좋은 상태입니다.",
  };
}
