/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // 외부 이미지(큐레이션 사진, 지도 썸네일 등) 도메인을 여기에 추가하세요.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
