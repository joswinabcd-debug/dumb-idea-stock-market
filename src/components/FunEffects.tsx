"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

/* ──────────────────────────────────────────────────────────────────────────
   FunEffects
   ─ Neon light-painting canvas trail  (screen blend, multi-colour HSL glow)
   ─ Fintech crosshair cursor with lagging diamond
   ─ Ambient radial glow
   ─ Route-change amber progress bar
   ─ Scroll-progress ruler (right edge)
   ─ Auto-tile: injects .tile/.stat-tile on all card panels, every page
────────────────────────────────────────────────────────────────────────── */

const RING_EASE = 0.08;

export default function FunEffects() {
  const pathname = usePathname();

  /* ── Neon canvas ── */
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const neonHue    = useRef(0);
  const neonLast   = useRef<{ x: number; y: number } | null>(null);
  const neonFadRaf = useRef<number | null>(null);

  /* ── Cursor ring (lagging) ── */
  const targetRef = useRef({ x: -400, y: -400 });
  const ringRef   = useRef({ x: -400, y: -400 });
  const rafId     = useRef<number | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: -400, y: -400 });
  const [ringPos,   setRingPos]   = useState({ x: -400, y: -400 });
  const [isPressed, setIsPressed] = useState(false);

  /* ── Scroll ── */
  const lastScrollY = useRef(0);
  const [scrollPct,   setScrollPct]   = useState(0);
  const [scrollFlash, setScrollFlash] = useState(false);

  /* ── Route-change bar ── */
  const prevPath     = useRef<string | null>(null);
  const [loadPct,     setLoadPct]     = useState(0);
  const [loadVisible, setLoadVisible] = useState(false);

  /* ── Splash ── */
  const [splashDone, setSplashDone] = useState(false);

  /* ════════════════════════════════════════════════════════════════════════
     SPLASH
  ════════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 1800);
    return () => clearTimeout(t);
  }, []);

  /* ════════════════════════════════════════════════════════════════════════
     ROUTE-CHANGE PROGRESS BAR
  ════════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (prevPath.current === null) { prevPath.current = pathname; return; }
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;
    setLoadPct(0); setLoadVisible(true);
    let p = 0;
    const iv = setInterval(() => { p += Math.random() * 15 + 5; if (p >= 92) p = 92; setLoadPct(p); }, 100);
    const fin = setTimeout(() => { clearInterval(iv); setLoadPct(100); setTimeout(() => setLoadVisible(false), 350); }, 650);
    return () => { clearInterval(iv); clearTimeout(fin); };
  }, [pathname]);

  /* ════════════════════════════════════════════════════════════════════════
     AUTO-TILE — scan DOM, inject .tile / .stat-tile on all card panels
     Runs on every route change so new pages get picked up instantly.
  ════════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const apply = () => {
      // Major rounded panels (p-4/5/6 signals a content card, not a button)
      document.querySelectorAll<HTMLElement>(
        "main div.rounded-3xl, main article.rounded-3xl, main div.rounded-2xl"
      ).forEach(el => {
        if (el.dataset.tileMark) return;              // already processed
        if (["BUTTON", "A", "FORM"].includes(el.tagName)) return;
        const c = el.className;

        if (el.classList.contains("rounded-3xl")) {
          // Large card: needs padding to qualify
          if (c.includes("p-4") || c.includes("p-5") || c.includes("p-6") || c.includes("space-y-")) {
            el.classList.add("tile");
            el.dataset.tileMark = "1";
          }
        } else {
          // Smaller rounded-2xl: qualify by bg + border + padding
          if (c.includes("border") && (c.includes("p-2") || c.includes("p-3") || c.includes("p-3.5")) &&
              (c.includes("bg-neutral-950") || c.includes("bg-neutral-900"))) {
            el.classList.add("stat-tile");
            el.dataset.tileMark = "1";
          }
        }
      });
    };

    // Slight delay so the page DOM is fully painted before we scan
    const t = setTimeout(apply, 120);
    return () => clearTimeout(t);
  }, [pathname]);

  /* ════════════════════════════════════════════════════════════════════════
     NEON CANVAS TRAIL
     Technique: canvas filled black + mixBlendMode:screen on the element.
     Black pixels are transparent in screen mode → neon glows float over UI.
  ════════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      // Fill black so screen blend shows nothing initially
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    /* Draw a 4-layer neon stroke */
    const drawNeon = (x1: number, y1: number, x2: number, y2: number) => {
      const h     = neonHue.current;
      const col   = `hsl(${h},100%,55%)`;
      const bright = `hsl(${h},100%,85%)`;

      ctx.lineCap  = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "source-over";

      // Layer 1 — outer bloom
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = col; ctx.lineWidth = 32;
      ctx.globalAlpha = 0.032; ctx.shadowBlur = 80; ctx.shadowColor = col;
      ctx.stroke();

      // Layer 2 — mid glow
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.lineWidth = 14; ctx.globalAlpha = 0.09; ctx.shadowBlur = 35;
      ctx.stroke();

      // Layer 3 — inner tube
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = bright; ctx.lineWidth = 4;
      ctx.globalAlpha = 0.55; ctx.shadowBlur = 18; ctx.shadowColor = bright;
      ctx.stroke();

      // Layer 4 — white-hot core
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 1.2;
      ctx.globalAlpha = 1; ctx.shadowBlur = 10; ctx.shadowColor = col;
      ctx.stroke();

      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;

      neonHue.current = (h + 0.9) % 360;
    };

    /* Slow fade each frame — adds rgba black → colours approach black → transparent in screen */
    const fade = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(0,0,0,0.016)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      neonFadRaf.current = requestAnimationFrame(fade);
    };
    neonFadRaf.current = requestAnimationFrame(fade);

    const onMove = (e: MouseEvent) => {
      const last = neonLast.current;
      if (last) drawNeon(last.x, last.y, e.clientX, e.clientY);
      neonLast.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      if (neonFadRaf.current) cancelAnimationFrame(neonFadRaf.current);
    };
  }, []);

  /* ════════════════════════════════════════════════════════════════════════
     CURSOR RING RAF
  ════════════════════════════════════════════════════════════════════════ */
  const loop = useCallback(() => {
    const tick = () => {
      const t = targetRef.current, r = ringRef.current;
      r.x += (t.x - r.x) * RING_EASE;
      r.y += (t.y - r.y) * RING_EASE;
      setRingPos({ x: r.x, y: r.y });
      rafId.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  useEffect(() => {
    rafId.current = requestAnimationFrame(loop);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [loop]);

  /* ════════════════════════════════════════════════════════════════════════
     MOUSE EVENTS
  ════════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const mv = (e: MouseEvent) => { targetRef.current = { x: e.clientX, y: e.clientY }; setCursorPos({ x: e.clientX, y: e.clientY }); };
    const md = () => setIsPressed(true);
    const mu = () => setIsPressed(false);
    window.addEventListener("mousemove", mv);
    window.addEventListener("mousedown", md);
    window.addEventListener("mouseup",   mu);
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mousedown", md); window.removeEventListener("mouseup", mu); };
  }, []);

  /* ════════════════════════════════════════════════════════════════════════
     SCROLL
  ════════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(max > 0 ? (y / max) * 100 : 0);
      const vel = Math.abs(y - lastScrollY.current);
      lastScrollY.current = y;
      if (vel > 25) {
        setScrollFlash(true);
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => setScrollFlash(false), 300);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── Neon trail canvas ── */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed", inset: 0,
          zIndex: 9982,
          pointerEvents: "none",
          mixBlendMode: "screen",   // black = transparent, colours glow through
        }}
      />

      {/* ── Splash ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "#09090b",
        opacity: splashDone ? 0 : 1,
        pointerEvents: splashDone ? "none" : "all",
        transition: "opacity 0.6s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ width: 48, height: 1, background: "linear-gradient(90deg,transparent,#f59e0b,transparent)", marginBottom: 24, animation: "ruleExpand 0.8s 0.1s ease-out forwards" }} />
        <div style={{ fontFamily: "var(--font-geist-sans,system-ui)", fontSize: 13, fontWeight: 600, letterSpacing: "0.35em", color: "#71717a", textTransform: "uppercase", animation: "wordmarkIn 0.7s 0.3s ease-out both" }}>
          Dumb Idea Exchange
        </div>
        <div style={{ marginTop: 12, fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", color: "#3f3f46", textTransform: "uppercase", animation: "wordmarkIn 0.7s 0.55s ease-out both" }}>
          Initialising market data
        </div>
        <div style={{ marginTop: 32, height: 1, width: 160, background: "#27272a", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,#f59e0b,#fb923c)", animation: "loadLine 1.4s 0.2s ease-in-out forwards", transformOrigin: "left" }} />
        </div>
      </div>

      {/* ── Route-change progress bar ── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9998, height: 2, pointerEvents: "none", opacity: loadVisible ? 1 : 0, transition: "opacity 0.25s ease" }}>
        <div style={{ height: "100%", width: `${loadPct}%`, background: "linear-gradient(90deg,#f59e0b,#fb923c,#f59e0b)", transition: "width 0.1s linear", boxShadow: "0 0 8px rgba(245,158,11,0.7)" }} />
      </div>

      {/* ── Scroll progress ruler ── */}
      <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 3, zIndex: 9990, pointerEvents: "none", background: "rgba(39,39,42,0.35)" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: `${scrollPct}%`, background: scrollFlash ? "rgba(245,158,11,0.9)" : "rgba(245,158,11,0.45)", transition: "height 0.06s linear, background 0.15s ease", boxShadow: scrollFlash ? "0 0 12px rgba(245,158,11,0.8)" : "0 0 4px rgba(245,158,11,0.25)" }} />
        <div style={{ position: "absolute", top: `${scrollPct}%`, left: "50%", transform: "translate(-50%,-50%)", width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 8px rgba(245,158,11,0.8)", transition: "top 0.06s linear" }} />
      </div>

      {/* ── Ambient glow under cursor ── */}
      <div style={{ position: "fixed", zIndex: 9980, pointerEvents: "none", left: cursorPos.x, top: cursorPos.y, width: 300, height: 300, transform: "translate(-50%,-50%)", background: "radial-gradient(circle,rgba(245,158,11,0.045) 0%,transparent 70%)", borderRadius: "50%", mixBlendMode: "screen" }} />

      {/* ── Crosshair: lagging outer diamond ── */}
      <div style={{
        position: "fixed", zIndex: 9992, pointerEvents: "none",
        left: ringPos.x, top: ringPos.y,
        width:  isPressed ? 18 : 28,
        height: isPressed ? 18 : 28,
        border: `1px solid rgba(245,158,11,${isPressed ? 0.95 : 0.42})`,
        transform: `translate(-50%,-50%) rotate(${isPressed ? 0 : 45}deg)`,
        transition: "width 0.14s ease, height 0.14s ease, transform 0.14s ease, border-color 0.1s ease",
        willChange: "left, top",
      }} />

      {/* ── Crosshair: center dot + 4 tick lines ── */}
      <div style={{ position: "fixed", zIndex: 9994, pointerEvents: "none", left: cursorPos.x, top: cursorPos.y, transform: "translate(-50%,-50%)", width: 0, height: 0, willChange: "left, top" }}>
        {/* dot */}
        <div style={{ position: "absolute", width: isPressed ? 3 : 4, height: isPressed ? 3 : 4, borderRadius: "50%", background: "#f59e0b", transform: "translate(-50%,-50%)", boxShadow: "0 0 6px rgba(245,158,11,1)", transition: "width 0.08s, height 0.08s" }} />
        {/* top */}
        <div style={{ position: "absolute", width: 1, height: 7, background: "rgba(245,158,11,0.7)", top: -15, left: -0.5 }} />
        {/* bottom */}
        <div style={{ position: "absolute", width: 1, height: 7, background: "rgba(245,158,11,0.7)", top: 8, left: -0.5 }} />
        {/* left */}
        <div style={{ position: "absolute", width: 7, height: 1, background: "rgba(245,158,11,0.7)", top: -0.5, left: -15 }} />
        {/* right */}
        <div style={{ position: "absolute", width: 7, height: 1, background: "rgba(245,158,11,0.7)", top: -0.5, left: 8 }} />
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes ruleExpand  { from { opacity:0; width:0 }     to { opacity:1; width:48px } }
        @keyframes wordmarkIn  { from { opacity:0; letter-spacing:0.55em } to { opacity:1; letter-spacing:0.35em } }
        @keyframes loadLine    { from { transform:scaleX(0) }    to { transform:scaleX(1) } }
        * { cursor: none !important; }
      `}</style>
    </>
  );
}
