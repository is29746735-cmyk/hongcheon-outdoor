import { LogIn, LogOut, UserRound } from "lucide-react";
import { auth, signIn, signOut, authConfigured, enabledProviders } from "@/auth";

/**
 * 헤더 로그인/로그아웃 버튼 (서버 컴포넌트).
 * 카카오 키 + Turso가 설정되기 전(authConfigured=false)에는 아무것도 렌더하지 않아
 * 기존 사이트(정적 페이지 포함)에 영향을 주지 않는다. 설정 완료 후 자동으로 나타난다.
 */
export default async function AuthButton() {
  if (!authConfigured) return null;

  const session = await auth().catch(() => null);
  const user = session?.user;

  if (user) {
    return (
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="flex items-center gap-2"
      >
        <span className="hidden items-center gap-1.5 text-sm font-semibold text-forest-700 sm:inline-flex">
          <UserRound className="h-4 w-4" strokeWidth={2} />
          {user.name ?? "회원"}
        </span>
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-200"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} />
          로그아웃
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {enabledProviders.kakao && (
        <form
          action={async () => {
            "use server";
            await signIn("kakao", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full bg-forest-600 px-3.5 py-2 text-sm font-bold text-white transition hover:bg-forest-700"
          >
            <LogIn className="h-4 w-4" strokeWidth={2.2} />
            카카오 로그인
          </button>
        </form>
      )}
      {enabledProviders.google && (
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3.5 py-2 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50"
          >
            <LogIn className="h-4 w-4" strokeWidth={2.2} />
            구글 로그인
          </button>
        </form>
      )}
    </div>
  );
}
