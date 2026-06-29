/**
 * 낚시·캠핑 용품 큐레이션 (제휴 쇼핑 링크용).
 *
 * ⚠️ 현재 각 항목 shops[].url 은 의도적으로 비어 있습니다(예시 단계).
 * 실제 제휴 링크(쿠팡 파트너스·네이버쇼핑 등)가 확정되면 url 만 채우면 됩니다.
 * url 이 채워지면 페이지에서 자동으로 활성(클릭 가능) 버튼으로 렌더됩니다.
 */

export type GearCategory = "fishing" | "camping";

export interface ShopLink {
  /** 쇼핑몰 이름 (예: 쿠팡, 네이버쇼핑) */
  store: string;
  /** 제휴 링크 URL — 미설정(undefined) 시 '준비 중' 상태로 표시(예시) */
  url?: string;
}

export interface GearItem {
  /** 고유 식별자 */
  id: string;
  name: string;
  category: GearCategory;
  /** 한 줄 설명 (용도·특징) */
  summary: string;
  /** 분류/검색용 태그 */
  tags?: string[];
  /** 쇼핑몰 제휴 링크 (현재 예시 — url 미설정) */
  shops: ShopLink[];
}

/** 항목마다 새 배열을 반환(향후 항목별 url을 따로 채워도 서로 영향 없게). */
const shops = (): ShopLink[] => [{ store: "쿠팡" }, { store: "네이버쇼핑" }];

const GEAR: GearItem[] = [
  // ── 낚시용품 ───────────────────────────────────────────
  {
    id: "gyeonji-rod-set",
    name: "견지대 세트",
    category: "fishing",
    summary: "홍천강 견지낚시 입문용 견지대·줄 기본 구성.",
    tags: ["견지낚시", "입문"],
    shops: shops(),
  },
  {
    id: "lure-rod",
    name: "루어 로드",
    category: "fishing",
    summary: "쏘가리·배스 루어 낚시에 쓰는 낚싯대.",
    tags: ["루어", "쏘가리"],
    shops: shops(),
  },
  {
    id: "spinning-reel",
    name: "스피닝 릴",
    category: "fishing",
    summary: "루어 낚시용 릴. 로드와 함께 맞추면 좋습니다.",
    tags: ["루어", "릴"],
    shops: shops(),
  },
  {
    id: "soft-bait-set",
    name: "웜·지그헤드 세트",
    category: "fishing",
    summary: "쏘가리·배스용 소프트베이트 소모품.",
    tags: ["루어", "소모품"],
    shops: shops(),
  },
  {
    id: "life-vest",
    name: "구명조끼",
    category: "fishing",
    summary: "강변·보트 낚시 안전을 위한 필수 장비.",
    tags: ["안전"],
    shops: shops(),
  },
  {
    id: "head-lamp",
    name: "헤드랜턴",
    category: "fishing",
    summary: "야간 쏘가리 낚시에 쓰는 충전식 헤드랜턴.",
    tags: ["야간", "조명"],
    shops: shops(),
  },
  {
    id: "fishing-chair",
    name: "접이식 낚시 의자",
    category: "fishing",
    summary: "노지·좌대에서 쓰는 휴대용 의자.",
    tags: ["편의"],
    shops: shops(),
  },
  {
    id: "landing-net",
    name: "다용도 뜰채",
    category: "fishing",
    summary: "랜딩과 다슬기 채집에 두루 쓰는 뜰채.",
    tags: ["편의"],
    shops: shops(),
  },

  // ── 캠핑용품 ───────────────────────────────────────────
  {
    id: "dome-tent",
    name: "돔 텐트 (3~4인)",
    category: "camping",
    summary: "가족 오토캠핑에 적당한 크기의 돔 텐트.",
    tags: ["텐트", "가족"],
    shops: shops(),
  },
  {
    id: "tarp",
    name: "타프",
    category: "camping",
    summary: "햇빛·비를 가리는 그늘막. 강변 캠핑에 유용.",
    tags: ["그늘막"],
    shops: shops(),
  },
  {
    id: "camping-chair",
    name: "캠핑 의자",
    category: "camping",
    summary: "접이식 경량 체어. 휴대·수납이 간편합니다.",
    tags: ["편의"],
    shops: shops(),
  },
  {
    id: "folding-table",
    name: "접이식 테이블",
    category: "camping",
    summary: "높이 조절이 되는 캠핑 테이블.",
    tags: ["편의"],
    shops: shops(),
  },
  {
    id: "fire-pit",
    name: "화로대",
    category: "camping",
    summary: "불멍·바비큐용 화로대. 직화 자리에서만 사용하세요.",
    tags: ["불멍"],
    shops: shops(),
  },
  {
    id: "led-lantern",
    name: "LED 랜턴",
    category: "camping",
    summary: "충전식 캠핑 조명. 텐트 안팎에서 사용.",
    tags: ["조명"],
    shops: shops(),
  },
  {
    id: "sleeping-bag",
    name: "침낭",
    category: "camping",
    summary: "3계절용 머미형 침낭.",
    tags: ["수면"],
    shops: shops(),
  },
  {
    id: "self-inflating-mat",
    name: "자충 매트",
    category: "camping",
    summary: "바닥 냉기·요철을 막아주는 자동 팽창 매트.",
    tags: ["수면"],
    shops: shops(),
  },
  {
    id: "cooler-box",
    name: "아이스박스",
    category: "camping",
    summary: "식자재·음료 보냉용 아이스박스.",
    tags: ["주방"],
    shops: shops(),
  },
  {
    id: "stove-set",
    name: "코펠·버너 세트",
    category: "camping",
    summary: "취사에 필요한 코펠과 버너 구성.",
    tags: ["주방"],
    shops: shops(),
  },
];

export function getAllGear(): GearItem[] {
  return GEAR;
}

export function getGearByCategory(category: GearCategory): GearItem[] {
  return GEAR.filter((g) => g.category === category);
}
