import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 자연/아웃도어 무드의 정제된 그린 팔레트
        forest: {
          50: "#f1f8f3",
          100: "#dcefe1",
          200: "#bbdfc7",
          300: "#8cc7a3",
          400: "#57a87b",
          500: "#2f8a5b",
          600: "#206e47",
          700: "#1b5739",
          800: "#17442e",
          900: "#123726",
        },
        // 따뜻한 모래/스톤 중립색 (배경)
        sand: {
          50: "#faf8f3",
          100: "#f3eee2",
          200: "#e7ddc8",
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
