---
omd: "0.1"
brand: 홍천 아웃도어
bootstrapped_from: toss
bootstrapped_at: "2026-06-21"
reference_homepage: "https://toss.im"
note: "토스(TDS)의 구조·여백·타이포·모션·보이스를 보존하고, primary 상호작용 색만 이 사이트의 포레스트 그린(forest-600 #22633f)으로 hue-shift한 hybrid variation. 중립 그레이/차콜·의미색은 토스 그대로 유지."
tokens:
  source: "toss (preserved) + primary hue → forest green delta"
  colors:
    primary: "#22633f"          # forest-600 — 기본 상호작용 색(블루 #3182f6 대체)
    primary-hover: "#1e3a1e"     # forest-700
    primary-light: "#f1f7f2"     # forest-50 — 옅은 그린 surface(blue50 대체)
    primary-weak-bg: "rgba(34,99,63,0.12)"
    brand-deep: "#1e3a1e"        # forest-700 — 로고/히어로 딥 그린
    canvas: "#ffffff"
    foreground: "#191f28"        # 본문/헤딩 기본(중립 차콜, 토스 유지)
    heading-brand: "#132511"     # forest-900 — 브랜드 강조 헤딩(선택)
    grey-800: "#333d4b"
    grey-700: "#4e5968"
    grey-600: "#6b7684"
    muted: "#8b95a1"
    placeholder: "#b0b8c1"
    surface: "#f2f4f6"
    surface-alt: "#f9fafb"
    border: "#e5e8eb"
    on-primary: "#ffffff"
    error: "#f04452"
    success: "#03b26c"
    warning: "#fe9800"
    # 브랜드 따뜻한 액센트(이 프로젝트 고유 — 매거진 배경/포인트, 절제해서 사용)
    sand: "#faf6ec"              # 따뜻한 크림 surface
    clay: "#b5613a"             # 테라코타 액센트(드물게)
  typography:
    family:
      sans: '"Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", -apple-system, sans-serif'
      note: "토스 보이스를 보존하되 폰트는 오픈소스 Pretendard로(한·영·숫자 광학 균형). 현재 사이트는 var(--font-sans) 사용."
    display-hero: { size: 30, weight: 700, lineHeight: 1.33 }
    display-lg:   { size: 26, weight: 700, lineHeight: 1.38 }
    heading-lg:   { size: 22, weight: 700, lineHeight: 1.36 }
    heading:      { size: 20, weight: 600, lineHeight: 1.40 }
    subtitle:     { size: 16, weight: 600, lineHeight: 1.50 }
    body-lg:      { size: 16, weight: 400, lineHeight: 1.50 }
    body:         { size: 14, weight: 400, lineHeight: 1.57 }
    body-sm:      { size: 13, weight: 400, lineHeight: 1.54 }
    caption:      { size: 12, weight: 400, lineHeight: 1.50 }
  spacing: { xs: 4, sm: 8, md: 12, base: 16, lg: 24, xl: 32, xxl: 48 }
  rounded: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 }
  shadow:
    subtle: "0px 1px 3px rgba(0,0,0,0.06)"
    standard: "0px 2px 8px rgba(0,0,0,0.08)"
    elevated: "0px 4px 12px rgba(0,0,0,0.12)"
    note: "토스식 중립 그림자. 현재 사이트의 그린틴트 shadow-card(rgba(16,40,28,..))도 브랜드 변형으로 허용."
  components:
    button-fill-primary: { bg: "#22633f", fg: "#ffffff", radius: 16, padding: "0 20px", font: "17/600", height: 56, use: "주요 CTA — 길찾기, 예약 안내" }
    button-fill-dark: { bg: "#4e5968", fg: "#ffffff", radius: 16, font: "17/600", use: "그린이 가벼운 맥락의 강한 동작" }
    button-fill-danger: { bg: "#f04452", fg: "#ffffff", radius: 16, font: "17/600", use: "리뷰 삭제 등 파괴적 확인" }
    input-box: { fg: "#333d4b", radius: 14, padding: "14px 16px", font: "17/400", focus-border: "#22633f", use: "기본 입력(닉네임·한줄평)" }
    card: { bg: "#ffffff", radius: 16, shadow: "standard", use: "스팟/리뷰/로컬스토어 카드" }
---

# Design System — 홍천 아웃도어 (Toss-based, Forest Green)

> 토스(Toss / TDS)의 디자인 DNA를 보존한 채, **상호작용 색만 이 사이트의 포레스트 그린(forest-600 `#22633f`)으로 교체**한 스펙입니다. 반경·여백·타이포·그림자·모션·보이스는 토스 그대로이며, 중립 그레이·의미색도 토스 값을 유지합니다.

## 1. Visual Theme & Atmosphere

차분하고 자신감 있으며 군더더기 없는 인터페이스. 순백 캔버스(`#ffffff`) 위에 짙은 차콜 헤딩(`#191f28`), 그리고 모든 상호작용을 책임지는 시그니처 **딥 포레스트 그린**(`#22633f`). 화려한 장식이 아니라 **검증된 정보의 명료함**에서 신뢰가 나오며, 그린은 홍천의 숲·강을 닮은 차분한 자연색으로 "여기 정보는 믿을 수 있다"고 말합니다.

**핵심 특징:**
- 포레스트 그린(`#22633f`)을 유일한 상호작용 색으로 — 링크·버튼·선택·활성 상태
- 한·영·숫자 광학 균형이 좋은 산세리프(Pretendard)
- 따뜻한 언더톤의 중립 그레이 스케일(토스 유지)
- primitive → semantic → component 3단 토큰 구조
- 최소한의 그림자 — 신뢰는 깊이가 아니라 명료함에서
- 모바일 퍼스트(375px), 단일 컬럼

## 2. Color Palette & Roles

### Primary
- **Forest Green** (`#22633f`, forest-600): 기본 상호작용 색 — CTA(길찾기·예약 안내), 링크, 활성/선택 상태. 탭 가능한 모든 요소의 일꾼.
- **Green Hover** (`#1e3a1e`, forest-700): hover/pressed 상태.
- **Green Light** (`#f1f7f2`, forest-50): 정보성 배경, 옅은 그린 surface. (한 단계 진한 surface는 `#dcecdf` forest-100)
- **Pure White** (`#ffffff`): 페이지 배경, 카드 surface.
- **Dark Charcoal** (`#191f28`): 제목·최강 텍스트. (브랜드 강조 헤딩엔 forest-900 `#132511` / forest-800 `#193016` 사용 가능 — 현재 사이트 패턴)

### Brand (로고/히어로/마케팅)
- **Deep Forest** (`#1e3a1e`, forest-700): 로고·히어로 강조용 딥 그린. UI 상호작용은 `#22633f` 사용 — 둘을 구분.

### Brand Accents (이 프로젝트 고유 — 절제해서)
- **Sand** (`#faf6ec`): 따뜻한 크림 surface(매거진형 섹션 배경 대안).
- **Clay** (`#b5613a`): 테라코타 액센트. 장식 포인트로만 드물게. 상호작용 색으로 쓰지 말 것.

### Semantic
- **Error Red** (`#f04452`): 오류·파괴적 동작.
- **Success Green** (`#03b26c`): 완료·성공(리뷰 등록 완료, 복사됨). primary(딥 그린)와 구분되는 밝은 에메랄드 — **상호작용엔 쓰지 말 것**.
- **Warning Orange** (`#fe9800`): 주의·대기(아웃도어 지수 '주의', 비 예보).

### Neutral Scale (토스 유지)
- Grey 50 `#f9fafb` · Grey 100 `#f2f4f6` · Grey 200 `#e5e8eb`(기본 border) · Grey 400 `#b0b8c1`(placeholder) · Grey 500 `#8b95a1`(캡션) · Grey 600 `#6b7684`(본문) · Grey 700 `#4e5968`(강조 본문) · Grey 800 `#333d4b`(강한 라벨).

### Surface & Borders
- **Border Default**: `#e5e8eb`. **Background Float**: `#ffffff`(툴팁·드롭다운·지도 위 정보 카드). **Overlay Scrim**: `rgba(2,9,19,0.5)`.

## 3. Typography Rules

### Font Family
- **Primary**: `"Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", -apple-system, BlinkMacSystemFont, Roboto, sans-serif`
- 토스 Product Sans는 비공개라 **Pretendard**(오픈소스, 한·영·숫자 광학 균형)로 대체. 톤·리듬은 토스 그대로.

### Hierarchy

| Role | Size | Weight | Line Height | Notes |
|------|------|--------|-------------|-------|
| Display Hero | 30px | 700 | 1.33 | 히어로 모먼트 |
| Display Large | 26px | 700 | 1.38 | 섹션 헤더, 핵심 수치 |
| Heading Large | 22px | 700 | 1.36 | 스팟 상세 제목, 모달 헤더 |
| Heading | 20px | 600 | 1.40 | 카드 헤딩, 서브섹션 |
| Subtitle | 16px | 600 | 1.50 | 내비 타이틀, 리스트 헤더 |
| Body Large | 16px | 400 | 1.50 | 설명·소개문 |
| Body | 14px | 400 | 1.57 | 표준 본문 |
| Body Small | 13px | 400 | 1.54 | 보조 정보(주소·거리) |
| Caption | 12px | 400 | 1.50 | 타임스탬프·출처 |

### Principles
- **400(본문) · 600(강조) · 700(헤딩·핵심 수치)** 세 weight만 사용. 다양성보다 절제.
- **수치는 tabular(고정폭)**: 거리(`직선 2.6km`)·평점(`4.5`)·요금(`2,000원`)처럼 비교/정렬되는 숫자.
- **한·영·숫자 광학 균형**: 혼합 텍스트가 수동 커닝 없이 조화롭게.

## 4. Component Stylings

### Buttons
2축(variant × color), 기본 size = xlarge(56px), 반경 16px.

**Fill / Primary** — bg `#22633f` · text `#ffffff` · radius 16px · padding 0 20px · 17px/600 · height 56px · pressed dim overlay · 용도: 주요 CTA(`길찾기`, `예약 안내`).
**Fill / Dark** — bg `#4e5968` · text `#ffffff` · radius 16px · 용도: 그린이 가벼운 맥락의 강한 동작.
**Fill / Danger** — bg `#f04452` · text `#ffffff` · radius 16px · 용도: 파괴적 확인(`리뷰 삭제`).
**Weak / Primary** — bg `rgba(34,99,63,0.12)` · text `#1e3a1e` · radius 16px · 용도: Primary와 함께 쓰는 보조 동작(`링크 복사`).
**Weak / Dark** — bg `rgba(2,32,71,0.05)` · text `#4e5968` · 용도: 중립/취소(`닫기`, `취소`).

Display: `inline`·`block`·`full`. Size(height·font·radius): small 32·13/600·8 · medium 38·15/600·10 · large 48·17/600·14 · xlarge(기본) 56·17/600·16.

### Inputs
**Box(기본)** — bg `rgba(0,23,51,0.02)` · text `#333d4b` · border 1px `rgba(2,32,71,0.05)` · radius 14px · padding 14px 16px · 17px/400 · placeholder `#b0b8c1` · **focus border `#22633f`**. 용도: 닉네임·한줄평.
**Line** — 투명 bg · 하단 border만 `#e5e8eb` · radius 0.
**Error** — box 베이스 + border 1px `#f04452` + 하단 13px `#f04452` 안내문.

### Cards
**Standard** — `#ffffff` · radius 12px · padding 20px · shadow `0px 2px 8px rgba(0,0,0,0.08)`. 스팟·리뷰 카드.
**Featured** — `#ffffff` · radius 16px · padding 24px · 동일 shadow. 홈 추천/히어로.
**Compact** — `#ffffff` · border 1px `#e5e8eb` · radius 8px · padding 12px · shadow 없음. 로컬 스토어 카드.

### Badges
variant(fill|weak) × color, 반경 12px, 13px/700.
**Fill / Primary** — bg `#22633f` · text `#fff` · 용도: 카테고리/상태 강조(`공식 운영`, `NEW`).
**Weak / Primary** — bg `rgba(34,99,63,0.12)` · text `#1e3a1e` · 용도: 옅은 정보 배지(`캠핑+낚시`).
**Fill / Success** — bg `#22c55e` · text `#fff` · 용도: 완료(`리뷰 등록됨`).
**Weak / Elephant** — bg `rgba(2,32,71,0.05)` · text `#4e5968` · 용도: 중립 메타(`#오토캠핑`).

### Tabs
**Segmented** — bg `#f2f4f6` · text `#8b95a1` · radius 12px · padding 8px 16px · active `#ffffff` bg + `#191f28` text + `0px 2px 4px rgba(0,0,0,0.06)`. 카테고리 전환(캠핑/낚시/차박).

### Toasts
**Default** — bg `#191f28` · text `#ffffff` · radius 8px · padding 12px 16px · 14px/500 · 3s 자동소멸. `복사되었어요`.

### Dialogs
**Bottom Sheet** — `#ffffff` · radius 16px(상단만) · padding 24px 20px · shadow `0px -4px 12px rgba(0,0,0,0.08)`. 모바일 선택/필터/스팟 미리보기.
**Centered Modal** — `#ffffff` · radius 16px · padding 24px. 확인 다이얼로그.

### Toggles
**Default** — bg `#22633f`(on)/`#d1d6db`(off) · radius 9999px · thumb `#ffffff` 18px + `0px 1px 2px rgba(0,0,0,0.1)`.

## 5. Layout Principles

### Spacing System
- 기본 8px. 상용값: 4·8·12·16·20·24·32·40·48. 가로 패딩 20px. 메타 데이터(주소·거리·요금)는 4–8px로 촘촘하게.

### Grid & Container
- 기준 375px 모바일, 콘텐츠 풀폭 + 20px 가로 패딩. 단일 컬럼. 데스크톱은 중앙 정렬 컬럼.

### Whitespace Philosophy
- **핵심 정보엔 여백을**: 거리·평점·요금 같은 핵심 수치는 넉넉한 여백 — 넓은 여백이 곧 신뢰.
- **점진적 밀도**: 목록·요약은 여유롭게, 상세로 갈수록 정보 밀도 ↑.
- **기능 단위 그룹화**: 길찾기/예약/리뷰는 24px+ 간격, 연관 데이터는 8–12px.

### Border Radius Scale
- 4px(작은 배지) · 8px(입력·작은 버튼·compact 카드) · 12px(표준 카드·다이얼로그) · 16px(featured·바텀시트 상단) · pill(토글·칩).

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (0) | 그림자 없음 | 페이지 배경, 인라인 |
| Subtle (1) | `0px 1px 3px rgba(0,0,0,0.06)` | 리스트 항목 분리 |
| Standard (2) | `0px 2px 8px rgba(0,0,0,0.08)` | 카드, 콘텐츠 패널 |
| Elevated (3) | `0px 4px 12px rgba(0,0,0,0.12)` | 드롭다운, 팝오버, 지도 위 정보 카드 |
| Modal (4) | `0px 8px 24px rgba(0,0,0,0.16)` | 바텀시트, 다이얼로그 |

**Shadow Philosophy**: 그림자는 최소·중립으로, 깊이가 아니라 **배경 색 레이어링**으로 위계를. (현재 사이트의 옅은 그린틴트 `shadow-card`도 브랜드 변형으로 허용 — 단 컬러 그림자를 강하게 쓰지 말 것.)

## 7. Do's and Don'ts

### Do
- 모든 상호작용 요소에 포레스트 그린(`#22633f`) — 링크·버튼·토글·선택.
- 한국어 폴백 포함 폰트 스택(Pretendard) 적용.
- 거리·평점·요금 등 비교 수치는 tabular numerals.
- 700(핵심 수치·헤딩)/400(본문)/600(강조).
- 대부분 반경 8–16px. 긍정/완료 green(`#03b26c`), 오류 red(`#f04452`).
- 옅은 정보 배경엔 forest-50(`#f1f7f2`).

### Don't
- 상호작용 색으로 `#22633f` 외 색(에메랄드 success·테라코타 clay) 쓰지 말 것 — 그린이 유일한 상호작용 색.
- 딥 그린(`#1e3a1e` brand)과 UI 그린(`#22633f`) 혼동 금지 — deep는 로고/히어로용.
- 무거운/강한 컬러 그림자 금지 — 배경 레이어링으로.
- 본문에 700(bold) 금지 — 헤딩·핵심 수치 전용.
- 토글/칩 외에 반경 16px 초과 금지.
- 핵심 데이터에 장식 추가 금지 — 명료함이 곧 미학.

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile (Primary) | <480px | 풀 피델리티, 375px 기준 |
| Tablet | 480–768px | 카드 확장, 선택적 사이드 마진 |
| Desktop | >768px | 중앙 컬럼, 모바일-웹 패리티 |

### Touch Targets
- 버튼 xlarge ~56px · large ~48px. 리스트 항목 최소 52px.
- **지도**: 잠금 상태에서 세로 팬(페이지 스크롤)은 흘리고 탭(마커)만(`touch-action: pan-y`) — 본 프로젝트 규칙.

### Collapsing / Image
- 데스크톱은 모바일 레이아웃을 중앙 컬럼으로 미러. 바텀시트 → 큰 화면 중앙 모달. 사진은 16:9 카드(현장 동의 후 업로드, placeholder 시 중립 그라데이션).

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA `#22633f` · Hover `#1e3a1e` · Light surface `#f1f7f2` · 배경 `#ffffff` · surface `#f2f4f6` · 제목 `#191f28`(또는 forest-900 `#132511`) · 본문 `#6b7684` · 캡션 `#8b95a1` · placeholder `#b0b8c1` · border `#e5e8eb` · 성공 `#03b26c` · 오류 `#f04452` · 주의 `#fe9800` · 크림 `#faf6ec` · 테라코타 `#b5613a`.

### Example Component Prompts
- "스팟 카드: 흰 배경, radius 12px, padding 20px. 카테고리 배지(weak/primary, 그린), 스팟명 16px/600 `#191f28`, 한 줄 요약 14px/400 `#6b7684`, 하단 거리 13px tabular `#8b95a1`. shadow `0px 2px 8px rgba(0,0,0,0.08)`."
- "길찾기 버튼: `#22633f` 배경, 흰 텍스트 17px/600, height 56px, radius 16px, full-width, pressed dim."
- "리뷰 row: 닉네임 14px/600 `#191f28` + 별점(고정폭) + 한줄평 14px/400 `#6b7684`. '내 리뷰' 배지(weak/primary 그린), '수정됨'은 caption `#8b95a1`."
- "로컬 스토어 카드: compact(1px border `#e5e8eb`, radius 8px), 업종 배지 + 상호 + '직선 N km'(tabular) + 길찾기(weak/primary 그린)."
- "카테고리 세그먼트 탭: `#f2f4f6` 트랙, active 흰 배경 + `#191f28` 14px/600 (캠핑/낚시/차박)."

### Iteration Guide
1. 폰트 스택 항상 한국어 폴백 포함(Pretendard).
2. 상호작용 색은 `#22633f` — deep green `#1e3a1e`(로고)와 구분.
3. 핵심 수치: 700 + tabular, 리스트에선 우측 정렬.
4. 그레이는 따뜻한 언더톤(토스 유지): grey900 `#191f28`, grey50 `#f9fafb`.
5. 반경: 입력 8–14px, 카드 12px, 시트 16px, 토글 pill.
6. 그림자는 단일 레이어, 컬러 틴트 강하게 금지.
7. 모바일 퍼스트 375px, 가로 패딩 20px.

## 10. Voice & Tone

차분하고 군더더기 없이, 단정적이되 과장 없이. 정보는 "약 ~"으로 얼버무리지 않고 검증된 사실만 단정합니다. 한국어가 1차 보이스. 문장은 마침표로 끝나고, 버튼 라벨은 마침표 없이. 안전·요금·운영 정보엔 이모지 금지.

| Context | Tone |
|---|---|
| CTA | 짧은 한국어 동사형 (`길찾기`, `예약 안내`, `리뷰 등록`) |
| 성공 토스트 | 과거형 한 문장 (`복사되었어요`, `리뷰가 등록되었어요`). 이모지 없음. |
| 오류 메시지 | 구체적+비난 없이+실행 가능 (`현장(스팟 근처)에서만 등록할 수 있어요`). `문제가 발생했습니다` 금지. |
| 빈 상태 | *왜* 비었는지 한 줄 + 동작 하나 (`아직 리뷰가 없어요`). `데이터가 없습니다` 금지. |
| 수치 표기 | 콤마 구분 + 단위. `2,000원`, `직선 2.6km`, 평점 `4.5`. 비교 수치는 고정폭. |
| 출처/주의 | 검증 출처 명시, 미확인은 단정하지 않음 (`방문 전 전화로 확인하세요`). |

**금지 표현.** `불편을 드려 죄송합니다`, `Oops`, 핵심 수치의 `약 ~`(거리·요금 근사 단정), 검증 안 된 사실의 단정.

## 11. Brand Narrative

홍천 아웃도어는 강원도 홍천 일대의 **캠핑장·낚시터·차박지를 검증된 공공정보로 큐레이션**하는 서비스입니다. 데이터는 홍천군청·대한민국구석구석·고캠핑·낚시 전문지로 교차검증하며, **검증 불가한 값은 임의로 만들지 않는다**는 원칙을 코드와 콘텐츠 양쪽에서 지킵니다. 좌표가 확인된 곳만 지도 핀을 찍고, 미확인은 "방문 전 확인"으로 안내합니다.

브랜드의 thesis는 토스가 금융에서 보여준 결과 같습니다 — **"명료함이 곧 신뢰."** 다만 색은 핀테크의 블루가 아니라 **홍천의 숲과 강을 닮은 딥 포레스트 그린**입니다. 과장된 후기·출처 불명의 정보·낚시성 사진을 거부하고, 캠핑↔낚시 연계·실시간 아웃도어 지수·현장에서만 남기는 리뷰로 신뢰를 만듭니다.

<!-- omd:limitation §11의 공식 서비스명·운영주체·런칭 시점·공식 태그라인은 프로젝트 사실 정보입니다. 확정되면 [FILL IN]을 교체하세요. 임의 작성 금지. -->
- 공식 서비스명 / 운영주체: [FILL IN]
- 런칭 시점: [FILL IN]
- 공식 태그라인: [FILL IN] (thesis 가안: "검증된 정보로 떠나는 홍천 아웃도어")

거부하는 것: 출처 없는 단정, 협찬성 과장 후기, 동의 없는 현장 사진, 부정확한 소요시간·요금. 차분하지만 친근하고, 기능은 충실하되 표현은 여백 있게.

## 12. Principles

1. **검증된 것만 ship한다.** 출처로 교차검증되지 않은 사실은 단정하지 않는다. 미확인은 "확인 필요"로 표기, 절대 지어내지 않는다. (이 프로젝트 1번 원칙.)
2. **핵심 정보엔 여백을.** 거리·평점·요금은 주변 텍스트의 ≥1.5배 여백.
3. **한 화면에 주요 동작 하나.** primary 버튼이 둘이면 두 화면이다.
4. **그린은 상호작용이지 장식이 아니다.** `#22633f`는 탭 가능한 곳에만. 헤더·아이콘·테두리 장식엔 쓰지 않는다(딥 그린·크림·테라코타로).
5. **절제가 신뢰를 전한다.** 단일 레이어 그림자, 강한 컬러 그림자 금지. 시각적 잡음은 신뢰 비용.
6. **한국어 1차, 정확한 표기.** 행정구역·주소·요금·어종은 검증된 표기로. 근사·과장 금지.
7. **수치는 타이포다.** 거리·평점·요금은 700 + 고정폭으로 헤딩만큼 신경 쓴다.
8. **여백은 자산이다.** 줄이면 더 들어가는 상황이면, 답은 빽빽함이 아니라 다음 화면이다.

## 13. Personas

*아래 페르소나는 공개적으로 알려진 아웃도어 사용자 세그먼트에 기반한 가상 아키타입이며, 특정 개인이 아닙니다.*

**도현 (35), 경기.** 주말 오토캠핑러. 금요일 밤 출발 전 차 안에서 스팟을 정한다. 필요한 것: 정확한 주소·전화·예약처, "여기 진짜 차 들어가나" 진입로 정보. 과장 블로그를 불신하고, 검증 출처가 보이면 신뢰. 길찾기 한 번에 정확한 도착지가 떠야 한다.

**상철 (52), 홍천 인근.** 견지·루어 낚시인. 어종·포인트·수위에 민감하고 노지/유료터 구분과 요금을 미리 알고 싶다. 화려한 UI보다 "붕어 나오나, 무료인가, 화장실 있나"가 핵심. 한국어만 읽으며, 부정확한 정보엔 바로 등을 돌린다.

**유나 (29), 서울.** 가족·커플 차박러. 물놀이 가능 여부·1급수·편의시설·주변 맛집을 함께 본다. 모바일에서 지도 위를 스크롤하다 캠핑장 박스로 자연스럽게 내려가길 기대. 현장에서 짧은 한줄평 남기기를 좋아한다.

## 14. States

| State | Treatment |
|---|---|
| **Empty (리뷰 없음)** | `grey700` 한 줄로 *왜* 비었는지(`아직 리뷰가 없어요`) + 안내(현장에서만 등록). 일러스트 없음. |
| **Empty (필터 없음)** | `grey500` 캡션 한 줄(`조건에 맞는 스팟이 없어요`). |
| **Loading (첫 페인트)** | `#f2f4f6` 스켈레톤. 핵심 수치는 `--`(스켈레톤 금지). |
| **Loading (새로고침)** | 상단 그린 스피너, 오버레이 없음, 이전 값 유지(날씨 백그라운드 폴링). |
| **Error (인라인)** | `#f04452` 2px border + 하단 13px red 한 문장(`닉네임을 입력해주세요`). |
| **Error (토스트)** | `#191f28` bg, 흰 14px/400, 3s, 하단 20px inset(`현장에서만 등록할 수 있어요`). |
| **Success (인라인 플래시)** | 갱신 요소 뒤 `#f1f7f2`(forest-50) 300ms 페이드. |
| **Success (리뷰 등록)** | 목록 상단 즉시 추가 + `#03b26c` 토스트(`리뷰가 등록되었어요`). 평균 평점 즉시 갱신. |
| **Skeleton** | `#f2f4f6` 블록, 컴포넌트 반경(8/12/16px), 1.2s shimmer. 핵심 수치엔 미적용(`--`). |
| **Disabled** | 버튼 opacity 감소. 입력 border는 `grey200` 유지(geometry 안정). |

## 15. Motion & Easing

**Durations:** `motion-instant` 0ms · `motion-fast` 150ms(hover/press) · `motion-standard` 250ms(기본 — 시트·카드·탭) · `motion-slow` 400ms(성공·온보딩) · `motion-page` 350ms(라우트 전환).

**Easings:** `ease-enter` `cubic-bezier(0,0,0.2,1)`(등장) · `ease-exit` `cubic-bezier(0.4,0,1,1)`(퇴장) · `ease-standard` `cubic-bezier(0.4,0,0.2,1)`(양방향) · `ease-spring` `cubic-bezier(0.34,1.56,0.64,1)`(성공 체크 한 곳만).

**Signature motions.**
1. **수치 갱신.** 거리·날씨·평점이 바뀌면 기존 값 위로 20px 슬라이드+페이드아웃(`fast/exit`), 새 값 아래에서 슬라이드인(`standard/enter`). cross-fade 금지.
2. **바텀시트.** `y+40px`에서 `standard/enter` 상승 + 스크림 동기 페이드, dismiss는 `fast/exit`. (모바일 스팟 슬라이드오버에 적용.)
3. **성공 체크마크.** 리뷰 등록 등 확인 모먼트에서 `slow/ease-spring`. spring은 여기만.
4. **Reduce motion.** `prefers-reduced-motion: reduce`면 모든 `motion-*`을 `instant`로, 슬라이드 대신 cross-fade. 예외 없음.

<!--
omd v0.1 — bootstrapped from `toss` (preserve mode + primary hue → forest green delta).
- §1–9 토큰·구조·여백·타이포·그림자, §10·§12·§14·§15 철학/모션은 Toss canonical 보존.
- primary 상호작용 색만 forest-600(#22633f, hover forest-700 #1e3a1e, light forest-50 #f1f7f2)로 치환. 중립 그레이/차콜·의미색은 Toss 유지.
- §11 서사·§13 페르소나·예시는 홍천 아웃도어 맥락. 공식명/런칭/태그라인은 [FILL IN].
- 폰트는 Pretendard(오픈소스) 대체. sand/clay는 이 프로젝트 고유 액센트(상호작용 색 아님).
- 그린 hex는 사이트 tailwind.config.ts의 forest 팔레트 기준.
-->
