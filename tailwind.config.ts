import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 아웃도어/자연 무드의 브랜드 컬러
        forest: {
          50: "#f0f7f2",
          100: "#dbeede",
          500: "#2f7d4f",
          600: "#236340",
          700: "#1c4f34",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
