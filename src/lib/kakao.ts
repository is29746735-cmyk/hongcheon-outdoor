/**
 * 카카오맵 SDK 공용 로더. (services 라이브러리 포함, 한 번만 로드)
 * KakaoMap, CourseMap 등 여러 클라이언트 컴포넌트에서 재사용합니다.
 */
declare global {
  interface Window {
    kakao: any;
  }
}

export const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
const SCRIPT_ID = "kakao-maps-sdk";

export function loadKakaoSdk(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return;
    if (window.kakao?.maps) {
      resolve();
      return;
    }
    const existing = document.getElementById(
      SCRIPT_ID
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () =>
        window.kakao.maps.load(() => resolve())
      );
      existing.addEventListener("error", () =>
        reject(new Error("Kakao SDK load failed"))
      );
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services&autoload=false`;
    script.onload = () => window.kakao.maps.load(() => resolve());
    script.onerror = () => reject(new Error("Kakao SDK load failed"));
    document.head.appendChild(script);
  });
}
