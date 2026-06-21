import { config } from "dotenv";
import type { Config } from "drizzle-kit";

// drizzle-kit는 .env.local을 자동 로드하지 않으므로 명시적으로 읽는다.
config({ path: ".env.local" });

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
