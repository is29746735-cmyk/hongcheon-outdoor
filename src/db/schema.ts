import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import type { AdapterAccountType } from "next-auth/adapters";

/**
 * Auth.js(NextAuth v5) Drizzle 어댑터용 표준 테이블 + 앱 전용 테이블.
 * Turso(libSQL = SQLite) 기준. `npx drizzle-kit push`로 Turso에 생성한다.
 */

export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ── 앱 전용: 이용자 리뷰(로그인 사용자 기준) ───────────────────
export const reviews = sqliteTable("review", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  placeId: text("placeId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  content: text("content").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }),
});

// ── 앱 전용: 저장(북마크)한 장소 ───────────────────────────────
export const savedPlaces = sqliteTable(
  "savedPlace",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    placeId: text("placeId").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [primaryKey({ columns: [t.userId, t.placeId] })]
);
