import { auth, authConfigured, enabledProviders } from "@/auth";
import LoginDialog from "@/components/layout/LoginDialog";
import LogoutButton from "@/components/layout/LogoutButton";

/**
 * 헤더 로그인/로그아웃 버튼 (서버 컴포넌트).
 * 카카오 키 + Turso가 설정되기 전(authConfigured=false)에는 아무것도 렌더하지 않아
 * 기존 사이트(정적 페이지 포함)에 영향을 주지 않는다. 설정 완료 후 자동으로 나타난다.
 * 로그아웃은 확인 모달(LogoutButton)을 거쳐 한 번 더 확인한다.
 */
export default async function AuthButton() {
  if (!authConfigured) return null;

  const session = await auth().catch(() => null);
  const user = session?.user;

  if (user) {
    return <LogoutButton name={user.name ?? "회원"} />;
  }

  return (
    <LoginDialog
      kakao={enabledProviders.kakao}
      google={enabledProviders.google}
      naver={enabledProviders.naver}
    />
  );
}
