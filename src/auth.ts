import NextAuth from "next-auth";
import Kakao from "next-auth/providers/kakao";
import Google from "next-auth/providers/google";
import Naver from "next-auth/providers/naver";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db, schema } from "@/db";

/**
 * Auth.js(NextAuth v5) 설정 — 소셜 로그인(카카오·구글·네이버).
 * 소셜 키(하나 이상) + Turso가 설정돼야 활성화(authConfigured)된다.
 * 미설정 시 providers/adapter가 비어 로그인 UI가 숨겨지고 사이트는 그대로 동작.
 */
const kakaoId = process.env.AUTH_KAKAO_ID;
const kakaoSecret = process.env.AUTH_KAKAO_SECRET;
const googleId = process.env.AUTH_GOOGLE_ID;
const googleSecret = process.env.AUTH_GOOGLE_SECRET;
const naverId = process.env.AUTH_NAVER_ID;
const naverSecret = process.env.AUTH_NAVER_SECRET;
const hasDb = Boolean(process.env.TURSO_DATABASE_URL);

/** env가 채워진 provider만 켜진다(노출된다). */
export const enabledProviders = {
  kakao: Boolean(kakaoId && kakaoSecret),
  google: Boolean(googleId && googleSecret),
  naver: Boolean(naverId && naverSecret),
};

export const authConfigured = Boolean(
  hasDb &&
    (enabledProviders.kakao ||
      enabledProviders.google ||
      enabledProviders.naver),
);

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
  providers: [
    ...(kakaoId && kakaoSecret
      ? [Kakao({ clientId: kakaoId, clientSecret: kakaoSecret })]
      : []),
    ...(googleId && googleSecret
      ? [Google({ clientId: googleId, clientSecret: googleSecret })]
      : []),
    ...(naverId && naverSecret
      ? [Naver({ clientId: naverId, clientSecret: naverSecret })]
      : []),
  ],
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
