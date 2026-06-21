---
omd: "0.1"
brand: 홍천 아웃도어
bootstrapped_from: toss
bootstrapped_at: "2026-06-21"
reference_homepage: "https://toss.im"
note: "토스(TDS)의 톤&매너·토큰을 보존(preserve)하고, §11–15의 사실·예시만 홍천 아웃도어(캠핑·낚시·차박 큐레이션) 맥락으로 치환한 hybrid variation. '토스 스타일' 지시에 따라 색·반경·타이포 토큰은 그대로 유지함."
tokens:
  source: "toss (preserved)"
  colors:
    primary: "#3182f6"
    primary-hover: "#2272eb"
    primary-light: "#e8f3ff"
    brand: "#0064ff"
    canvas: "#ffffff"
    foreground: "#191f28"
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
  typography:
    family:
      sans: '"Toss Product Sans", "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", -apple-system, sans-serif'
      note: "Toss Product Sans는 비공개 폰트 → 웹에선 Pretendard(오픈소스, 한·영·숫자 균형)로 대체 권장. 톤은 동일하게 깔끔/중립."
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
  components:
    button-fill-primary: { bg: "#3182f6", fg: "#ffffff", radius: 16, padding: "0 20px", font: "17/600", height: 56, use: "주요 CTA — 길찾기, 예약 안내" }
    button-fill-dark: { bg: "#4e5968", fg: "#ffffff", radius: 16, font: "17/600", use: "블루가 가벼운 맥락의 강한 동작" }
    button-fill-danger: { bg: "#f04452", fg: "#ffffff", radius: 16, font: "17/600", use: "리뷰 삭제 등 파괴적 확인" }
    input-box: { fg: "#333d4b", radius: 14, padding: "14px 16px", font: "17/400", use: "기본 입력 (닉네임·한줄평)" }
    card: { bg: "#ffffff", radius: 16, shadow: "standard", use: "스팟/리뷰/로컬스토어 카드" }
---

# Design System — 홍천 아웃도어 (Toss-based)

> 토스(Toss / TDS)의 디자인 DNA를 보존한 채 홍천 아웃도어(캠핑·낚시·차박 큐레이션) 맥락으로 변형한 스펙입니다. 색·반경·타이포·모션 토큰은 토스 그대로이며, 브랜드 서사·원칙·페르소나·예시만 이 프로젝트에 맞췄습니다.

## 1. Visual Theme & Atmosphere

차분하고 자신감 있으며 군더더기 없는 인터페이스. 순백 캔버스(`#ffffff`) 위에 짙은 차콜 헤딩(`#191f28`), 그리고 모든 상호작용을 책임지는 시그니처 블루(`#3182f6`). 이 블루는 레거시 기관의 차갑고 institutional한 남색이 아니라, "정보는 믿을 수 있고, 길찾기는 쉽다"고 말하는 밝고 낙관적인 cerulean입니다. 아웃도어 큐레이션에서 신뢰는 화려함이 아니라 **검증된 정보의 명료함**에서 나오며, 디자인은 그 명료함을 시각화합니다.

**핵심 특징:**
- 토스 블루(`#3182f6`)를 유일한 상호작용 색으로 — 링크·버튼·선택·활성 상태
- 한·영·숫자 광학 균형이 좋은 산세리프(Toss Product Sans → 웹은 Pretendard 대체)
- 따뜻한 언더톤의 10단계 그레이 스케일
- primitive → semantic → component 3단 토큰 구조
- 최소한의 그림자 — 신뢰는 깊이가 아니라 명료함에서
- 모바일 퍼스트(375px 기준), 단일 컬럼

## 2. Color Palette & Roles

### Primary
- **Toss Blue** (`#3182f6`): 기본 상호작용 색 — CTA(길찾기·예약 안내), 링크, 활성/선택 상태. 탭 가능한 모든 요소의 일꾼.
- **Blue Hover** (`#2272eb`): hover/pressed 상태.
- **Blue Light** (`#e8f3ff`): 정보성 배경, 옅은 블루 surface.
- **Pure White** (`#ffffff`): 페이지 배경, 카드 surface.
- **Dark Charcoal** (`#191f28`): 제목·최강 텍스트. 푸른 언더톤의 따뜻한 근흑.

### Brand (로고/마케팅 전용)
- **Brand Blue** (`#0064ff`): 로고·마케팅 전용. UI의 `#3182f6`와 혼동 금지.

### Semantic
- **Error Red** (`#f04452`): 오류, 파괴적 동작.
- **Success Green** (`#03b26c`): 완료·성공(리뷰 등록 완료, 복사됨).
- **Warning Orange** (`#fe9800`): 주의·대기 (예: 아웃도어 지수 '주의', 비 예보).

### Neutral Scale
- **Grey 50** (`#f9fafb`): 가장 옅은 배경.
- **Grey 100** (`#f2f4f6`): 보조 배경, 카드 fill, 비활성 surface.
- **Grey 200** (`#e5e8eb`): 기본 border·divider.
- **Grey 400** (`#b0b8c1`): placeholder, 비활성 아이콘.
- **Grey 500** (`#8b95a1`): 캡션·보조 라벨.
- **Grey 600** (`#6b7684`): 본문·설명·메타데이터.
- **Grey 700** (`#4e5968`): 강조 본문·소제목.
- **Grey 800** (`#333d4b`): 강한 라벨·내비 텍스트.

### Surface & Borders
- **Border Default**: `#e5e8eb` (grey200). 카드/입력 border, divider.
- **Background Float**: `#ffffff`. 툴팁·드롭다운·정보 카드(지도 위 InfoCard).
- **Overlay Scrim**: `rgba(2,9,19,0.5)`. 슬라이드오버/바텀시트 뒤 배경.

## 3. Typography Rules

### Font Family
- **Primary**: `"Toss Product Sans", "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", -apple-system, BlinkMacSystemFont, Roboto, sans-serif`
- Toss Product Sans는 비공개 폰트이므로 웹에서는 **Pretendard**(오픈소스, 한·영·숫자 광학 균형)로 대체합니다. 톤·리듬은 동일하게 유지.

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
| Caption | 12px | 400 | 1.50 | 타임스탬프, 출처 표기 |

### Principles
- **여덟 weight, 세 개만 사용**: 400(본문) · 600(강조) · 700(헤딩·핵심 수치). 다양성보다 절제.
- **수치는 tabular(고정폭) numerals**: 거리(`직선 2.6km`), 평점(`4.5`), 요금(`2,000원`)처럼 비교/정렬되는 숫자는 고정폭으로.
- **한·영·숫자 광학 균형**: 혼합 텍스트가 수동 커닝 없이 조화롭게.

## 4. Component Stylings

### Buttons

2축 컴포넌트(variant × color), 기본 size = xlarge(56px). 반경 16px 고정.

**Fill / Primary** — bg `#3182f6` · text `#ffffff` · radius 16px · padding 0 20px · 17px/600 · height 56px · pressed dim overlay · 용도: 주요 CTA(`길찾기`, `예약 안내`).
**Fill / Dark** — bg `#4e5968` · text `#ffffff` · radius 16px · 용도: 블루가 가벼운 맥락의 강한 동작.
**Fill / Danger** — bg `#f04452` · text `#ffffff` · radius 16px · 용도: 파괴적 확인(`리뷰 삭제`).
**Weak / Primary** — bg `rgba(100,168,255,0.15)` · text `#2272eb` · radius 16px · 용도: Primary와 함께 쓰는 보조 동작(`링크 복사`).
**Weak / Dark** — bg `rgba(2,32,71,0.05)` · text `#4e5968` · 용도: 중립/취소(`닫기`, `취소`).

Display 모드 — `inline`(자동 너비) · `block`(풀폭) · `full`(부모 채움). Size(height·font·radius): small 32·13/600·8 · medium 38·15/600·10 · large 48·17/600·14 · xlarge(기본) 56·17/600·16.

### Inputs

`box`(기본)·`line`·`big` 변형. `hasError`로 오류 상태.

**Box (기본)** — bg `rgba(0,23,51,0.02)` · text `#333d4b` · border 1px `rgba(2,32,71,0.05)` · radius 14px · padding 14px 16px · 17px/400 · placeholder `#b0b8c1` · focus border `#3182f6`. 용도: 닉네임·한줄평 등 표준 입력.
**Line** — 투명 bg · 하단 border만 `#e5e8eb` · radius 0 · 용도: 밀도 높은 폼.
**Error** — box 베이스 + border 1px `#f04452` + 하단 13px `#f04452` 안내문.

### Cards

**Standard** — bg `#ffffff` · radius 12px · padding 20px · shadow `0px 2px 8px rgba(0,0,0,0.08)`. 용도: 스팟·리뷰 카드(일꾼 surface).
**Featured** — bg `#ffffff` · radius 16px · padding 24px · 동일 shadow. 용도: 홈 추천/히어로 카드.
**Compact** — bg `#ffffff` · border 1px `#e5e8eb` · radius 8px · padding 12px · shadow 없음. 용도: 리스트 항목(로컬 스토어 카드처럼 1px 엣지로 그림자 대체).

### Badges

variant(fill|weak) × color × size. 반경 12px.

**Fill / Blue** — bg `#3182f6` · text `#fff` · radius 12px · padding 3px 7px · 13px/700 · 용도: 카테고리/상태 강조(`공식 운영`, `NEW`).
**Fill / Green** — bg `#22c55e` · text `#fff` · 용도: 완료/성공(`리뷰 등록됨`).
**Weak / Blue** — bg `rgba(100,168,255,0.15)` · text `#2272eb` · 용도: 옅은 정보 배지(`캠핑+낚시`).
**Weak / Elephant** — bg `rgba(2,32,71,0.05)` · text `#4e5968` · 용도: 중립 메타 배지(`#오토캠핑`).

### Tabs

**Segmented** — bg `#f2f4f6` · text `#8b95a1` · radius 12px · padding 8px 16px · active: `#ffffff` bg + `#191f28` text + `0px 2px 4px rgba(0,0,0,0.06)`. 용도: 카테고리 전환(캠핑/낚시/차박).

### Toasts

**Default** — bg `#191f28` · text `#ffffff` · radius 8px · padding 12px 16px · 14px/500 · 3s 자동 소멸. 용도: `복사되었어요` 같은 일시 알림.

### Dialogs

**Bottom Sheet** — bg `#ffffff` · radius 16px(상단만) · padding 24px 20px · shadow `0px -4px 12px rgba(0,0,0,0.08)`. 용도: 모바일 선택/필터/스팟 미리보기(현재 지도 슬라이드오버와 동일 결).
**Centered Modal** — bg `#ffffff` · radius 16px · padding 24px. 용도: 확인 다이얼로그.

### Toggles

**Default** — bg `#3182f6`(on)/`#d1d6db`(off) · radius 9999px · thumb `#ffffff` 18px + `0px 1px 2px rgba(0,0,0,0.1)`. 용도: 불리언 설정.

## 5. Layout Principles

### Spacing System
- 기본 단위 8px. 상용값: 4·8·12·16·20·24·32·40·48.
- 가로 패딩 20px(일반적 16px보다 약간 넓게).
- 데이터 그리드(스팟 메타: 주소·거리·요금)는 4–8px 내부 간격으로 촘촘하게.

### Grid & Container
- 디자인 기준 375px 모바일. 콘텐츠 풀폭 + 20px 가로 패딩.
- 명시적 다단 그리드 없음 — 단일 컬럼, 모바일 퍼스트. 데스크톱은 중앙 정렬 컬럼.

### Whitespace Philosophy
- **핵심 정보엔 여백을**: 거리·평점·요금 같은 핵심 수치는 주변에 넉넉한 여백. 넓은 여백이 곧 신뢰.
- **점진적 밀도**: 목록·요약은 여유롭게, 상세로 들어갈수록 정보 밀도 ↑.
- **기능 단위 그룹화**: 길찾기/예약/리뷰 같은 동작은 24px+ 간격으로, 연관 데이터는 8–12px로 묶기.

### Border Radius Scale
- Compact(4px): 작은 배지·인라인. · Standard(8px): 입력·작은 버튼·compact 카드. · Comfortable(12px): 표준 카드·다이얼로그. · Large(16px): featured 카드·바텀시트 상단. · Pill(9999px): 토글·칩.

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (0) | 그림자 없음 | 페이지 배경, 인라인 |
| Subtle (1) | `0px 1px 3px rgba(0,0,0,0.06)` | 리스트 항목 분리 |
| Standard (2) | `0px 2px 8px rgba(0,0,0,0.08)` | 카드, 콘텐츠 패널 |
| Elevated (3) | `0px 4px 12px rgba(0,0,0,0.12)` | 드롭다운, 팝오버, 지도 위 정보 카드 |
| Modal (4) | `0px 8px 24px rgba(0,0,0,0.16)` | 바텀시트, 다이얼로그 |

**Shadow Philosophy**: 그림자는 최소·중립으로. 시각적 잡음은 신뢰를 깎습니다. 깊이가 아니라 **배경 색 레이어링**으로 위계를 만드세요. 컬러 그림자 금지.

## 7. Do's and Don'ts

### Do
- 모든 상호작용 요소에 토스 블루(`#3182f6`) — 링크·버튼·토글·선택.
- 한국어 폴백 포함 폰트 스택 전체 적용.
- 거리·평점·요금 등 비교 수치는 tabular(고정폭) numerals.
- 700(핵심 수치·헤딩) / 400(본문) / 600(강조) 사용.
- 대부분 요소 반경 8–16px.
- 긍정/완료는 green(`#03b26c`), 오류는 red(`#f04452`).
- 옅은 정보 배경엔 blue50(`#e8f3ff`).

### Don't
- Brand Blue(`#0064ff`)와 UI Blue(`#3182f6`) 혼동 금지 — brand는 로고/마케팅 전용.
- 무거운 그림자 금지 — 깊이 대신 배경 레이어링.
- 본문에 700(bold) 금지 — 헤딩·핵심 수치 전용.
- primary 동작에 따뜻한 강조색(주황·핑크) 금지 — 블루가 유일한 상호작용 색.
- 토글/칩 외에 반경 16px 초과 금지.
- 핵심 데이터 표시에 장식 추가 금지 — 명료함이 곧 미학.

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile (Primary) | <480px | 풀 피델리티, 375px 기준 |
| Tablet | 480–768px | 카드 확장, 선택적 사이드 마진 |
| Desktop | >768px | 중앙 컬럼, 모바일-웹 패리티 |

### Touch Targets
- 버튼: xlarge ~56px · large ~48px · medium ~40px. 리스트 항목 최소 52px 행 높이.
- **지도**: 잠금 상태에서 세로 팬(페이지 스크롤)은 흘리고 탭(마커)만 받기(`touch-action: pan-y`) — 본 프로젝트 적용 규칙.

### Collapsing Strategy
- 데스크톱은 모바일 레이아웃을 중앙 컬럼으로 미러. 바텀시트 → 큰 화면에선 중앙 모달. 가로 스크롤 카드 캐러셀로 탐색.

### Image Behavior
- 로고/아이콘: 24–40px 일관 사이즈. 사진은 16:9 카드(현장 동의 후 업로드 — placeholder 시 중립 그라데이션).

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA: `#3182f6` · Hover: `#2272eb` · 배경: `#ffffff` · surface: `#f2f4f6` · 제목: `#191f28` · 본문: `#6b7684` · 캡션: `#8b95a1` · placeholder: `#b0b8c1` · border: `#e5e8eb` · 성공: `#03b26c` · 오류: `#f04452` · 주의: `#fe9800`.

### Example Component Prompts
- "스팟 카드 만들어줘: 흰 배경, radius 12px, padding 20px. 카테고리 배지(weak/blue), 스팟명 16px/600 `#191f28`, 한 줄 요약 14px/400 `#6b7684`, 하단 거리 13px tabular `#8b95a1`. shadow `0px 2px 8px rgba(0,0,0,0.08)`."
- "길찾기 버튼: `#3182f6` 배경, 흰 텍스트 17px/600, height 56px, radius 16px, full-width. pressed dim overlay."
- "리뷰 row: full-width, 16px 가로 패딩, 닉네임 14px/600 `#191f28` + 별점(고정폭) + 한줄평 14px/400 `#6b7684`. '내 리뷰' 배지(weak/blue), '수정됨'은 caption `#8b95a1`."
- "로컬 스토어 카드: compact 카드(1px border `#e5e8eb`, radius 8px), 업종 배지 + 상호 + '직선 N km'(tabular) + 길찾기(weak/primary)."
- "카테고리 세그먼트 탭: `#f2f4f6` 트랙, active 흰 배경 + `#191f28` 14px/600 + 미세 shadow (캠핑/낚시/차박)."

### Iteration Guide
1. 폰트 스택은 항상 한국어 폴백 포함(Pretendard 대체).
2. 상호작용 색은 `#3182f6` — 절대 `#0064ff` 아님.
3. 핵심 수치(거리·평점·요금): 700, tabular, 리스트에선 우측 정렬.
4. 그레이는 따뜻한 언더톤: grey900 `#191f28`, grey50 `#f9fafb`.
5. 반경: 입력 8–14px, 카드 12px, 시트 16px, 토글 pill.
6. 그림자는 단일 레이어 순흑, 컬러 틴트 없음.
7. 모바일 퍼스트: 375px, 가로 패딩 20px.

## 10. Voice & Tone

차분하고 군더더기 없이, 단정적이되 과장 없이. 정보는 "약 ~"으로 얼버무리지 않고 검증된 사실만 단정합니다. 한국어가 1차 보이스. 문장은 마침표로 끝나고, 버튼 라벨은 마침표 없이. 심각한 정보(안전·요금·운영)에는 이모지 금지.

| Context | Tone |
|---|---|
| CTA | 짧은 한국어 동사형 (`길찾기`, `예약 안내`, `리뷰 등록`) |
| 성공 토스트 | 과거형 한 문장 (`복사되었어요`, `리뷰가 등록되었어요`). 이모지 없음. |
| 오류 메시지 | 구체적+비난 없이+실행 가능. `문제가 발생했습니다` 금지. (`현장(스팟 근처)에서만 등록할 수 있어요`) |
| 빈 상태 | *왜* 비었는지 한 줄 + 동작 하나. `데이터가 없습니다` 금지. (`아직 리뷰가 없어요`) |
| 수치 표기 | 콤마 구분 + 단위. `2,000원`, `직선 2.6km`, 평점 `4.5`. 비교 수치는 고정폭. |
| 출처/주의 | 검증 출처 명시, 미확인은 단정하지 않음 (`방문 전 전화로 확인하세요`). |

**금지 표현.** `불편을 드려 죄송합니다`, `Oops`, 핵심 수치의 `약 ~`(거리·요금 근사 단정), 검증 안 된 사실의 단정. 거리·요금은 정확값 또는 '직선/예시' 명시.

## 11. Brand Narrative

홍천 아웃도어는 강원도 홍천 일대의 **캠핑장·낚시터·차박지를 검증된 공공정보로 큐레이션**하는 서비스입니다. 데이터는 홍천군청·대한민국구석구석(한국관광공사)·고캠핑·낚시 전문지 등으로 교차검증하며, **검증 불가한 값은 임의로 만들지 않는다**는 원칙을 코드와 콘텐츠 양쪽에서 지킵니다. 좌표가 확인된 곳만 지도 핀을 찍고, 미확인 정보는 "방문 전 확인"으로 안내합니다.

브랜드의 thesis는 토스가 금융에서 보여준 것과 같은 결입니다 — **"명료함이 곧 신뢰."** 토스가 레거시 은행의 무거운 남색·복잡함을 거부했듯, 홍천 아웃도어는 과장된 후기·출처 불명의 정보·낚시성 사진을 거부합니다. 캠핑과 낚시를 한 동선으로 잇는 **캠핑↔낚시 연계**, 실시간 날씨 기반 **아웃도어 지수**, **현장에서만 남기는 리뷰**가 신뢰를 만드는 장치입니다.

<!-- omd:limitation §11의 공식 서비스명·운영주체·런칭 시점·공식 태그라인은 프로젝트 사실 정보입니다. 확정되면 아래 [FILL IN]을 교체하세요. 임의 작성 금지. -->
- 공식 서비스명 / 운영주체: [FILL IN]
- 런칭 시점: [FILL IN]
- 공식 태그라인: [FILL IN] (현재 thesis 가안: "검증된 정보로 떠나는 홍천 아웃도어")

홍천 아웃도어가 거부하는 것: 출처 없는 단정, 협찬성 과장 후기, 동의 없는 현장 사진, 정확하지 않은 소요시간·요금. 차분하지만 친근하고, 기능은 충실하되 표현은 여백 있게 — 그 좁은 가운데 자리를 지킵니다.

## 12. Principles

1. **검증된 것만 ship한다.** 출처로 교차검증되지 않은 사실은 단정하지 않는다. 미확인은 "확인 필요"로 표기하고 절대 지어내지 않는다. (이 프로젝트의 1번 원칙.)
2. **핵심 정보엔 여백을.** 거리·평점·요금 같은 핵심 수치는 주변 텍스트의 ≥1.5배 여백을 갖는다. 좁게 욱여넣으면 싸 보이고, 싸 보이면 못 믿는다.
3. **한 화면에 주요 동작 하나.** primary 버튼이 둘이면 두 화면이다. 보조 동작은 허용, primary 둘은 불가.
4. **블루는 상호작용이지 장식이 아니다.** `#3182f6`는 탭 가능한 곳에만. 헤더·아이콘·테두리 장식엔 쓰지 않는다.
5. **절제가 신뢰를 전한다.** 단일 레이어 순흑 그림자. 컬러 그림자·다중 elevation 금지. 시각적 잡음은 신뢰 비용.
6. **한국어 1차, 정확한 표기.** 행정구역·주소·요금·어종은 검증된 표기로. 근사·과장 금지.
7. **수치는 타이포다.** 거리·평점·요금은 700 + 고정폭으로 헤딩만큼 신경 쓴다.
8. **여백은 자산이다.** 줄이면 더 들어가는 상황이면, 답은 빽빽함이 아니라 다음 화면이다.

## 13. Personas

*아래 페르소나는 공개적으로 알려진 아웃도어 사용자 세그먼트에 기반한 가상 아키타입이며, 특정 개인이 아닙니다.*

**도현 (35), 경기.** 주말 오토캠핑러. 금요일 밤 출발 전 차 안에서 스팟을 정한다. 필요한 것: 정확한 주소·전화·예약처, 그리고 "여기 진짜 차 들어가나"에 대한 진입로 정보. 과장된 블로그 후기를 불신하고, 검증 출처가 보이면 신뢰한다. 길찾기 한 번에 정확한 도착지가 떠야 한다.

**상철 (52), 홍천 인근.** 견지·루어 낚시인. 어종·포인트·수위에 민감하고, 노지/유료터 구분과 요금을 미리 알고 싶어 한다. 화려한 UI보다 "붕어 나오나, 무료인가, 화장실 있나"가 핵심. 한국어만 읽으며, 정확하지 않은 정보엔 바로 등을 돌린다.

**유나 (29), 서울.** 가족·커플 차박러. 물놀이 가능 여부, 1급수, 편의시설, 주변 맛집·편의점을 함께 본다. 모바일에서 지도 위를 스크롤하다 캠핑장 박스로 자연스럽게 내려가길 기대한다. 현장에서 짧은 한줄평을 남기는 걸 좋아한다.

## 14. States

| State | Treatment |
|---|---|
| **Empty (리뷰 없음)** | `grey700` 본문 한 줄로 *왜* 비었는지 (`아직 리뷰가 없어요`) + 안내(현장에서만 등록). 일러스트 없음. `데이터가 없습니다` 금지. |
| **Empty (필터 결과 없음)** | `grey500` 캡션 한 줄 (`조건에 맞는 스팟이 없어요`). 버튼 없이 사용자가 필터 해제. |
| **Loading (첫 페인트)** | 최종 레이아웃 구조에 맞춘 `#f2f4f6` 스켈레톤 블록. 핵심 수치는 `--`로(스켈레톤 금지). |
| **Loading (새로고침)** | 상단 blue500 스피너. 오버레이/차단 없음, 이전 값 유지(예: 날씨 백그라운드 폴링). |
| **Error (인라인 필드)** | `#f04452` 2px border + 하단 13px red 안내 한 문장 (`닉네임을 입력해주세요`). |
| **Error (토스트)** | `#191f28` bg, 흰 14px/400, 3s 자동소멸, 하단 20px inset. (`현장에서만 등록할 수 있어요`) |
| **Success (인라인 플래시)** | 갱신 요소 뒤 `#e8f3ff`(blue50) 300ms 페이드. 설정 토글 등 routine. |
| **Success (리뷰 등록)** | 목록 상단에 즉시 추가 + `#03b26c` 성공 토스트(`리뷰가 등록되었어요`). 평균 평점 즉시 갱신. |
| **Skeleton** | `#f2f4f6` 블록, 컴포넌트 반경(8/12/16px) 적용, 1.2s shimmer. 핵심 수치엔 미적용(`--`). |
| **Disabled** | 버튼 opacity 감소. 입력 border는 `grey200` 유지해 geometry 안정. |

## 15. Motion & Easing

**Durations:**

| Token | Value | Use |
|---|---|---|
| `motion-instant` | 0ms | 토글·체크 상태 |
| `motion-fast` | 150ms | hover, focus, 버튼 press overlay |
| `motion-standard` | 250ms | 기본 — 시트 열림, 카드 확장, 탭 전환 |
| `motion-slow` | 400ms | 강조 전환 — 성공 체크, 온보딩 진행 |
| `motion-page` | 350ms | 라우트 간 풀스크린 전환 |

**Easings:**

| Token | Curve | Use |
|---|---|---|
| `ease-enter` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | 등장 — 시트·토스트·푸시 |
| `ease-exit` | `cubic-bezier(0.4, 0.0, 1, 1)` | 퇴장 — dismiss |
| `ease-standard` | `cubic-bezier(0.4, 0.0, 0.2, 1)` | 양방향 — collapsible, 탭 콘텐츠 |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 예약: 성공 체크마크 한 곳만. 그 외 overshoot 금지. |

**Signature motions.**
1. **수치 갱신.** 거리·날씨·평점이 바뀌면 기존 값이 위로 20px 슬라이드+페이드아웃(`motion-fast/ease-exit`), 새 값이 아래에서 슬라이드인(`motion-standard/ease-enter`). 핵심 수치는 cross-fade 금지(값이 깜빡이면 버그처럼 보임).
2. **바텀시트.** `y+40px`에서 `motion-standard/ease-enter`로 상승 + 배경 스크림 동기 페이드. dismiss는 `motion-fast/ease-exit`(나갈 땐 더 가볍게). — 현재 모바일 스팟 슬라이드오버에 적용.
3. **성공 체크마크.** 리뷰 등록 등 확인 모먼트에서 `motion-slow/ease-spring`. spring은 여기만.
4. **Reduce motion.** `prefers-reduced-motion: reduce`면 모든 `motion-*`을 `motion-instant`로. 슬라이드 대신 cross-fade. 예외 없음.

<!--
omd v0.1 — bootstrapped from `toss` reference (preserve mode).
- §1–9(토큰·구조)와 §10·§12·§14·§15의 디자인 철학/모션은 Toss 레퍼런스 DESIGN.md(검증 2026-05-08)의 canonical 값을 보존.
- §11(브랜드 서사)·§13(페르소나)·도메인 예시는 홍천 아웃도어 프로젝트 맥락으로 치환. 공식 서비스명/런칭/태그라인 등 미확정 사실은 [FILL IN] placeholder.
- '토스 스타일' 지시에 따라 color/radius/type 토큰은 delta 없이 유지. 아웃도어 그린 등으로 조정하려면 color.hue_deg delta로 재생성.
- Toss Product Sans는 비공개 폰트 → 웹 구현은 Pretendard(오픈소스)로 대체 권장.
-->
