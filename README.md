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

## 다음 단계

- [ ] 지도 SDK 연동 (Kakao Map / Naver Map / Leaflet) — `src/app/map/page.tsx`
- [ ] 실제 큐레이션 데이터 연결 — `src/data/places.ts`
- [ ] 카테고리별 필터/검색 기능
- [ ] 이미지 업로드 및 `next/image` 적용
```
