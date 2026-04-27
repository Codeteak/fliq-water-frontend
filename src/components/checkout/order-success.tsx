"use client";

import { useEffect, useRef, type RefObject } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ConfettiPiece {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  speed: number;
  angle: number;
  spin: number;
  sway: number;
  swayX: number;
  swaySpeed: number;
  delay: number;
  dead: boolean;
}

function useConfetti(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = [
      "#FF595E",
      "#FF924C",
      "#FFCA3A",
      "#8AC926",
      "#1982C4",
      "#6A4C93",
      "#F72585",
      "#4CC9F0",
      "#F4A261",
      "#2EC4B6",
    ];
    const randomColor = () => colors[Math.floor(Math.random() * colors.length)] || "#1982C4";
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const pieces: ConfettiPiece[] = Array.from({ length: 140 }, () => ({
      x: rand(0, canvas.width),
      y: rand(-200, -10),
      w: rand(6, 11),
      h: rand(10, 18),
      color: randomColor(),
      speed: rand(2.5, 5.5),
      angle: rand(0, Math.PI * 2),
      spin: rand(-0.08, 0.08),
      sway: rand(-0.5, 0.5),
      swayX: rand(0, Math.PI * 2),
      swaySpeed: rand(0.02, 0.05),
      delay: rand(0, 120),
      dead: false,
    }));

    let frame = 0;
    let raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      let alive = 0;

      for (const p of pieces) {
        if (frame < p.delay) continue;
        p.y += p.speed;
        p.angle += p.spin;
        p.swayX += p.swaySpeed;
        p.x += Math.sin(p.swayX) * p.sway * 2;
        if (p.y > canvas.height + 20) {
          p.dead = true;
          continue;
        }
        alive++;

        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - (p.y / canvas.height) * 0.6);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.rect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.fill();
        ctx.restore();
      }

      if (alive > 0 || frame < 200) raf = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const timer = window.setTimeout(() => {
      raf = requestAnimationFrame(draw);
    }, 200);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}

interface OrderSuccessProps {
  status: string;
}

export function OrderSuccess({ status }: OrderSuccessProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useConfetti(canvasRef);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 999,
          width: "100%",
          height: "100%",
        }}
      />

      <div className="chk-root">
        <div className="chk-card">
          <span className="chk-corner tl" />
          <span className="chk-corner tr" />
          <span className="chk-corner bl" />
          <span className="chk-corner br" />

          <div className="chk-ring-wrap">
            <div className="chk-ring">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <path
                  d="M7 17.5L13.5 24L27 10"
                  stroke="#0d0d0d"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <h1 className="chk-title">Order Placed!</h1>
          <p className="chk-order-id">
            Order <span>#{status}</span> confirmed
          </p>

          <div className="chk-divider" />

          <p className="chk-note">
            You&apos;ll receive updates as your order is prepared and dispatched.
            Thank you for shopping with us.
          </p>

          <div className="chk-steps">
            {[
              { label: "Confirmed", active: true, icon: "✓" },
              { label: "Packing", active: false, icon: "2" },
              { label: "Shipped", active: false, icon: "3" },
              { label: "Delivered", active: false, icon: "4" },
            ].map((step, i) => (
              <div key={i} className={`chk-step${step.active ? " active" : ""}`}>
                <div className="chk-step-dot">{step.icon}</div>
                <div className="chk-step-label">{step.label}</div>
              </div>
            ))}
          </div>

          <Link href="/" className="chk-btn">
            Continue Shopping
            <ArrowRight size={14} strokeWidth={2} />
          </Link>

          <p className="chk-footnote">A confirmation email has been sent to your inbox.</p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap');
        :root {
          --chk-bg: #f9f9f7; --chk-ink: #0d0d0d; --chk-soft: #555;
          --chk-border: rgba(0,0,0,0.1); --chk-white: #ffffff;
        }
        .chk-root {
          font-family: 'DM Sans', sans-serif;
          background: var(--chk-bg); min-height: 100vh;
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .chk-card {
          background: var(--chk-white); border: none; border-radius: 24px;
          padding: 60px 56px 52px; max-width: 440px; width: 90%; text-align: center; position: relative;
          box-shadow: none;
          animation: chkCardIn 0.9s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes chkCardIn { from { opacity: 0; transform: translateY(40px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .chk-corner { position: absolute; width: 5px; height: 5px; border-radius: 50%; background: var(--chk-ink); opacity: 0.18; }
        .chk-corner.tl { top: 20px; left: 20px; } .chk-corner.tr { top: 20px; right: 20px; }
        .chk-corner.bl { bottom: 20px; left: 20px; } .chk-corner.br { bottom: 20px; right: 20px; }
        .chk-ring-wrap { display: flex; align-items: center; justify-content: center; margin-bottom: 36px; }
        .chk-ring {
          width: 96px; height: 96px; border-radius: 50%; border: 1.5px solid var(--chk-ink);
          display: flex; align-items: center; justify-content: center; position: relative;
          animation: chkRingIn 0.7s 0.3s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes chkRingIn { from { opacity: 0; transform: scale(0.5) rotate(-45deg); } to { opacity: 1; transform: scale(1) rotate(0deg); } }
        .chk-ring::before {
          content: ''; position: absolute; inset: -6px; border-radius: 50%;
          border: 1px dashed rgba(0,0,0,0.12); animation: chkSpin 20s linear infinite;
        }
        @keyframes chkSpin { to { transform: rotate(360deg); } }
        .chk-ring svg { animation: chkCheckIn 0.5s 0.7s ease both; }
        @keyframes chkCheckIn { from { opacity: 0; transform: scale(0.4); } to { opacity: 1; transform: scale(1); } }
        .chk-title {
          font-family: 'Cormorant Garamond', serif; font-size: 42px; font-weight: 300;
          letter-spacing: -0.5px; color: var(--chk-ink); line-height: 1.1; margin-bottom: 10px;
          animation: chkFadeUp 0.6s 0.55s ease both;
        }
        .chk-order-id {
          font-size: 12px; font-weight: 500; letter-spacing: 2.5px; text-transform: uppercase;
          color: var(--chk-soft); margin-bottom: 20px; animation: chkFadeUp 0.6s 0.65s ease both;
        }
        .chk-order-id span { color: var(--chk-ink); font-weight: 600; font-variant-numeric: tabular-nums; }
        .chk-divider { width: 40px; height: 1px; background: var(--chk-ink); margin: 0 auto 22px; animation: chkDividerIn 0.5s 0.75s ease both; }
        @keyframes chkDividerIn { from { width: 0; opacity: 0; } to { width: 40px; opacity: 1; } }
        .chk-note {
          font-size: 13.5px; color: var(--chk-soft); line-height: 1.75;
          max-width: 300px; margin: 0 auto 40px; animation: chkFadeUp 0.6s 0.8s ease both;
        }
        .chk-steps { display: flex; justify-content: center; margin-bottom: 40px; animation: chkFadeUp 0.6s 0.9s ease both; }
        .chk-step { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; position: relative; }
        .chk-step:not(:last-child)::after {
          content: ''; position: absolute; top: 13px; left: 50%; width: 100%; height: 1px;
          background: linear-gradient(90deg, var(--chk-ink) 0%, rgba(0,0,0,0.15) 100%);
        }
        .chk-step-dot {
          width: 26px; height: 26px; border-radius: 50%; border: 1.5px solid var(--chk-ink); background: var(--chk-white);
          display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; color: var(--chk-ink); position: relative; z-index: 1;
        }
        .chk-step.active .chk-step-dot { background: var(--chk-ink); color: var(--chk-white); }
        .chk-step-label { font-size: 10px; letter-spacing: 0.5px; color: var(--chk-soft); white-space: nowrap; }
        .chk-step.active .chk-step-label { color: var(--chk-ink); font-weight: 500; }
        .chk-btn {
          display: inline-flex; align-items: center; gap: 8px; background: var(--chk-ink); color: var(--chk-white);
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; letter-spacing: 0.5px;
          padding: 16px 36px; border-radius: 100px; text-decoration: none; position: relative; overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s; animation: chkFadeUp 0.6s 1s ease both;
        }
        .chk-btn::before { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.12); transform: translateX(-100%); transition: transform 0.35s ease; }
        .chk-btn:hover::before { transform: translateX(0); }
        .chk-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.18); }
        .chk-btn:active { transform: translateY(0); }
        .chk-btn svg { transition: transform 0.2s; }
        .chk-btn:hover svg { transform: translateX(3px); }
        .chk-footnote {
          margin-top: 20px; font-size: 11px; color: rgba(0,0,0,0.3); letter-spacing: 0.3px;
          animation: chkFadeUp 0.6s 1.1s ease both;
        }
        @keyframes chkFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}
