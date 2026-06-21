import NextAuth from "next-auth";
import Kakao from "next-auth/providers/kakao";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db, schema } from "@/db";

/**
 * Auth.js(NextAuth v5) 설정 — 카카오 로그인.
 * 카카오 키 + Turso가 모두 설정돼야 활성화(authConfigured)된다.
 * 미설정 시 providers/adapter가 비어 로그인 UI가 숨겨지고 사이트는 그대로 동작.
 */
const kakaoId = process.env.AUTH_KAKAO_ID;
const kakaoSecret = process.env.AUTH_KAKAO_SECRET;
const hasDb = Boolean(process.env.TURSO_DATABASE_URL);

export const authConfigured = Boolean(kakaoId && kakaoSecret && hasDb);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: hasDb
    ? DrizzleAdapter(db, {
        usersTable: schema.users,
        accountsTable: schema.accounts,
        sessionsTable: schema.sessions,
        verificationTokensTable: schema.verificationTokens,
      })
    : undefined,
  session: { strategy: "jwt" },
  providers:
    kakaoId && kakaoSecret
      ? [Kakao({ clientId: kakaoId, clientSecret: kakaoSecret })]
      : [],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) (token as { uid?: string }).uid = user.id;
      return token;
    },
    async session({ session, token }) {
      const uid = (token as { uid?: string }).uid;
      if (uid && session.user) session.user.id = uid;
      return session;
    },
  },
});
