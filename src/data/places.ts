import type { Place } from "@/types/place";

/**
 * 실제 홍천 지역 캠핑장·낚시터·차박지 큐레이션 데이터.
 * 각 항목은 공공기관/전문 출처(홍천군청, 대한민국 구석구석, 한국관광공사 고캠핑,
 * 낚시 전문지 등)로 교차 검증했으며 검증 출처를 sourceUrl 에 표기합니다.
 * 정확한 좌표가 확인된 경우에만 location 을 채우고, 그 외에는 검증된 소재지(region)와
 * 외부 지도 검색으로 안내합니다. (위치 오류 방지를 위해 좌표를 임의로 만들지 않음)
 */
const PLACES: Place[] = [
  // ── 캠핑장 ─────────────────────────────────────────────
  {
    id: "hongcheongang-auto-camping",
    thumbnail: "/images/camp-1.jpg",
    name: "홍천강오토캠핑장",
    category: "camping",
    summary: "홍천군이 운영하는 공공 오토캠핑장. 홍천강까지 데크로 연결됩니다.",
    description:
      "홍천군이 직접 운영·관리하는 공공 캠핑장입니다. 카라반·오토캠핑·프리텐트 사이트와 매점·샤워실·화장실·어린이놀이터·산책로 등 편의시설을 갖췄고, 홍천강까지 데크가 연결되어 있어 강 접근성이 좋습니다. 인근에서 수상레포츠도 즐길 수 있습니다.",
    region: "강원특별자치도 홍천군 북방면 굴지강변로 322",
    mapQuery: "홍천강오토캠핑장",
    location: { lat: 37.690281, lng: 127.787231 },
    phone: "033-430-2498",
    official: true,
    connectedFishing: true,
    connectionNote:
      "캠핑장이 자리한 북방면 굴지리 일대 홍천강은 붕어·잉어·쏘가리가 나오는 노지 낚시터로도 알려져 있어, 캠핑과 낚시를 함께 즐기기 좋습니다.",
    sourceName: "홍천군 문화관광포털",
    sourceUrl: "https://www.hongcheon.go.kr/tour/contents.do?key=1879",
    tags: ["오토캠핑", "공공운영", "홍천강", "수상레포츠"],
    activities: ["bonfire"],
    featured: true,
  },
  {
    id: "dodam-camping",
    thumbnail: "/images/river-han.jpg",
    name: "도담캠핑장",
    category: "camping",
    summary: "1급수 홍천강 도보 3분. 가족 물놀이·낚시에 특화된 캠핑장.",
    description:
      "텐트·차박·캠핑카가 가능한 19개 사이트로, 전 사이트에서 마운틴뷰와 리버뷰를 함께 볼 수 있습니다. 도보 3분 거리의 1급수 홍천강에서 아이들과 다슬기 채집·물고기 낚시·물놀이를 즐길 수 있고, 다슬기 채집통·튜브 등 물놀이 용품도 대여합니다.",
    region: "강원특별자치도 홍천군 서면 개야리",
    mapQuery: "홍천 도담캠핑장",
    location: { lat: 37.691955, lng: 127.6398379 },
    connectedFishing: true,
    connectionNote:
      "도보 3분 거리 1급수 홍천강에서 아이들과 다슬기·물고기 낚시를 즐길 수 있어, 가족 단위 캠핑+낚시에 잘 맞습니다.",
    sourceName: "땡큐캠핑",
    sourceUrl: "https://m.thankqcamping.com/resv/view.hbb?cseq=4052",
    tags: ["가족", "차박가능", "리버뷰", "1급수"],
    activities: ["bonfire"],
    featured: true,
  },
  {
    id: "mogok-bambeol",
    thumbnail: "/images/camp-2.jpg",
    name: "모곡밤벌유원지",
    category: "camping",
    summary: "캠핑·차박·낚시·물놀이를 한 곳에서. 홍천강 대표 유원지.",
    description:
      "모래·자갈 지면에 텐트를 300여 동까지 설치할 수 있는 선착순 이용 유원지로, '차박 성지'로도 불립니다. 수심이 깊지 않아 곳곳에서 견지·플라잉 낚시를 즐기는 사람들을 볼 수 있으며 피라미·쉬리·메기 등이 잡힙니다. 24시간 편의점·개수대·공용 화장실이 있고, 여름철에는 입장료(2,000원)를 받습니다.",
    region: "강원특별자치도 홍천군 서면 모곡리 528",
    mapQuery: "모곡밤벌유원지",
    location: { lat: 37.70314, lng: 127.607259 },
    phone: "033-434-0454",
    connectedFishing: true,
    connectionNote:
      "캠핑·차박을 하면서 바로 앞 홍천강에서 견지·플라잉 낚시까지 즐길 수 있는 복합 명소입니다.",
    sourceName: "대한민국 구석구석(한국관광공사)",
    sourceUrl:
      "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=0316b12d-b70f-417a-8370-29dd59caee18",
    tags: ["유원지", "차박성지", "견지낚시", "물놀이"],
    activities: ["gyeonji", "bonfire"],
    featured: true,
  },
  {
    id: "jarabawi-auto-camping",
    thumbnail: "/images/river-gapyeong.jpg",
    name: "자라바위오토캠핑장",
    category: "camping",
    summary: "팔봉산 자락, 굽이치는 홍천강을 마주한 군 공식 오토캠핑장.",
    description:
      "홍천군이 운영하는 공공 캠핑장으로, 굽이치는 홍천강과 팔봉산 자락이 어우러진 경관이 특징입니다. 오토캠핑 데크사이트(4m×6m)와 프리텐트 사이트, 어린이놀이터·육각정자·샤워장·개수대 등을 갖췄습니다.",
    region: "강원특별자치도 홍천군 서면 팔봉산로 857",
    mapQuery: "홍천 자라바위오토캠핑장",
    location: { lat: 37.68846, lng: 127.685235 },
    phone: "033-430-2497",
    official: true,
    connectedFishing: true,
    connectionNote:
      "캠핑장이 홍천강에 접해 있어 강변 낚시를 함께 즐기기 좋고, 서면 일대 홍천강은 쏘가리 낚시 포인트로도 알려져 있습니다.",
    sourceName: "홍천군 문화관광포털",
    sourceUrl: "https://www.hongcheon.go.kr/tour/contents.do?key=1886",
    tags: ["오토캠핑", "공공운영", "팔봉산", "홍천강"],
    activities: ["bonfire"],
  },
  {
    id: "sagehill-camping",
    thumbnail: "/images/camp-1.jpg",
    name: "세이지힐 캠핑장",
    category: "camping",
    summary: "남노일 홍천강변의 자동차야영장·카라반 캠핑장.",
    description:
      "남면 남노일 홍천강변에 자리한 캠핑장으로, 자동차야영장 46면과 개인카라반 10면 규모입니다. 텐트·화로대·난방기구 등 장비 대여와 온라인 실시간 예약을 제공하며 사계절 운영합니다.",
    region: "강원특별자치도 홍천군 남면 남노일로 479-24",
    mapQuery: "홍천 세이지힐 캠핑장",
    location: { lat: 37.644215, lng: 127.77001 },
    phone: "033-432-8259",
    connectedFishing: true,
    connectionNote:
      "캠핑장이 위치한 남노일 홍천강변은 견지 낚시터로 유명해, 캠핑과 낚시를 함께 즐길 수 있습니다.",
    sourceName: "한국관광공사 고캠핑",
    sourceUrl:
      "https://www.gocamping.or.kr/bsite/camp/info/read.do?c_no=100360",
    tags: ["오토캠핑", "카라반", "남노일", "장비대여"],
    activities: ["bonfire", "gyeonji"],
  },

  // ── 낚시터 ─────────────────────────────────────────────
  {
    id: "gulji-ri-fishing",
    thumbnail: "/images/fishing-1.jpg",
    name: "굴지리 홍천강 노지 낚시터",
    category: "fishing",
    summary: "붕어·잉어·쏘가리가 두루 나오는 홍천강 노지 포인트.",
    description:
      "북방면 굴지리 일대 홍천강 노지 포인트로, 붕어·잉어·메기·동자개·쏘가리 등 다양한 어종을 노릴 수 있습니다. 홍천강오토캠핑장과 같은 굴지리 권역이라 캠핑과 낚시를 함께 묶기 좋습니다.",
    region: "강원특별자치도 홍천군 북방면 굴지리 (홍천강 변)",
    mapQuery: "홍천 굴지리 홍천강",
    location: { lat: 37.710427, lng: 127.794067 },
    connectedFishing: true,
    connectionNote:
      "인접한 홍천강오토캠핑장과 같은 굴지리 권역으로, 캠핑↔낚시 이동 동선이 짧습니다.",
    sourceName: "물반(낚시터 정보)",
    sourceUrl: "https://www.moolban.com/company/9906",
    tags: ["노지낚시", "붕어", "쏘가리"],
    activities: ["lure", "gyeonji"],
  },
  {
    id: "mogok-sogari-spot",
    thumbnail: "/images/river-gapyeong.jpg",
    name: "서면 모곡 쏘가리 여울",
    category: "fishing",
    summary: "여울이 발달해 쏘가리 루어 낚시로 이름난 구간.",
    description:
      "서면 모곡 일대는 홍천강에서 여울이 가장 많이 형성된 구간으로 쏘가리 루어 명소로 꼽힙니다. 야행성인 쏘가리는 저녁부터 새벽까지, 그리고 비 온 뒤 약한 탁수가 섞일 때 활성도가 높습니다. 모곡밤벌유원지와 가까워 캠핑과 연계하기 좋습니다.",
    region: "강원특별자치도 홍천군 서면 모곡리 일대 (홍천강 여울)",
    mapQuery: "홍천 서면 모곡리 홍천강",
    location: { lat: 37.689622, lng: 127.589589 },
    connectedFishing: true,
    connectionNote:
      "모곡밤벌유원지와 인접해, 캠핑·차박을 베이스로 쏘가리 루어 낚시를 즐기기 좋습니다.",
    sourceName: "BFG 낚시 포인트",
    sourceUrl: "https://www.bfg-fishing.com/fishing-spots/gangwon-hongcheon",
    tags: ["쏘가리", "루어", "여울"],
    activities: ["lure"],
  },
  {
    id: "gulun-fishing",
    thumbnail: "/images/river-han.jpg",
    name: "굴운낚시터(굴운지)",
    category: "fishing",
    summary: "향어·붕어가 굵게 낚이는 홍천 대표 대물 저수지.",
    description:
      "화촌면 굴운리의 굴운지는 만수면적 4만5천여 평의 대형 저수지로, 배스가 서식해 붕어 마릿수는 적지만 씨알이 굵은 '사짜터'로 알려져 있습니다. 인근 굴운낚시터(유료터)에서는 향어·메기 등을 노리는 잡이터 낚시도 가능합니다.",
    region: "강원특별자치도 홍천군 화촌면 굴운리",
    mapQuery: "홍천 굴운낚시터",
    location: { lat: 37.724769, lng: 127.966003 },
    sourceName: "낚시 전문지(굴운지)",
    sourceUrl:
      "https://fishingseasons.co.kr/fishplace/fishplace_view.asp?b_no=741",
    tags: ["저수지", "향어", "대물붕어"],
    activities: ["lure"],
  },
  {
    id: "yuchi-fishing",
    thumbnail: "/images/fishing-1.jpg",
    name: "유치지(유치 낚시터)",
    category: "fishing",
    summary: "수심 깊은 3만여 평 대형지. 겨울 얼음낚시로 인기.",
    description:
      "남면 유치리의 유치지는 약 3만 평 규모의 대형 저수지로 수심이 4~5m로 깊은 편입니다. 홍천권에서 얼음낚시가 비교적 일찍 시작되는 곳 중 하나로, 붕어 얼음낚시 명소로 꼽힙니다.",
    region: "강원특별자치도 홍천군 남면 유치리",
    mapQuery: "홍천 유치지",
    location: { lat: 37.577873, lng: 127.851681 },
    sourceName: "낚시 전문지(얼음붕어 유망터)",
    sourceUrl: "http://fishingseasons.co.kr/contents_view_detail.asp?b_no=14064",
    tags: ["저수지", "붕어", "얼음낚시"],
  },
  {
    id: "sidong-fishing",
    thumbnail: "/images/river-han.jpg",
    name: "시동낚시터",
    category: "fishing",
    summary: "남면 시동리 홍천강변에 자리한 낚시터.",
    description:
      "남면 시동리 홍천강 인근의 낚시터로, 홍천강 권역에서 붕어·잉어·메기 등 다양한 어종을 노릴 수 있습니다.",
    region: "강원특별자치도 홍천군 남면 시동리 1159-2",
    mapQuery: "홍천 시동낚시터",
    location: { lat: 37.592794, lng: 127.824525 },
    sourceName: "월척(낚시터 정보)",
    sourceUrl: "https://www.wolchuck.co.kr/__priceinfo/homeview.php?no=1249",
    tags: ["낚시터", "홍천강", "남면"],
  },

  // ── 차박지 ─────────────────────────────────────────────
  {
    id: "namnoil-riverside",
    thumbnail: "/images/river-gapyeong.jpg",
    name: "남노일강변 유원지",
    category: "carcamping",
    summary: "넓은 백사장의 홍천강 상류 강변. 견지낚시·물놀이·차박 명소.",
    description:
      "남면 남노일리의 홍천강 강변으로, 맑고 깨끗한 물과 넓은 백사장이 펼쳐져 견지 낚시터로 유명하며 여름 가족 피서지로 인기입니다. 주변에 글램핑·오토캠핑장도 다수 있어 차박·캠핑 베이스로 삼기 좋습니다.",
    region: "강원특별자치도 홍천군 남면 남노일리",
    mapQuery: "홍천 남노일강변유원지",
    location: { lat: 37.67742, lng: 127.762311 },
    phone: "033-430-4471",
    official: true,
    connectedFishing: true,
    connectionNote:
      "강변이 견지 낚시터로 유명해, 차박·물놀이와 낚시를 함께 즐기기 좋습니다.",
    sourceName: "홍천군 문화관광포털",
    sourceUrl:
      "https://www.hongcheon.go.kr/tour/selectTourCntntsWebView.do?tourNo=8&key=2037&ctgry=8&searchShowAt=Y",
    tags: ["강변", "백사장", "견지낚시", "차박"],
    activities: ["gyeonji", "bonfire"],
  },
  {
    id: "magok-resort",
    thumbnail: "/images/camp-2.jpg",
    name: "마곡유원지",
    category: "carcamping",
    summary: "남이섬 상류 홍천강변. 카약·캠핑·낚시를 즐기는 노지 유원지.",
    description:
      "홍천강이 북한강과 만나기 전 서면 마곡리에 펼쳐 놓은 강변으로, 수심이 깊어 카약·윈드서핑 등 수상레저와 강변 낚시를 함께 즐깁니다. 화장실·샤워실·취사장 등 기본 편의시설이 있으나 다소 불편한 편이라 차박·캠핑 시 장비를 잘 챙기는 것이 좋습니다.",
    region: "강원특별자치도 홍천군 서면 마곡리 22-2",
    mapQuery: "홍천 마곡유원지",
    location: { lat: 37.723464, lng: 127.589796 },
    connectedFishing: true,
    connectionNote:
      "강가에서 직접 낚시를 즐기는 사람이 많아, 차박·캠핑과 낚시를 함께 할 수 있습니다.",
    sourceName: "캠프위크(마곡유원지)",
    sourceUrl: "https://campweek.co.kr/detail_info_1.php?detail_id=1000421",
    tags: ["유원지", "차박", "카약", "낚시"],
    activities: ["lure", "bonfire"],
  },
];

export function getAllPlaces(): Place[] {
  return PLACES;
}

export function getPlaceById(id: string): Place | undefined {
  return PLACES.find((place) => place.id === id);
}

export function getPlacesByCategory(category: Place["category"]): Place[] {
  return PLACES.filter((place) => place.category === category);
}
