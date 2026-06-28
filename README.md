# 홍천 아웃도어 (hongcheon-tour)

강원 홍천의 **캠핑·낚시** 명소를 큐레이션하는 웹사이트입니다.

## 기술 스택

- [Next.js 14](https://nextjs.org/) (App Router)
- TypeScript
- Tailwind CSS

## 시작하기

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인합니다.

## 스크립트

| 명령어              | 설명                     |
| ------------------- | ------------------------ |
| `npm run dev`       | 개발 서버 실행           |
| `npm run build`     | 프로덕션 빌드            |
| `npm run start`     | 빌드 결과 실행           |
| `npm run lint`      | ESLint 검사              |
| `npm run typecheck` | 타입 검사 (`tsc`)        |

## 폴더 구조

```
hongcheon-tour/
├── public/
│   └── images/              # 정적 이미지 (큐레이션 사진 등)
├── src/
│   ├── app/                 # 라우팅 (App Router)
│   │   ├── layout.tsx       # 공통 레이아웃 (헤더/푸터)
│   │   ├── page.tsx         # 메인 페이지        →  /
│   │   ├── not-found.tsx    # 404 페이지
│   │   ├── map/
│   │   │   └── page.tsx     # 지도 페이지        →  /map
│   │   └── places/
│   │       └── [id]/
│   │           └── page.tsx # 상세 페이지        →  /places/:id
│   ├── components/          # 재사용 UI 컴포넌트
│   │   ├── layout/          #   헤더, 푸터 등 레이아웃
│   │   ├── places/          #   장소 관련 컴포넌트 (PlaceCard 등)
│   │   └── ui/              #   범용 UI 프리미티브 (버튼 등)
│   ├── features/            # 도메인별 기능 모듈 (camping, fishing …)
│   ├── data/                # 데이터 소스 (현재 시드 데이터, 추후 DB/API)
│   ├── lib/                 # 순수 유틸 함수
│   ├── hooks/               # 커스텀 React 훅
│   ├── constants/           # 상수 (사이트 정보, 좌표, 라벨 등)
│   └── types/               # 공용 타입 정의
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## 라우팅

| 경로          | 파일                              | 설명        |
| ------------- | --------------------------------- | ----------- |
| `/`           | `src/app/page.tsx`                | 메인 페이지 |
| `/map`        | `src/app/map/page.tsx`            | 지도 페이지 |
| `/places/:id` | `src/app/places/[id]/page.tsx`    | 상세 페이지 |

## 공개 API (봇·외부 서비스용)

홍천 아웃도어는 텔레그램 봇이나 외부 서비스가 홍천 장소 데이터를 가져갈 수 있도록
공개 읽기 API를 제공합니다. 인증이 필요 없고 CORS가 열려 있어 서버사이드(Python 등)와
브라우저 양쪽에서 호출할 수 있습니다.

### `GET /api/places`

| 쿼리 파라미터 | 값                                   | 설명                                  |
| ------------- | ------------------------------------ | ------------------------------------- |
| `category`    | `camping` \| `fishing` \| `carcamping` | 카테고리 필터 (생략 시 전체)          |
| `featured`    | `true`                               | 추천 장소만                           |
| `q`           | 검색어                               | 이름·소개·태그에서 포함 검색          |

예시:

```bash
# 추천 장소만
curl "https://hongcheon-outdoor-kv6c.vercel.app/api/places?featured=true"

# 낚시터 중 '쏘가리' 검색
curl "https://hongcheon-outdoor-kv6c.vercel.app/api/places?category=fishing&q=쏘가리"
```

응답(요약):

```json
{
  "count": 3,
  "places": [
    {
      "id": "hongcheongang-auto-camping",
      "name": "홍천강오토캠핑장",
      "category": "camping",
      "summary": "홍천군이 운영하는 공공 오토캠핑장. 홍천강까지 데크로 연결됩니다.",
      "region": "강원특별자치도 홍천군 북방면 굴지강변로 322",
      "phone": "033-430-2498",
      "location": { "lat": 37.690281, "lng": 127.787231 },
      "tags": ["오토캠핑", "공공운영", "홍천강", "수상레포츠"],
      "activities": ["bonfire"],
      "official": true,
      "connectedFishing": true,
      "sourceUrl": "https://www.hongcheon.go.kr/tour/contents.do?key=1879",
      "mapQuery": "홍천강오토캠핑장",
      "featured": true
    }
  ]
}
```

> 내부 전용 필드(예: `partnerId`)는 응답에서 제외됩니다. 데이터는 CDN에서 1시간
> 캐시됩니다.

### `GET /api/river-status`

홍천강 인근 실시간 날씨(기온·강수·하늘상태)와 오늘 예보, 아웃도어 활동 지수를
반환합니다. 봇에서 "오늘 낚시 가도 돼?" 같은 응답에 활용할 수 있습니다.

### 파이썬 예제

`examples/telegram_bot_places.py` 에 위 API를 호출해 텔레그램 봇에서 쓰는
복붙용 예제가 있습니다. `fetch_places()` 함수만 가져다 써도 됩니다.

```python
import requests

BASE = "https://hongcheon-outdoor-kv6c.vercel.app"
places = requests.get(f"{BASE}/api/places", params={"featured": "true"}).json()["places"]
for p in places:
    print(p["name"], "-", p["summary"])
```

> ⚠️ 봇 토큰(BotFather)·시크릿은 코드나 깃 저장소에 직접 넣지 말고 환경변수로
> 관리하세요.

## 이미지 정책

각 장소의 사진은 현재 **"(업로드 예정)" 플레이스홀더**로 표시됩니다.

- 구글·네이버·카카오 리뷰 사진은 **저작권/약관상 사용할 수 없습니다.**
- 실제 현장 사진은 **운영자 제공 사진** 또는 **공공누리 개방사진(한국관광공사
  TourAPI, 출처표시)** 으로만 합법적으로 넣을 수 있습니다.
- 사진이 준비되면 `src/data/places.ts` 의 해당 장소에 `thumbnail: "/images/파일명"`
  (또는 외부 URL)을 추가하면 자동으로 표시됩니다. (`public/images`에 파일 저장)

> 공공누리/CC 사진을 쓰는 경우 출처표시가 필요합니다. 실제 사진으로 교체 시 함께
> 표기하세요.
```
