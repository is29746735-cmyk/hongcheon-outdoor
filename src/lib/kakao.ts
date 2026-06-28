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

/**
 * 단일 로드 약속(싱글톤). 여러 컴포넌트(KakaoMap·CourseMap 등)가 동시에 호출해도
 * 스크립트는 한 번만 주입되고 모두 같은 Promise를 공유한다. 실패 시에만 캐시를 비워 재시도를 허용.
 */
let sdkPromise: Promise<void> | null = null;

export function loadKakaoSdk(key: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.kakao?.maps) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<void>((resolve, reject) => {
    const onLoaded = () => window.kakao.maps.load(() => resolve());
    const existing = document.getElementById(
      SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (existing) {
      // 이미 스크립트가 로드 완료된 상태(autoload=false라 maps.load만 필요)
      if (window.kakao) {
        onLoaded();
        return;
      }
      existing.addEventListener("load", onLoaded);
      existing.addEventListener("error", () =>
        reject(new Error("Kakao SDK load failed"))
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services&autoload=false`;
    script.onload = onLoaded;
    script.onerror = () => reject(new Error("Kakao SDK load failed"));
    document.head.appendChild(script);
  });

  // 실패 시 다음 호출에서 재시도할 수 있도록 캐시 해제
  sdkPromise.catch(() => {
    sdkPromise = null;
  });

  return sdkPromise;
}
