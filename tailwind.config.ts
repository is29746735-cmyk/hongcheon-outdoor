import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 브랜드/상호작용 — 채도 낮춘 뮤트 파인그린 (redesign 2026-07-13: 각진 전문톤)
        forest: {
          50: "#eef2ef",
          100: "#dde5df",
          200: "#bfccc3",
          300: "#9aab9f",
          400: "#6d8474",
          500: "#4e6656",
          600: "#3b5646", // 메인 상호작용 (뮤트 파인그린)
          700: "#2e4738",
          800: "#25382d", // 히어로 딥 그린
          900: "#1b2a21",
        },
        // 이전 teal(river) 자리를 뮤트 그린으로 흡수 — 사이트에서 청록 제거
        river: {
          50: "#eef2ef",
          100: "#dbe4dd",
          200: "#bccabf",
          300: "#93a89a",
          400: "#63806e",
          500: "#476253",
          600: "#38513f",
          700: "#2e4738",
        },
        // 크림(sand) → 클린 뉴트럴 오프화이트/그레이 (50은 흰 카드가 뜨도록 살짝 깊게)
        sand: {
          50: "#e9ede6",
          100: "#e2e7df",
          200: "#d3d9cf",
          300: "#c2cabf",
        },
        // 강조(엠버) — 강한 색 포인트(검색·주의·용품 CTA 등 몇 곳만). 유지.
        ember: {
          50: "#fdf1ec",
          100: "#f9d9c9",
          200: "#f2b79b",
          300: "#ea9068",
          400: "#e2703f",
          500: "#e8552b", // 시그널 오렌지 강조
          600: "#c6461f",
          700: "#94371a",
        },
        // 용품 칸용 그레이-그린(딥 그린보다 채도 낮춤)
        moss: {
          700: "#3c473f",
          800: "#333d37",
        },
        clay: {
          500: "#b5613a",
          600: "#9a4e2d",
        },
      },
      /**
       * 타이포 스케일 — B안(2026-07-25 채택, /type-lab 비교 후).
       *
       * 한글은 같은 크기의 라틴보다 자모가 많아 12px 이하에서 급격히 읽기 어려워진다.
       * 이전 값(xs 12px/1.33, sm 14px/1.43)은 사이트 전체를 "오래된 정부 사이트"처럼
       * 보이게 만들던 원인이라, 작은 쪽을 한 단계 올리고 행간을 넓혔다.
       * 큰 제목(lg 이상)은 지적 대상이 아니어서 기본값 그대로 둔다.
       */
      fontSize: {
        xs: ["13px", { lineHeight: "1.5" }],    // 기존 12px / 16px
        sm: ["15px", { lineHeight: "1.5" }],    // 기존 14px / 20px
        base: ["16px", { lineHeight: "1.65" }], // 기존 16px / 24px
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Pretendard Variable",
          "Pretendard",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          "system-ui",
          "sans-serif",
        ],
      },
      // radius 토큰을 CSS 변수로 위임(값은 globals.css). 기본값은 현행 각진 2px 그대로.
      // 변수화하면 rounded-t-2xl 같은 방향 변형까지 한 번에 바뀌어, 완화안을 라이브 비교할 수 있다.
      // (full 만 원형 고정: 아바타·스피너·토글 썸)
      borderRadius: {
        none: "0px",
        sm: "var(--r-sm)",
        DEFAULT: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
        xl: "var(--r-xl)",
        "2xl": "var(--r-2xl)",
        "3xl": "var(--r-3xl)",
        full: "9999px",
      },
      boxShadow: {
        // 중립·단일 레이어(컬러 틴트 제거) — 각진 카드가 배경에서 또렷이 뜨도록 정의 강화
        card: "0 1px 3px rgba(20,26,24,0.10), 0 10px 22px -12px rgba(20,26,24,0.20)",
        "card-hover":
          "0 2px 6px rgba(20,26,24,0.12), 0 16px 30px -12px rgba(20,26,24,0.28)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
