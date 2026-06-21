import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

/**
 * Turso(libSQL) 연결. TURSO_DATABASE_URL이 없으면 db는 undefined(런타임)지만
 * 타입은 정의되어 있어, 인증 라우트가 실제로 호출될 때만 필요하다.
 * → 시크릿 미설정 상태에서도 사이트 빌드/렌더에 영향 없음.
 */
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = (
  url ? drizzle(createClient({ url, authToken }), { schema }) : undefined
) as LibSQLDatabase<typeof schema>;

export const isDbConfigured = Boolean(url);
export { schema };
