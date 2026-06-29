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
  /** 한 줄 설명 (카드용) */
  summary: string;
  /** 분류/검색용 태그 */
  tags?: string[];
  /** 쇼핑몰 제휴 링크 (현재 예시 — url 미설정) */
  shops: ShopLink[];
  /** 상세 설명 (클릭 시 설명창에 표시) */
  description?: string;
  /** 구매 팁 (설명창) */
  tips?: string[];
  /** 주의문 (설명창) */
  cautions?: string[];
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
    description:
      "견지낚시는 합사줄을 손으로 직접 풀고 감으며 물살에 미끼를 흘려보내는 전통 낚시입니다. 홍천강처럼 물살이 있는 여울에서 즐기기 좋습니다.",
    tips: [
      "입문은 견지대·줄·채비가 함께 든 세트가 편합니다.",
      "물살 세기에 맞춰 봉돌(무게)을 여러 개 준비하세요.",
      "합사줄 3~4호가 무난합니다.",
    ],
    cautions: [
      "여울 바닥은 미끄러우니 미끄럼 방지 신발과 구명조끼를 착용하세요.",
      "쏘가리는 금어기·체장 제한이 있으니 시즌과 규정을 확인하세요.",
    ],
  },
  {
    id: "lure-rod",
    name: "루어 로드",
    category: "fishing",
    summary: "쏘가리·배스 루어 낚시에 쓰는 낚싯대.",
    tags: ["루어", "쏘가리"],
    shops: shops(),
    description:
      "가짜 미끼(루어)를 던지고 감아 입질을 유도하는 낚싯대입니다. 쏘가리·배스·끄리 등에 두루 씁니다.",
    tips: [
      "홍천강 쏘가리에는 6~7피트 ML~M 등급이 무난합니다.",
      "릴·줄과 등급(루어 무게)을 맞춰야 캐스팅이 편합니다.",
    ],
    cautions: [
      "루어 바늘이 날카로우니 보관·이동 시 케이스를 사용하세요.",
      "캐스팅 전 주변에 사람이 없는지 확인하세요.",
    ],
  },
  {
    id: "spinning-reel",
    name: "스피닝 릴",
    category: "fishing",
    summary: "루어 낚시용 릴. 로드와 함께 맞추면 좋습니다.",
    tags: ["루어", "릴"],
    shops: shops(),
    description:
      "루어 낚시에 가장 무난한 형태의 릴입니다. 초보도 다루기 쉽습니다.",
    tips: [
      "쏘가리용은 2000~2500번 크기가 무난합니다.",
      "드랙(견제력) 조절이 부드러운 제품이 좋습니다.",
    ],
    cautions: ["물·모래가 들어가면 수명이 줄어요. 사용 후 가볍게 닦아 보관하세요."],
  },
  {
    id: "soft-bait-set",
    name: "웜·지그헤드 세트",
    category: "fishing",
    summary: "쏘가리·배스용 소프트베이트 소모품.",
    tags: ["루어", "소모품"],
    shops: shops(),
    description:
      "부드러운 가짜 미끼(웜)와 그 끝에 끼우는 지그헤드 바늘 세트입니다. 소모품이라 넉넉히 챙기면 좋습니다.",
    tips: [
      "바닥 지형에 잘 걸리니 여러 무게의 지그헤드를 준비하세요.",
      "물색이 흐릴 땐 어두운색, 맑을 땐 자연색 웜이 무난합니다.",
    ],
    cautions: ["웜은 플라스틱이라 현장에 버리지 말고 되가져오세요."],
  },
  {
    id: "life-vest",
    name: "구명조끼",
    category: "fishing",
    summary: "강변·보트 낚시 안전을 위한 필수 장비.",
    tags: ["안전"],
    shops: shops(),
    description:
      "강이나 보트 위 낚시에서 안전을 지켜주는 필수 장비입니다.",
    tips: [
      "체중에 맞는 부력 등급을 고르세요.",
      "활동이 많으면 부피가 작은 벨트형도 고려할 만합니다.",
    ],
    cautions: [
      "아이는 반드시 아동용 사이즈를 착용시키세요.",
      "물살이 센 곳이나 혼자 입수는 피하세요.",
    ],
  },
  {
    id: "head-lamp",
    name: "헤드랜턴",
    category: "fishing",
    summary: "야간 쏘가리 낚시에 쓰는 충전식 헤드랜턴.",
    tags: ["야간", "조명"],
    shops: shops(),
    description:
      "두 손을 자유롭게 쓰며 앞을 비추는 충전식 조명입니다. 야간 쏘가리 낚시에 유용합니다.",
    tips: [
      "밝기(루멘)와 연속 점등 시간을 함께 확인하세요.",
      "붉은빛 모드가 있으면 눈부심과 물고기 경계를 줄여줍니다.",
    ],
    cautions: [
      "다른 낚시인의 얼굴을 직접 비추지 마세요.",
      "방수 등급(IPX)을 확인하면 비·물튀김에 안전합니다.",
    ],
  },
  {
    id: "fishing-chair",
    name: "접이식 낚시 의자",
    category: "fishing",
    summary: "노지·좌대에서 쓰는 휴대용 의자.",
    tags: ["편의"],
    shops: shops(),
    description: "오래 앉아 기다릴 때 쓰는 휴대용 의자입니다.",
    tips: [
      "바닥이 무른 곳에서는 다리가 넓은 제품이 덜 빠집니다.",
      "등받이·팔걸이 유무를 용도에 맞게 고르세요.",
    ],
    cautions: ["제품별 하중 한계를 확인하세요."],
  },
  {
    id: "landing-net",
    name: "다용도 뜰채",
    category: "fishing",
    summary: "랜딩과 다슬기 채집에 두루 쓰는 뜰채.",
    tags: ["편의"],
    shops: shops(),
    description:
      "잡은 물고기를 안전하게 떠올리거나 다슬기 채집에 쓰는 그물망입니다.",
    tips: [
      "손잡이가 늘어나는(텔레스코픽) 제품이 휴대에 편합니다.",
      "물고기를 놓아줄 거라면 고무망이 비늘·점액 손상이 적습니다.",
    ],
    cautions: ["다슬기 등 채집은 지역·시기별 규정을 확인하세요."],
  },

  // ── 캠핑용품 ───────────────────────────────────────────
  {
    id: "dome-tent",
    name: "돔 텐트 (3~4인)",
    category: "camping",
    summary: "가족 오토캠핑에 적당한 크기의 돔 텐트.",
    tags: ["텐트", "가족"],
    shops: shops(),
    description:
      "기둥(폴)을 교차해 세우는 가장 보편적인 형태의 텐트입니다. 설치가 쉬워 입문용으로 좋습니다.",
    tips: [
      "실제 인원보다 1~2인 큰 걸 고르면 짐 두기 편합니다.",
      "내수압(mm) 수치가 높을수록 비에 강합니다.",
    ],
    cautions: [
      "강변은 밤에 결로·바람이 있으니 팩(고정핀)을 단단히 박으세요.",
      "설치 가능 여부와 사이트 규격을 캠핑장에 미리 확인하세요.",
    ],
  },
  {
    id: "tarp",
    name: "타프",
    category: "camping",
    summary: "햇빛·비를 가리는 그늘막. 강변 캠핑에 유용.",
    tags: ["그늘막"],
    shops: shops(),
    description:
      "햇빛과 비를 가리는 큰 천 그늘막입니다. 텐트 앞에 거실 공간을 만들어 줍니다.",
    tips: [
      "폴·스트링·팩이 충분히 들었는지 확인하세요.",
      "혼자 설치가 어렵다면 자립형 구조를 고려하세요.",
    ],
    cautions: [
      "바람이 강한 날은 면적이 넓어 위험할 수 있어요. 단단히 고정하거나 접으세요.",
    ],
  },
  {
    id: "camping-chair",
    name: "캠핑 의자",
    category: "camping",
    summary: "접이식 경량 체어. 휴대·수납이 간편합니다.",
    tags: ["편의"],
    shops: shops(),
    description:
      "접어서 휴대하는 캠핑용 의자입니다. 무게·수납 크기·편안함이 선택 포인트입니다.",
    tips: [
      "오래 앉으려면 등받이가 높은 릴랙스형이 편합니다.",
      "백패킹엔 초경량, 오토캠핑엔 튼튼한 제품이 무난합니다.",
    ],
    cautions: ["하중 한계와 다리 끝 마감(잔디·데크 손상)을 확인하세요."],
  },
  {
    id: "folding-table",
    name: "접이식 테이블",
    category: "camping",
    summary: "높이 조절이 되는 캠핑 테이블.",
    tags: ["편의"],
    shops: shops(),
    description: "조리와 식사에 쓰는 접이식 캠핑 테이블입니다.",
    tips: [
      "높이 조절이 되면 의자식·좌식 모두 맞출 수 있습니다.",
      "상판 소재(메탈·우드)에 따라 내열·청소 편의가 달라집니다.",
    ],
    cautions: ["뜨거운 코펠은 받침을 깔고 올리세요."],
  },
  {
    id: "fire-pit",
    name: "화로대",
    category: "camping",
    summary: "불멍·바비큐용 화로대. 직화 자리에서만 사용하세요.",
    tags: ["불멍"],
    shops: shops(),
    description: "장작·숯을 안전하게 태우는 받침대입니다. 불멍과 바비큐에 씁니다.",
    tips: [
      "바닥 열을 막는 내열판을 함께 쓰면 잔디 손상을 줄일 수 있습니다.",
      "수납 크기와 무게를 차량에 맞춰 고르세요.",
    ],
    cautions: [
      "반드시 직화 허용 구역에서만 사용하세요.",
      "불을 완전히 끈 뒤 잔불을 확인하고, 재는 지정된 곳에만 버리세요.",
    ],
  },
  {
    id: "led-lantern",
    name: "LED 랜턴",
    category: "camping",
    summary: "충전식 캠핑 조명. 텐트 안팎에서 사용.",
    tags: ["조명"],
    shops: shops(),
    description: "충전식 캠핑 조명입니다. 텐트 안팎을 밝힙니다.",
    tips: [
      "밝기 단계 조절과 보조배터리 겸용 여부를 확인하세요.",
      "따뜻한 색(전구색)이 분위기와 눈 피로에 좋습니다.",
    ],
    cautions: ["취침 시에는 밝기를 낮춰 이웃 사이트에 피해를 주지 마세요."],
  },
  {
    id: "sleeping-bag",
    name: "침낭",
    category: "camping",
    summary: "3계절용 머미형 침낭.",
    tags: ["수면"],
    shops: shops(),
    description:
      "야외 취침용 보온 침구입니다. 계절·기온에 맞는 보온력 선택이 중요합니다.",
    tips: [
      "표기된 사용 가능 온도(컴포트 기준)를 보고 고르세요.",
      "강변·환절기는 생각보다 추우니 한 단계 따뜻한 걸 권합니다.",
    ],
    cautions: ["젖으면 보온력이 크게 떨어지니 방수팩에 보관하세요."],
  },
  {
    id: "self-inflating-mat",
    name: "자충 매트",
    category: "camping",
    summary: "바닥 냉기·요철을 막아주는 자동 팽창 매트.",
    tags: ["수면"],
    shops: shops(),
    description:
      "밸브를 열면 스스로 부푸는 매트입니다. 바닥 냉기와 요철을 막아줍니다.",
    tips: [
      "두꺼울수록 편하지만 부피도 커집니다.",
      "두 장을 연결하면 가족용으로 넓게 쓸 수 있습니다.",
    ],
    cautions: ["날카로운 바닥은 펑크가 날 수 있으니 그라운드시트를 까세요."],
  },
  {
    id: "cooler-box",
    name: "아이스박스",
    category: "camping",
    summary: "식자재·음료 보냉용 아이스박스.",
    tags: ["주방"],
    shops: shops(),
    description: "식자재와 음료를 차갑게 보관하는 보냉 박스입니다.",
    tips: [
      "보냉력은 단열 두께가 좌우합니다. 1박 이상이면 두꺼운 제품이 유리합니다.",
      "아이스팩을 미리 얼려 바닥과 위에 함께 깔면 더 오래 갑니다.",
    ],
    cautions: ["여름에는 직사광선을 피해 그늘에 두세요."],
  },
  {
    id: "stove-set",
    name: "코펠·버너 세트",
    category: "camping",
    summary: "취사에 필요한 코펠과 버너 구성.",
    tags: ["주방"],
    shops: shops(),
    description:
      "야외에서 취사할 때 쓰는 냄비(코펠)와 버너 구성입니다.",
    tips: [
      "인원수에 맞는 코펠 용량과 연료(가스) 호환을 확인하세요.",
      "바람이 있으면 윈드스크린(바람막이)이 화력을 지켜줍니다.",
    ],
    cautions: [
      "밀폐된 텐트·차 안에서는 절대 사용하지 마세요(일산화탄소 중독 위험).",
      "사용 후 가스를 분리하고 충분히 식히세요.",
    ],
  },
];

export function getAllGear(): GearItem[] {
  return GEAR;
}

export function getGearByCategory(category: GearCategory): GearItem[] {
  return GEAR.filter((g) => g.category === category);
}
