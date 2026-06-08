import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 자연을 닮은 딥 그린 팔레트 (브랜드: 어두운 숲 그린)
        forest: {
          50: "#f1f7f2",
          100: "#dcecdf",
          200: "#bad7c1",
          300: "#8cbd9b",
          400: "#579a6f",
          500: "#327d52",
          600: "#22633f",
          700: "#1e3a1e", // 메인 딥 그린 포인트
          800: "#193016",
          900: "#132511",
        },
        // 따뜻한 베이지/크림 (매거진 배경·포인트)
        sand: {
          50: "#faf6ec",
          100: "#f1e7d3",
          200: "#e6d6b6",
          300: "#d8c193",
        },
        // 포인트용 테라코타(따뜻한 흙색) — 매거진 액센트
        clay: {
          500: "#b5613a",
          600: "#9a4e2d",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,40,28,0.04), 0 8px 24px -12px rgba(16,40,28,0.18)",
        "card-hover":
          "0 2px 4px rgba(16,40,28,0.06), 0 16px 36px -14px rgba(16,40,28,0.28)",
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
