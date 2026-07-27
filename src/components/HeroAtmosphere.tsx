"use client";

import { useEffect, useRef, useState } from "react";
import {
  parseAtmos,
  resolveWhen,
  skyFor,
  weatherFrom,
  type AtmosOverride,
  type Season,
  type Sky,
  type Weather,
} from "@/lib/atmosphere";
import type { RiverStatusResponse } from "@/types/river";

/**
 * 히어로 배경 — 홍천강의 지금.
 *
 * 하나의 캔버스에 다음을 그린다.
 *   하늘(시간대·계절·날씨) → 별 → 먼 능선 → 계절 가지 → 떨어지는 것(꽃잎·낙엽)
 *   → 강둑 → 모닥불 → 반딧불 → 비·눈
 *
 * 상호작용: 마우스/손가락이 지나가면 그 자리에서 바람이 인다. 불꽃이 눕고,
 * 불티가 흩어지고, 눈·꽃잎·반딧불이 밀린다. 빠르게 지나갈수록 세게 인다.
 *
 * 지키는 것
 *  - `prefers-reduced-motion` 이면 애니메이션 없이 **한 장면만** 그린다.
 *  - 히어로가 화면 밖이거나 탭이 숨으면 루프를 멈춘다(스크롤 중 CPU 낭비 방지).
 *  - 캔버스는 `pointer-events-none` — 위에 있는 버튼·링크를 절대 가로채지 않는다.
 *  - 팔레트는 전부 어두운 쪽이라 흰 글자 대비(최소 5.5:1)가 유지된다.
 */

/** 레티나 과부하 방지 — 3배 이상은 눈에 띄는 이득이 없다 */
const DPR_CAP = 2;

// ── 파티클 타입 ───────────────────────────────────────────────────
interface Flame {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  seed: number;
}
interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  /** 불티마다 다른 옆흐름(px/s) — 이게 없으면 다 같은 기둥으로 몰린다 */
  drift: number;
}
interface Drop {
  x: number;
  y: number;
  len: number;
  vy: number;
  a: number;
}
interface Splash {
  x: number;
  y: number;
  life: number;
}
interface Flake {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  seed: number;
  a: number;
}
interface Faller {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  petal: boolean;
}
interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  seed: number;
}
interface Star {
  x: number;
  y: number;
  r: number;
  seed: number;
}

/** 계절별 잎/꽃잎 색 — 채도를 낮춰 배경에 묻히게 둔다 */
const FALLER_COLORS: Record<Season, string[]> = {
  spring: ["#e7c2cb", "#f0d9dd", "#dcb3bf"],
  summer: ["#5c7a5f", "#6d8474"],
  autumn: ["#b0642f", "#c28a3c", "#9a4a28"],
  winter: ["#c9d4d9"],
};

/** 결정론적 의사난수 — 새로고침할 때마다 능선이 달라지면 브랜드가 흔들린다 */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function HeroAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [weather, setWeather] = useState<Weather>({
    precip: "none",
    intensity: 0,
    overcast: false,
    label: null,
  });
  const [ready, setReady] = useState(false);

  // 루프를 다시 만들지 않기 위해 변하는 값은 전부 ref 로 넘긴다
  const weatherRef = useRef(weather);
  weatherRef.current = weather;
  /** 날씨가 도착하면 하늘을 즉시 다시 계산하게 하는 신호 */
  const refreshRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    refreshRef.current?.();
  }, [weather]);

  // ── 현재 날씨 받아오기 (관측값만 사용) ──────────────────────────
  useEffect(() => {
    const ov = parseAtmos(window.location.search);
    if (ov?.precip) {
      // 미리보기로 고정한 장면 — 실제 날씨를 덮어쓴다
      setWeather({
        precip: ov.precip,
        intensity: ov.precip === "none" ? 0 : 0.6,
        overcast: ov.precip !== "none",
        label:
          ov.precip === "snow"
            ? "미리보기 · 눈"
            : ov.precip === "rain"
            ? "미리보기 · 비"
            : null,
      });
      return;
    }

    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/river-status");
        if (!res.ok) return;
        const json = (await res.json()) as RiverStatusResponse;
        if (alive) setWeather(weatherFrom(json));
      } catch {
        // 실패해도 배경은 계절·시간대만으로 충분히 동작한다
      }
    };
    load();
    const timer = setInterval(load, 10 * 60 * 1000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  // ── 캔버스 ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement;
    if (!host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // 레이아웃 값
    let w = 0;
    let h = 0;
    let dpr = 1;
    let ground = 0; // 강둑 윗변 기준선
    let fireX = 0;
    let fireScale = 1;
    /** 불티가 노는 가로 반폭 — 화면 폭의 1/4 안에서만 흩어진다 */
    let emberHalfWidth = 0;
    /** 불티가 오를 수 있는 가장 높은 y — 화면 중앙보다 조금 위 */
    let emberTop = 0;
    let branchTips: { x: number; y: number }[] = [];
    let backdrop: HTMLCanvasElement | null = null; // 능선+가지(정적 레이어)

    // 파티클
    const flames: Flame[] = [];
    const embers: Ember[] = [];
    const drops: Drop[] = [];
    const splashes: Splash[] = [];
    const flakes: Flake[] = [];
    const fallers: Faller[] = [];
    const flies: Firefly[] = [];
    let stars: Star[] = [];

    /** 눈 쌓임 — 가로를 나눈 버킷별 높이(px) */
    let pile = new Float32Array(1);

    /** 불기둥이 눕는 정도(px, 꼭대기 기준). 오른쪽이 양수. */
    let bend = 0;

    // 포인터(바람)
    const pointer = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      active: false,
      strength: 0, // 0~1, 최근 움직임의 세기
    };

    // 계절·하늘은 30초마다만 다시 계산한다(매 프레임 할 이유가 없다)
    const override: AtmosOverride | null = parseAtmos(window.location.search);
    let when = resolveWhen(new Date(), override);
    let season: Season = when.season;
    let sky: Sky = skyFor(when, weatherRef.current);
    let skyAge = 99;

    // ── 지형 ────────────────────────────────────────────────────
    /** 강둑 윗변 — 물결이 아니라 거의 평평한 둑. 흔들림은 ±3px 뿐. */
    const bankTop = (x: number) =>
      ground + Math.sin(x * 0.011) * 2.5 + Math.sin(x * 0.027 + 1.7) * 1.5;

    /** 먼 능선(홍천은 산이 둘러싼 곳이다) */
    function ridgePath(baseY: number, amp: number, seed: number) {
      const rnd = seeded(seed);
      const pts: [number, number][] = [];
      const steps = Math.max(5, Math.round(w / 150));
      for (let i = 0; i <= steps; i++) {
        const x = (w / steps) * i;
        const peak = Math.pow(rnd(), 1.6);
        pts.push([x, baseY - peak * amp]);
      }
      return pts;
    }

    function fillRidge(
      c: CanvasRenderingContext2D,
      pts: [number, number][],
      color: string
    ) {
      c.beginPath();
      c.moveTo(-2, h + 2);
      c.lineTo(pts[0][0] - 2, pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1];
        const [x1, y1] = pts[i];
        c.quadraticCurveTo((x0 + x1) / 2, Math.min(y0, y1), x1, y1);
      }
      c.lineTo(w + 2, h + 2);
      c.closePath();
      c.fillStyle = color;
      c.fill();
    }

    // ── 계절 가지 ────────────────────────────────────────────────
    /** 큐빅 베지어 위의 점 */
    function bez(
      t: number,
      p0: [number, number],
      p1: [number, number],
      p2: [number, number],
      p3: [number, number]
    ): [number, number] {
      const u = 1 - t;
      const a = u * u * u;
      const b = 3 * u * u * t;
      const c = 3 * u * t * t;
      const d = t * t * t;
      return [
        a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
        a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
      ];
    }

    /**
     * 왼쪽 위에서 뻗어 나온 가지 하나. 계절마다 옷이 바뀐다.
     * 봄=꽃, 여름=잎, 가을=단풍, 겨울=맨가지 위의 눈.
     * 좁은 화면에서는 제목과 겹치므로 그리지 않는다.
     */
    function drawBranch(c: CanvasRenderingContext2D) {
      branchTips = [];
      if (w < 700) return;

      const bw = Math.min(430, w * 0.36);
      const bh = Math.min(250, h * 0.34);
      const p0: [number, number] = [-16, bh * 0.06];
      const p1: [number, number] = [bw * 0.34, bh * 0.34];
      const p2: [number, number] = [bw * 0.64, bh * 0.5];
      const p3: [number, number] = [bw, bh * 0.72];

      const ink = "#0a120e";
      c.save();
      c.globalAlpha = 0.92;
      c.lineCap = "round";

      // 본가지 — 끝으로 갈수록 가늘어지게 여러 구간으로 나눠 긋는다
      const SEG = 22;
      for (let i = 0; i < SEG; i++) {
        const t0 = i / SEG;
        const t1 = (i + 1) / SEG;
        const [x0, y0] = bez(t0, p0, p1, p2, p3);
        const [x1, y1] = bez(t1, p0, p1, p2, p3);
        c.beginPath();
        c.moveTo(x0, y0);
        c.lineTo(x1, y1);
        c.strokeStyle = ink;
        c.lineWidth = 7 * (1 - t0) + 1.4;
        c.stroke();
      }

      // 곁가지
      const twigs = [
        { t: 0.2, ang: -1.0, len: 0.3 },
        { t: 0.33, ang: 0.72, len: 0.22 },
        { t: 0.47, ang: -0.82, len: 0.28 },
        { t: 0.62, ang: 0.58, len: 0.2 },
        { t: 0.76, ang: -0.66, len: 0.24 },
        { t: 0.88, ang: 0.4, len: 0.17 },
      ];
      const leafColors = FALLER_COLORS[season];

      for (const tw of twigs) {
        const [bx, by] = bez(tw.t, p0, p1, p2, p3);
        const [nx, ny] = bez(Math.min(1, tw.t + 0.02), p0, p1, p2, p3);
        const base = Math.atan2(ny - by, nx - bx);
        const ang = base + tw.ang;
        const len = bw * tw.len;
        const ex = bx + Math.cos(ang) * len;
        const ey = by + Math.sin(ang) * len;
        // 살짝 휘게
        const cx = bx + Math.cos(ang + 0.3) * len * 0.55;
        const cy = by + Math.sin(ang + 0.3) * len * 0.55;

        c.beginPath();
        c.moveTo(bx, by);
        c.quadraticCurveTo(cx, cy, ex, ey);
        c.strokeStyle = ink;
        c.lineWidth = 2.6;
        c.stroke();

        branchTips.push({ x: ex, y: ey });

        // 계절 장식
        if (season === "winter") {
          // 가지 위에 얹힌 눈
          c.beginPath();
          c.moveTo(bx, by - 2.2);
          c.quadraticCurveTo(cx, cy - 2.6, ex, ey - 2.2);
          c.strokeStyle = "rgba(226,236,240,0.75)";
          c.lineWidth = 1.8;
          c.stroke();
        } else {
          const n = season === "summer" ? 7 : season === "autumn" ? 5 : 4;
          for (let i = 1; i <= n; i++) {
            const t = 0.25 + (i / (n + 1)) * 0.8;
            const lx = bx + (ex - bx) * t + Math.sin(i * 2.3) * 5;
            const ly = by + (ey - by) * t + Math.cos(i * 1.7) * 5;
            const col = leafColors[i % leafColors.length];
            c.save();
            c.translate(lx, ly);
            c.rotate(ang + i * 0.8);
            c.fillStyle = col;
            c.globalAlpha = season === "spring" ? 0.85 : 0.9;
            if (season === "spring") {
              // 꽃 — 작은 네 갈래
              for (let k = 0; k < 4; k++) {
                c.beginPath();
                c.ellipse(0, 0, 3.1, 1.7, (k * Math.PI) / 2, 0, Math.PI * 2);
                c.fill();
              }
            } else {
              c.beginPath();
              c.ellipse(0, 0, 5.2, 2.4, 0, 0, Math.PI * 2);
              c.fill();
            }
            c.restore();
          }
        }
      }

      // 겨울엔 본가지 위에도 눈을 얹는다
      if (season === "winter") {
        c.beginPath();
        for (let i = 0; i <= SEG; i++) {
          const [x, y] = bez(i / SEG, p0, p1, p2, p3);
          if (i === 0) c.moveTo(x, y - 3.2);
          else c.lineTo(x, y - 3.2);
        }
        c.strokeStyle = "rgba(226,236,240,0.8)";
        c.lineWidth = 2.6;
        c.stroke();
      }
      c.restore();
    }

    /** 능선 + 가지를 한 번만 그려 두고 매 프레임 복사해 쓴다 */
    function buildBackdrop() {
      const off = document.createElement("canvas");
      off.width = Math.max(1, Math.round(w * dpr));
      off.height = Math.max(1, Math.round(h * dpr));
      const c = off.getContext("2d");
      if (!c) return null;
      c.scale(dpr, dpr);
      fillRidge(c, ridgePath(ground - h * 0.19, h * 0.13, 20260727), "#16211c");
      fillRidge(c, ridgePath(ground - h * 0.09, h * 0.09, 7717), "#101a15");
      drawBranch(c);
      return off;
    }

    // ── 레이아웃 ────────────────────────────────────────────────
    function layout() {
      const rect = host!.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(DPR_CAP, window.devicePixelRatio || 1);
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 강둑은 아래 겹쳐 오는 지수 카드(-80px)보다 위에 두어 모닥불이 가리지 않게.
      // 좁은 화면은 히어로가 세로로 길어지므로 여백을 더 줄여 불을 아래에 붙인다.
      ground = h - Math.max(84, Math.min(w < 640 ? 100 : 118, h * 0.145));
      fireX = w * 0.5;
      fireScale = w < 640 ? 1.05 : 1.35;
      // 불티는 '화면 아래 가운데 1/4' 안에서 자유롭게 흩어지되 그 밖으로는 안 나간다
      emberHalfWidth = Math.min(w * 0.25, 340) / 2;
      emberTop = ground - Math.min(h * 0.46, 360);

      const buckets = Math.max(24, Math.round(w / 14));
      const next = new Float32Array(buckets);
      // 겨울은 눈이 쌓여 있는 것이 기본값이다(얇게, 고르지 않게)
      if (season === "winter") {
        for (let i = 0; i < buckets; i++) {
          next[i] = Math.max(
            0.6,
            2.2 + Math.sin(i * 0.7) * 1.1 + Math.sin(i * 0.23) * 1.3
          );
        }
      }
      pile = next;

      stars = [];
      const rnd = seeded(424242);
      const count = Math.round((w * h) / 15000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: rnd() * w,
          y: rnd() * (ground - h * 0.2),
          r: 0.5 + rnd() * 1.1,
          seed: rnd() * 100,
        });
      }

      backdrop = buildBackdrop();
    }

    // ── 스폰 ────────────────────────────────────────────────────
    function spawnFlame() {
      const s = fireScale;
      flames.push({
        x: fireX + (Math.random() - 0.5) * 26 * s,
        y: ground - 3 - Math.random() * 6,
        vx: (Math.random() - 0.5) * 12,
        vy: -(78 + Math.random() * 52) * s,
        life: 0,
        max: 0.6 + Math.random() * 0.55,
        size: (6.5 + Math.random() * 6) * s,
        seed: Math.random() * 10,
      });
    }

    /**
     * 불티. 불꽃 기둥에서 떨어져 나와 **화면 아래 가운데 1/4** 을 자유롭게 떠다닌다.
     * 위로는 화면 중앙보다 조금 높은 곳까지만 오르고, 옆으로도 그 범위를 넘지 않는다.
     */
    function spawnEmber(boost = 0) {
      const s = fireScale;
      embers.push({
        x: fireX + (Math.random() - 0.5) * 20 * s,
        y: ground - 8 - Math.random() * 10,
        vx: (Math.random() - 0.5) * (34 + boost * 110),
        vy: -(58 + Math.random() * 62 + boost * 50) * s,
        life: 0,
        max: 3.4 + Math.random() * 2.8,
        r: 0.9 + Math.random() * 1.4,
        drift: (Math.random() - 0.5) * 118,
      });
    }

    /** 떨어지는 것(꽃잎·낙엽)은 가지 끝에서 난다. 가지가 없으면 위쪽 가장자리에서. */
    function spawnFaller() {
      const colors = FALLER_COLORS[season];
      const tip =
        branchTips.length > 0 && Math.random() < 0.7
          ? branchTips[Math.floor(Math.random() * branchTips.length)]
          : null;
      fallers.push({
        x: tip ? tip.x + (Math.random() - 0.5) * 14 : Math.random() * w,
        y: tip ? tip.y : -12,
        vx: (Math.random() - 0.5) * 14,
        vy: 16 + Math.random() * 22,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 2.6,
        size: season === "spring" ? 4 + Math.random() * 3 : 5 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        petal: season === "spring",
      });
    }

    function spawnFly() {
      flies.push({
        x: Math.random() * w,
        y: ground - 20 - Math.random() * (h * 0.32),
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 10,
        seed: Math.random() * 100,
      });
    }

    function spawnDrop(fromTop: boolean) {
      const speed = 620 + Math.random() * 420;
      drops.push({
        x: Math.random() * (w + 160) - 80,
        y: fromTop ? -20 : Math.random() * ground,
        len: 9 + Math.random() * 13,
        vy: speed,
        a: 0.18 + Math.random() * 0.24,
      });
    }

    function spawnFlake(fromTop: boolean) {
      flakes.push({
        x: Math.random() * (w + 60) - 30,
        y: fromTop ? -12 : Math.random() * ground,
        r: 1 + Math.random() * 2.2,
        vy: 26 + Math.random() * 34,
        vx: (Math.random() - 0.5) * 10,
        seed: Math.random() * 100,
        a: 0.45 + Math.random() * 0.45,
      });
    }

    // ── 바람(포인터) ─────────────────────────────────────────────
    /**
     * (px,py) 지점이 포인터로부터 받는 힘.
     * `power` 양수 = 손에서 **밀려난다**, 음수 = 손 쪽으로 끌린다.
     * `velScale` 은 '손이 빠르게 지나갈 때' 성분의 비중 — 0 이면 위치에만 반응한다.
     */
    function gust(
      px: number,
      py: number,
      radius: number,
      power: number,
      velScale = 1
    ) {
      if (!pointer.active) return [0, 0] as const;
      const dx = px - pointer.x;
      const dy = py - pointer.y;
      const d2 = dx * dx + dy * dy;
      const r2 = radius * radius;
      if (d2 > r2) return [0, 0] as const;
      const d = Math.sqrt(d2) || 1;
      const f = (1 - d / radius) ** 1.5;
      return [
        (dx / d) * power * f + pointer.vx * 0.42 * f * velScale,
        (dy / d) * power * 0.35 * f + pointer.vy * 0.22 * f * velScale,
      ] as const;
    }

    // ── 그리기 ──────────────────────────────────────────────────
    function drawFire(t: number, nightness: number, lean: number) {
      const s = fireScale;
      // 흔들리는 불빛 세기 — 여러 주기를 겹쳐 기계적이지 않게
      const flicker =
        0.78 +
        0.13 * Math.sin(t * 7.3) +
        0.07 * Math.sin(t * 3.1 + 1.2) +
        0.05 * Math.sin(t * 13.7 + 0.4);
      const fan = Math.min(1, pointer.strength);
      // 밤일수록 불빛이 살아난다. 다만 한낮에도 '모닥불'로 읽혀야 한다.
      // 비·눈이 오면 불은 사그라든다 — 비 오는데 활활 타면 그것도 거짓말이다.
      const wet = weatherRef.current;
      const damp = wet.precip === "none" ? 1 : 1 - 0.3 * wet.intensity;
      const power = flicker * (0.8 + 0.42 * nightness) * (1 + fan * 0.35) * damp;

      // 1) 둑을 비추는 빛웅덩이
      ctx!.save();
      ctx!.globalCompositeOperation = "lighter";
      const pool = ctx!.createRadialGradient(
        fireX,
        ground + 4,
        2,
        fireX,
        ground + 4,
        150 * s
      );
      pool.addColorStop(0, `rgba(232,110,45,${0.3 * power})`);
      pool.addColorStop(0.45, `rgba(190,80,32,${0.12 * power})`);
      pool.addColorStop(1, "rgba(140,60,25,0)");
      ctx!.fillStyle = pool;
      ctx!.beginPath();
      ctx!.ellipse(fireX, ground + 6, 165 * s, 46 * s, 0, 0, Math.PI * 2);
      ctx!.fill();

      // 2) 공중으로 퍼지는 후광 — 세로로 늘려 불기둥을 따라가게
      ctx!.save();
      ctx!.translate(fireX + lean * 0.3, ground - 30 * s);
      ctx!.scale(1, 1.45);
      const halo = ctx!.createRadialGradient(0, 0, 4, 0, 0, 104 * s);
      halo.addColorStop(0, `rgba(255,150,60,${0.17 * power})`);
      halo.addColorStop(0.5, `rgba(220,90,40,${0.07 * power})`);
      halo.addColorStop(1, "rgba(180,70,30,0)");
      ctx!.fillStyle = halo;
      ctx!.beginPath();
      ctx!.arc(0, 0, 104 * s, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.restore();
      ctx!.restore();

      // 3) 장작 — 엇갈려 세운 통나무 두 개 + 재 자리.
      //    각진 실루엣으로 그려 브랜드의 각짐을 여기서도 지킨다.
      ctx!.save();
      ctx!.translate(fireX, ground + 2);
      ctx!.scale(s, s);
      // 재 자리
      ctx!.beginPath();
      ctx!.ellipse(0, 0, 36, 5, 0, 0, Math.PI * 2);
      ctx!.fillStyle = "#0d0a08";
      ctx!.fill();
      const log = (angle: number, len: number, thick: number, lift: number) => {
        ctx!.save();
        ctx!.translate(0, -lift);
        ctx!.rotate(angle);
        ctx!.beginPath();
        ctx!.moveTo(-len, -thick * 0.5);
        ctx!.lineTo(len, -thick * 0.35);
        ctx!.lineTo(len, thick * 0.5);
        ctx!.lineTo(-len, thick * 0.65);
        ctx!.closePath();
        ctx!.fillStyle = "#17110d";
        ctx!.fill();
        // 불에 닿은 윗면만 살짝 달아 있다
        ctx!.beginPath();
        ctx!.moveTo(-len + 3, -thick * 0.5 + 0.8);
        ctx!.lineTo(len - 3, -thick * 0.35 + 0.8);
        ctx!.strokeStyle = `rgba(216,92,40,${0.6 * flicker})`;
        ctx!.lineWidth = 1.3;
        ctx!.stroke();
        ctx!.restore();
      };
      log(-0.3, 30, 6, 3);
      log(0.26, 32, 6.5, 6);
      log(0.02, 26, 5.5, 11);
      ctx!.restore();

      // 4) 불꽃 — 가산 합성으로 심이 하얗게 뜬다
      ctx!.save();
      ctx!.globalCompositeOperation = "lighter";
      for (const f of flames) {
        const u = f.life / f.max; // 0(갓 태어남) → 1(사라짐)
        // 바닥에서 넓고 위로 갈수록 가늘어지는 물방울 모양
        const size = f.size * (1.12 - 0.72 * u) * (0.55 + 0.55 * Math.sin(Math.PI * Math.min(1, u * 3)));
        const a = (1 - u) * 0.52 * power;
        if (a <= 0.004) continue;
        const g = ctx!.createRadialGradient(f.x, f.y, 0, f.x, f.y, size);
        if (u < 0.28) {
          g.addColorStop(0, `rgba(255,244,206,${a})`);
          g.addColorStop(0.4, `rgba(255,178,72,${a * 0.75})`);
        } else if (u < 0.62) {
          g.addColorStop(0, `rgba(255,169,64,${a * 0.9})`);
          g.addColorStop(0.4, `rgba(232,85,43,${a * 0.6})`);
        } else {
          g.addColorStop(0, `rgba(214,74,34,${a * 0.7})`);
          g.addColorStop(0.4, `rgba(148,55,26,${a * 0.4})`);
        }
        g.addColorStop(1, "rgba(120,44,20,0)");
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(f.x, f.y, size, 0, Math.PI * 2);
        ctx!.fill();
      }

      // 5) 불티 — 켜졌다 사그라들며 위로 흩어진다. 높이 오를수록 옅어진다.
      for (const e of embers) {
        const u = e.life / e.max;
        const fade = Math.min(1, u * 7) * Math.min(1, (1 - u) * 3.4);
        const high = 1 - Math.min(1, (ground - e.y) / 340) * 0.55;
        const a = fade * high * 0.8 * (0.7 + 0.5 * nightness);
        if (a <= 0.01) continue;
        ctx!.fillStyle = `rgba(255,${Math.round(146 + 74 * (1 - u))},92,${a})`;
        ctx!.beginPath();
        ctx!.arc(e.x, e.y, e.r * (1 - u * 0.35), 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.restore();
    }

    function drawBank() {
      // 강둑 — 거의 검게 가라앉은 근경
      ctx!.beginPath();
      ctx!.moveTo(0, bankTop(0));
      for (let x = 8; x <= w; x += 8) ctx!.lineTo(x, bankTop(x));
      ctx!.lineTo(w, h);
      ctx!.lineTo(0, h);
      ctx!.closePath();
      const g = ctx!.createLinearGradient(0, ground - 6, 0, h);
      g.addColorStop(0, "#0e1712");
      g.addColorStop(1, "#070c0a");
      ctx!.fillStyle = g;
      ctx!.fill();

      // 쌓인 눈 — 얇게, 고르지 않게. 밤에는 달빛만 받으므로 흰색을 낮춘다.
      let any = false;
      for (let i = 0; i < pile.length; i++) {
        if (pile[i] > 0.4) {
          any = true;
          break;
        }
      }
      if (!any) return;
      const bw = w / pile.length;
      ctx!.beginPath();
      ctx!.moveTo(0, bankTop(0) + 1);
      for (let i = 0; i < pile.length; i++) {
        const x = i * bw + bw / 2;
        ctx!.lineTo(x, bankTop(x) - pile[i]);
      }
      ctx!.lineTo(w, bankTop(w) + 1);
      ctx!.lineTo(w, bankTop(w) + 9);
      ctx!.lineTo(0, bankTop(0) + 9);
      ctx!.closePath();
      const night = sky.stars;
      const snowTop = ctx!.createLinearGradient(0, ground - 14, 0, ground + 9);
      snowTop.addColorStop(0, night > 0.5 ? "#c2d0da" : "#e9f1f5");
      snowTop.addColorStop(1, night > 0.5 ? "#5b6b75" : "#8fa1ac");
      ctx!.globalAlpha = 0.82;
      ctx!.fillStyle = snowTop;
      ctx!.fill();
      ctx!.globalAlpha = 1;
    }

    function drawSky() {
      const g = ctx!.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, sky.top);
      g.addColorStop(0.55, sky.mid);
      g.addColorStop(1, sky.bottom);
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, w, h);
    }

    function drawStars(t: number) {
      if (sky.stars < 0.03) return;
      for (const s of stars) {
        const tw = 0.62 + 0.38 * Math.sin(t * 0.9 + s.seed);
        ctx!.fillStyle = `rgba(226,235,240,${sky.stars * tw * 0.85})`;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function drawFallers() {
      for (const p of fallers) {
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rot);
        ctx!.globalAlpha = 0.82;
        ctx!.fillStyle = p.color;
        if (p.petal) {
          ctx!.beginPath();
          ctx!.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
          ctx!.fill();
        } else {
          // 잎 — 뾰족한 마름모
          ctx!.beginPath();
          ctx!.moveTo(-p.size, 0);
          ctx!.lineTo(0, -p.size * 0.5);
          ctx!.lineTo(p.size, 0);
          ctx!.lineTo(0, p.size * 0.5);
          ctx!.closePath();
          ctx!.fill();
        }
        ctx!.restore();
      }
      ctx!.globalAlpha = 1;
    }

    function drawFlies(t: number) {
      ctx!.save();
      ctx!.globalCompositeOperation = "lighter";
      for (const f of flies) {
        // 천천히 켜졌다 사그라드는 리듬(약 9초 주기). 빠르게 깜빡이면 눈이 피로하다.
        const pulse = Math.max(0, Math.sin(t * 0.7 + f.seed) ** 3);
        if (pulse < 0.02) continue;
        const g = ctx!.createRadialGradient(f.x, f.y, 0, f.x, f.y, 9);
        g.addColorStop(0, `rgba(226,244,150,${0.85 * pulse})`);
        g.addColorStop(0.35, `rgba(168,212,86,${0.35 * pulse})`);
        g.addColorStop(1, "rgba(120,170,60,0)");
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(f.x, f.y, 9, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.restore();
    }

    function drawRain() {
      ctx!.lineCap = "round";
      // 기울기는 바탕 바람만 반영한다(포인터 무관 — 위 update 주석 참조)
      const slant = 2.2;
      for (const d of drops) {
        ctx!.strokeStyle = `rgba(198,220,230,${d.a})`;
        ctx!.lineWidth = 1.05;
        ctx!.beginPath();
        ctx!.moveTo(d.x, d.y);
        ctx!.lineTo(d.x - slant, d.y + d.len);
        ctx!.stroke();
      }
      for (const s of splashes) {
        const a = 1 - s.life / 0.4;
        if (a <= 0) continue;
        ctx!.strokeStyle = `rgba(200,222,232,${a * 0.4})`;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, (1 - a) * 7 + 1, Math.PI * 1.15, Math.PI * 1.85);
        ctx!.stroke();
      }
    }

    function drawSnow() {
      for (const f of flakes) {
        ctx!.fillStyle = `rgba(233,241,245,${f.a})`;
        ctx!.beginPath();
        ctx!.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    // ── 갱신 ────────────────────────────────────────────────────
    function update(dt: number, t: number) {
      const wx = weatherRef.current;
      /*
       * 감쇠는 **시간 기준**으로 계산한다.
       * `v *= 0.96` 처럼 프레임마다 곱하면 144Hz 화면에서는 60Hz보다 2배 넘게
       * 감쇠돼, 같은 코드가 모니터에 따라 다르게 움직인다(실제로 불티가 안 퍼졌다).
       */
      const decay = (perFrameAt60: number) => Math.pow(perFrameAt60, dt * 60);
      // 바탕 바람 — 포인터가 없어도 불은 늘 조금씩 눕는다
      const breeze = Math.sin(t * 0.23) * 7 + Math.sin(t * 0.07 + 1.3) * 4;

      // 포인터 속도 감쇠
      const pointerDecay = Math.exp(-dt * 3.4);
      pointer.vx *= pointerDecay;
      pointer.vy *= pointerDecay;
      pointer.strength *= Math.exp(-dt * 2.2);

      // ── 불꽃
      /*
       * 불기둥은 **통째로 눕는다.** 알갱이 하나하나를 미는 것만으로는
       * 축으로 모이는 힘에 상쇄돼 아무 일도 안 일어난 것처럼 보인다.
       * 그래서 기울기(bend)를 먼저 구하고, 알갱이는 '기울어진 축'을 향해 모이게 한다.
       * 아래는 붙박이고 위로 갈수록 크게 눕는다 — 실제 불이 그렇다.
       */
      let bendTarget = breeze * 1.1;
      if (pointer.active) {
        const dx = fireX - pointer.x;
        const dy = ground - 42 - pointer.y;
        const d = Math.hypot(dx, dy);
        const R = 300;
        if (d < R) {
          const near = (1 - d / R) ** 1.3;
          // 손 반대쪽으로 눕고, 손이 지나간 방향으로 한 번 훅 밀린다
          bendTarget += Math.sign(dx) * near * 78 - pointer.vx * 0.07 * near;
        }
      }
      bend += (bendTarget - bend) * Math.min(1, dt * 5);

      const wantFlames = Math.round(64 * fireScale);
      while (flames.length < wantFlames) spawnFlame();
      for (let i = flames.length - 1; i >= 0; i--) {
        const f = flames[i];
        f.life += dt;
        if (f.life >= f.max || f.y < ground - 300) {
          flames.splice(i, 1);
          spawnFlame();
          continue;
        }
        // 0(바닥) → 1(꼭대기). 위로 갈수록 바람을 더 타고, 축에 덜 매인다.
        const rise = Math.min(1, (ground - f.y) / 130);
        const axis = fireX + bend * rise;
        const [gx, gy] = gust(f.x, f.y, 190, 110);
        f.vx +=
          (Math.sin(t * 2.6 + f.seed) * 22 + gx) * dt * (0.3 + rise * 1.6) +
          (axis - f.x) * (3 - rise * 2.2) * dt;
        f.vy += (-30 + gy * 0.4) * dt;
        f.vx *= decay(0.96);
        f.x += f.vx * dt;
        f.y += f.vy * dt;
      }

      // ── 불티: 화면 아래 가운데 1/4 을 떠다니는 무리로 유지한다
      const wantEmbers = Math.round(26 * fireScale + pointer.strength * 14);
      if (embers.length < wantEmbers && Math.random() < 14 * dt)
        spawnEmber(pointer.strength);
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.life += dt;
        if (e.life >= e.max) {
          embers.splice(i, 1);
          continue;
        }
        const [gx, gy] = gust(e.x, e.y, 240, 340);
        // 자유분방하게 — 여러 주기를 겹친 흐름을 탄다
        const wander =
          Math.sin(t * 0.8 + e.max * 3) * 13 + Math.sin(t * 0.31 + e.r * 9) * 9;

        /*
         * 옆으로는 '가속'이 아니라 **목표 속도를 좇게** 한다.
         * 가속 모델은 감쇠와 싸우느라 결국 기둥으로 모였다.
         * 가장자리(off=±1)에 가까울수록 제 옆흐름을 잃고 안쪽으로 꺾인다 —
         * 덕분에 허용 범위를 꽉 채우면서도 밖으로는 안 나간다.
         */
        const off = (e.x - fireX) / emberHalfWidth;
        const target =
          e.drift * (1 - Math.min(1, Math.abs(off) ** 4)) - off * 26;
        e.vx += (target - e.vx) * 1.6 * dt;
        e.vx += (breeze * 1.4 + bend * 0.5 + wander + gx) * dt;
        e.vy += (-18 + gy * 0.4) * dt;

        // 위로도 정해진 높이까지만 — 천장에 가까울수록 세게 붙잡는다
        if (e.y < emberTop + 110)
          e.vy += ((emberTop + 110 - e.y) / 110) * 150 * dt;

        e.vx *= decay(0.993);
        e.vy *= decay(0.994);
        e.x += e.vx * dt;
        e.y += e.vy * dt;
      }

      // ── 비
      if (wx.precip === "rain") {
        const target = Math.round((w / 1000) * (60 + 150 * wx.intensity));
        // 한 프레임에 여러 개씩 채워 비가 곧바로 화면을 채우게 한다
        for (let k = 0; k < 3 && drops.length < target; k++)
          spawnDrop(drops.length > target * 0.6);
        for (let i = drops.length - 1; i >= 0; i--) {
          const d = drops[i];
          // 비는 포인터에 반응하지 않는다. 손을 빠르게 움직일 때 빗줄기까지
          // 같이 흔들리면 화면이 어지럽다(2026-07-27 사용자 지적).
          d.x += breeze * 0.6 * dt;
          d.y += d.vy * dt;
          if (d.y > bankTop(d.x)) {
            if (splashes.length < 26 && Math.random() < 0.5)
              splashes.push({ x: d.x, y: bankTop(d.x), life: 0 });
            drops.splice(i, 1);
          }
        }
        for (let i = splashes.length - 1; i >= 0; i--) {
          splashes[i].life += dt;
          if (splashes[i].life > 0.4) splashes.splice(i, 1);
        }
      } else if (drops.length) {
        drops.length = 0;
        splashes.length = 0;
      }

      // ── 눈
      if (wx.precip === "snow") {
        const target = Math.round((w / 1000) * (50 + 90 * wx.intensity));
        for (let k = 0; k < 2 && flakes.length < target; k++)
          spawnFlake(flakes.length > target * 0.6);
        for (let i = flakes.length - 1; i >= 0; i--) {
          const f = flakes[i];
          // 눈은 천천히 내리므로 손을 따라가도 어지럽지 않다. 다만 속도 성분은 낮춘다.
          const [gx, gy] = gust(f.x, f.y, 150, 160, 0.4);
          f.x +=
            (f.vx + Math.sin(t * 0.9 + f.seed) * 12 + breeze * 0.8 + gx) * dt;
          f.y += (f.vy + gy * 0.3) * dt;
          if (f.y > bankTop(f.x)) {
            // 둑에 쌓인다
            const bi = Math.max(
              0,
              Math.min(pile.length - 1, Math.floor((f.x / w) * pile.length))
            );
            const cap = 9;
            pile[bi] = Math.min(cap, pile[bi] + 0.14);
            if (bi > 0) pile[bi - 1] = Math.min(cap, pile[bi - 1] + 0.05);
            if (bi < pile.length - 1)
              pile[bi + 1] = Math.min(cap, pile[bi + 1] + 0.05);
            flakes.splice(i, 1);
          } else if (f.x < -40 || f.x > w + 40) {
            flakes.splice(i, 1);
          }
        }
      } else if (flakes.length) {
        flakes.length = 0;
      }

      // 겨울이 아니면 쌓인 눈은 녹는다
      if (season !== "winter" && wx.precip !== "snow") {
        for (let i = 0; i < pile.length; i++) {
          if (pile[i] > 0) pile[i] = Math.max(0, pile[i] - dt * 1.1);
        }
      }

      // ── 계절 입자(강수가 없을 때만 — 비 오는데 꽃잎까지 날리면 거짓말이다)
      const calm = wx.precip === "none";
      if (calm && (season === "spring" || season === "autumn")) {
        const target = Math.round((w / 1000) * 13);
        if (fallers.length < target && Math.random() < 1.6 * dt) spawnFaller();
      } else if (fallers.length && !calm) {
        fallers.length = 0;
      }
      for (let i = fallers.length - 1; i >= 0; i--) {
        const p = fallers[i];
        const [gx, gy] = gust(p.x, p.y, 160, 200, 0.6);
        p.vx += (Math.sin(t * 1.4 + p.rot) * 10 + breeze * 0.7 + gx) * dt;
        p.vy += (10 + gy * 0.3) * dt;
        p.vx *= decay(0.97);
        p.vy = Math.min(p.vy, 70);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        if (p.y > bankTop(p.x) - 2 || p.x < -30 || p.x > w + 30)
          fallers.splice(i, 1);
      }

      // ── 반딧불(여름 밤·해질녘에만)
      const fireflyTime = season === "summer" && sky.stars > 0.25 && calm;
      if (fireflyTime) {
        const target = Math.round((w / 1000) * 15);
        while (flies.length < target) spawnFly();
      } else if (flies.length) {
        flies.length = 0;
      }
      for (const f of flies) {
        // 손이 다가오면 달아난다(양수 = 밀어냄). 다만 손 속도에는 거의 안 휩쓸린다 —
        // 반딧불은 바람에 날리는 게 아니라 스스로 피하는 것이다.
        const [gx, gy] = gust(f.x, f.y, 210, 560, 0.15);
        f.vx += (Math.sin(t * 0.6 + f.seed) * 9 + gx) * dt;
        f.vy += (Math.cos(t * 0.47 + f.seed * 1.7) * 7 + gy) * dt;
        // 감쇠를 약하게 — 너무 세면 달아나려다 제자리에 멈춘다
        f.vx *= decay(0.98);
        f.vy *= decay(0.98);
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        if (f.x < 10) f.vx += 30 * dt;
        if (f.x > w - 10) f.vx -= 30 * dt;
        if (f.y < ground - h * 0.42) f.vy += 26 * dt;
        if (f.y > ground - 14) f.vy -= 30 * dt;
      }
    }

    function render(t: number) {
      drawSky();
      drawStars(t);
      if (backdrop) ctx!.drawImage(backdrop, 0, 0, w, h);
      drawFallers();
      drawBank();
      drawFire(t, sky.stars, bend);
      drawFlies(t);
      if (weatherRef.current.precip === "rain") drawRain();
      if (weatherRef.current.precip === "snow") drawSnow();
    }

    // ── 루프 ────────────────────────────────────────────────────
    let raf = 0;
    let last = 0;
    let clock = 0;
    let running = false;
    let visible = true;
    let onScreen = true;

    function frame(now: number) {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      clock += dt;

      skyAge += dt;
      if (skyAge > 30) {
        skyAge = 0;
        when = resolveWhen(new Date(), override);
        if (when.season !== season) {
          season = when.season;
          layout(); // 계절이 바뀌면 가지도 다시 그려야 한다
        }
        sky = skyFor(when, weatherRef.current);
      }

      update(dt, clock);
      render(clock);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }
    function sync() {
      if (visible && onScreen) start();
      else stop();
    }

    // ── 이벤트 ──────────────────────────────────────────────────
    const onPointer = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < -60 || y < -60 || x > w + 60 || y > h + 60) {
        pointer.active = false;
        return;
      }
      if (pointer.active) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        pointer.vx = pointer.vx * 0.6 + dx * 7;
        pointer.vy = pointer.vy * 0.6 + dy * 7;
        pointer.strength = Math.min(
          1,
          pointer.strength + Math.hypot(dx, dy) / 90
        );
      }
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      sync();
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    // 창 밖으로 커서가 나가는 경우(히어로가 화면 가장자리에 닿아 있어 경계검사로는 못 잡는다)
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? true;
        sync();
      },
      { threshold: 0 }
    );
    io.observe(host);

    const ro = new ResizeObserver(() => {
      layout();
      if (reduceMotion) render(1.5);
    });
    ro.observe(host);

    // 날씨 응답이 도착하면(루프 시작 뒤일 수 있다) 하늘을 즉시 반영한다
    refreshRef.current = () => {
      sky = skyFor(when, weatherRef.current);
      if (reduceMotion) {
        for (let i = 0; i < 60; i++) update(1 / 60, i / 60);
        render(1.5);
      }
    };

    // 첫 그림
    layout();
    if (reduceMotion) {
      // 정지 화면이라도 불은 자연스러워야 하니 잠깐 미리 굴려 둔다
      for (let i = 0; i < 90; i++) update(1 / 60, i / 60);
      render(1.5);
    } else {
      for (let i = 0; i < 45; i++) update(1 / 60, i / 60);
      sync();
    }
    setReady(true);

    return () => {
      stop();
      refreshRef.current = null;
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-700 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      />
      {/*
        배경이 왜 저러는지 알려 주는 한 줄. 비·눈일 때만 나온다 —
        "지금 실제로 그렇다"는 사실을 말하는 것이지 장식이 아니다.
      */}
      {weather.label && (
        <span className="pointer-events-none absolute right-4 top-4 z-10 text-xs font-medium text-white/55">
          {weather.label}
        </span>
      )}
    </>
  );
}
