import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "홍천 아웃도어 — 홍천 캠핑·낚시·차박 큐레이션";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1e3a1e",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            color: "#22633f",
            fontSize: 28,
            letterSpacing: 6,
            marginBottom: 24,
            textTransform: "uppercase",
          }}
        >
          HONGCHEON OUTDOOR
        </div>
        <div
          style={{
            color: "#ffffff",
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: -2,
            marginBottom: 20,
          }}
        >
          홍천 아웃도어
        </div>
        <div
          style={{
            color: "#a3b89a",
            fontSize: 28,
            letterSpacing: 1,
          }}
        >
          캠핑 · 낚시 · 차박 큐레이션
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 40,
            color: "#4a7c59",
            fontSize: 20,
          }}
        >
          hongcheon-outdoor-kv6c.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
