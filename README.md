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

## 이미지 출처 (라이선스)

`public/images`의 대표 이미지는 **분위기 컷**으로, 실제 장소 사진이 아닙니다.
구글·네이버·카카오 리뷰 사진은 저작권상 사용할 수 없어, 라이선스가 명확한
**위키미디어 공용(Wikimedia Commons, CC)** 사진을 사용했습니다. 실제 장소
사진(운영자 제공/공공누리 개방사진)으로 교체하려면 각 장소의 `thumbnail`/`images`
경로만 바꾸면 됩니다.

- `gangwon-river.jpg` — Nakdong River, Gangwon Province (© James St. John, Flickr, **CC BY 2.0**)
- `lake-bomun.jpg` — Bomun Lake in autumn, Gyeongju (© Grete Howard, Flickr, **CC BY 3.0**)
- `river-gapyeong.jpg` — Bukhan River flowing through Gapyeong (Wikimedia Commons)
- `river-han.jpg` — Korea-Seoul-Han River (Wikimedia Commons)
- `camp-1.jpg` — Big Meadows Campground, Shenandoah (Wikimedia Commons)
- `camp-2.jpg` — Camping tent trailer (Wikimedia Commons)

> CC BY 라이선스 이미지는 저작자 표시가 필요합니다(위 출처). 실제 장소 사진으로
> 교체하면 해당 표기는 제거하면 됩니다.
```
