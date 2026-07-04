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

// ── 앱 전용: 장소별 경험담·사진 (커뮤니티) ─────────────────────
// 리뷰(현장 GPS 인증·1인1리뷰)와 달리, 활동 후 자랑용이라 로그인만 요구.
// 사진은 Vercel Blob URL을 저장(imageUrl). 사진 없는 글도 허용.
export const experiencePosts = sqliteTable("experiencePost", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  placeId: text("placeId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  imageUrl: text("imageUrl"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ── 앱 전용: 제휴 파트너(업체 과금 B2B) ────────────────────────
// tier: 'free'=무료 검증 리스팅 | 'affiliate'=유료 제휴(갤러리·예약연결·뱃지·우선노출)
// verified/affiliate는 별도 플래그 — 절대 한 축에 섞지 말 것(브랜드 철칙)
export const partners = sqliteTable("partner", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  placeId: text("placeId").notNull().unique(),
  businessName: text("businessName").notNull(),
  contactName: text("contactName"),
  contactPhone: text("contactPhone"),
  contactEmail: text("contactEmail"),
  tier: text("tier", { enum: ["free", "affiliate"] })
    .notNull()
    .default("free"),
  // 제휴 과금 정보
  monthlyFee: integer("monthlyFee"),          // 원 단위
  billingStartAt: integer("billingStartAt", { mode: "timestamp_ms" }),
  billingEndAt: integer("billingEndAt", { mode: "timestamp_ms" }),
  // 제휴 기능 플래그
  showGallery: integer("showGallery", { mode: "boolean" }).default(false),
  showReservation: integer("showReservation", { mode: "boolean" }).default(false),
  prioritySlot: integer("prioritySlot", { mode: "boolean" }).default(false),
  note: text("note"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }),
});

// ── 앱 전용: 리스팅 노출·클릭 이벤트 (가치 계측) ─────────────────
// eventType: 'impression'=카드 노출 | 'click'=상세 진입 | 'map_click'=지도 클릭 | 'phone_click'=전화
export const listingEvents = sqliteTable("listingEvent", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  placeId: text("placeId").notNull(),
  eventType: text("eventType", {
    enum: ["impression", "click", "map_click", "phone_click"],
  }).notNull(),
  // 세션 식별(로그인 불필요 — 익명 추적)
  sessionId: text("sessionId"),
  userId: text("userId").references(() => users.id, { onDelete: "set null" }),
  // 유입 컨텍스트
  referrer: text("referrer"),   // 'home' | 'search' | 'saved' | 'direct'
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
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
