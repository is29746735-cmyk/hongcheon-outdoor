import type { DefaultSession } from "next-auth";

/** 세션 사용자에 id 추가 (리뷰를 userId로 연결하기 위해) */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
