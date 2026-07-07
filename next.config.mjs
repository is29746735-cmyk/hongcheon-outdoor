/** @type {import('next').NextConfig} */

// 전역 보안 헤더 — 클릭재킹·MIME 스니핑 방어, HTTPS 강제, 참조자·권한 축소.
// (CSP는 지도 SDK·외부 이미지 도메인을 정확히 허용해야 하므로 별도 검증 후 추가.)
const securityHeaders = [
  // HTTPS 강제 (2년, 서브도메인 포함). 프로덕션(HTTPS)에서만 의미가 있고 로컬에는 영향 없음.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // 외부 사이트에서 iframe 삽입 차단 (클릭재킹 방어). 동일 출처 프레이밍은 허용.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // 선언된 Content-Type 무시(MIME 스니핑) 방지.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // 크로스 오리진으로는 출처(origin)까지만 전송.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 카메라·마이크는 차단, 위치정보는 동일 출처만 허용(현장 리뷰 GPS 인증에 필요).
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    // 외부 이미지(큐레이션 사진, 지도 썸네일 등) 도메인을 여기에 추가하세요.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
