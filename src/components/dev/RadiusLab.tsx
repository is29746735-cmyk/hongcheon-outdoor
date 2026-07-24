"use client";

import { useEffect, useState } from "react";

/**
 * [개발 전용] radius 비교 실험실 — "각진 디자인" 완화안을 라이브로 갈아끼워 눈으로 비교한다.
 *
 * globals.css 의 --r-* 변수를 html[data-radius] 로 전환한다. tailwind.config 의 radius 토큰이
 * 이 변수를 참조하므로 rounded-t-2xl 같은 방향 변형까지 사이트 전체가 즉시 바뀐다.
 * 선택은 localStorage 에 남아 페이지를 옮겨 다니며 같은 안으로 둘러볼 수 있다.
 *
 * 프로덕션에는 렌더되지 않는다(layout.tsx 에서 NODE_ENV 로 차단). 비교가 끝나면
 * 선택한 값을 globals.css 의 :root 기본값으로 옮기고 이 컴포넌트를 삭제하면 된다.
 *
 * 패널 자체는 인라인 스타일(고정 radius) — 전환할 때 컨트롤까지 변형되면 비교가 어렵다.
 */
const OPTIONS = [
  { key: "", label: "1안 현행", desc: "전부 2px · 최대 각짐" },
  { key: "proportional", label: "3안 면적비례 ★", desc: "카드14 시트12 칩3~6" },
  { key: "warm", label: "4안 따뜻", desc: "카드22 시트18 칩6~10" },
] as const;

const STORE = "hco:radius-lab";

export default function RadiusLab() {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(true);

  function apply(key: string) {
    if (key) document.documentElement.dataset.radius = key;
    else delete document.documentElement.dataset.radius;
  }

  useEffect(() => {
    let saved = "";
    try {
      saved = localStorage.getItem(STORE) ?? "";
    } catch {
      /* noop */
    }
    apply(saved);
    setActive(saved);
  }, []);

  function pick(key: string) {
    apply(key);
    setActive(key);
    try {
      localStorage.setItem(STORE, key);
    } catch {
      /* noop */
    }
  }

  const shell: React.CSSProperties = {
    position: "fixed",
    left: 12,
    bottom: 12,
    zIndex: 9999,
    background: "rgba(18,24,21,0.94)",
    color: "#fff",
    borderRadius: 10,
    boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
    fontFamily: "system-ui, sans-serif",
    backdropFilter: "blur(6px)",
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ ...shell, padding: "8px 12px", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}
        aria-label="radius 비교 패널 열기"
      >
        ◐ radius
      </button>
    );
  }

  return (
    <div style={{ ...shell, padding: "10px 12px", minWidth: 232 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", opacity: 0.75 }}>
          RADIUS 비교 (개발 전용)
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{ background: "transparent", border: "none", color: "#fff", opacity: 0.6, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}
          aria-label="접기"
        >
          ×
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {OPTIONS.map((o) => {
          const on = active === o.key;
          return (
            <button
              key={o.key || "current"}
              type="button"
              onClick={() => pick(o.key)}
              style={{
                textAlign: "left",
                padding: "7px 9px",
                borderRadius: 7,
                border: on ? "1px solid #e8552b" : "1px solid rgba(255,255,255,0.14)",
                background: on ? "rgba(232,85,43,0.18)" : "rgba(255,255,255,0.05)",
                color: "#fff",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              {o.label}
              <span style={{ display: "block", fontSize: 10.5, fontWeight: 500, opacity: 0.6, marginTop: 2 }}>
                {o.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
