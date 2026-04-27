"use client";

import { useState , useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginWithOtp, loginWithPassword } from "@/features/auth/api";
import { normalizeError } from "@/lib/error";

type LoginMode = "password" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("password");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const header = document.querySelector("header") as HTMLElement | null;
    const footer = document.querySelector("footer") as HTMLElement | null;
    const fabCart = document.querySelector('a[aria-label="Open cart"]') as HTMLElement | null;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHeaderDisplay = header?.style.display ?? "";
    const prevFooterDisplay = footer?.style.display ?? "";
    const prevFabDisplay = fabCart?.style.display ?? "";

    if (header) header.style.display = "none";
    if (footer) footer.style.display = "none";
    if (fabCart) fabCart.style.display = "none";
    document.body.style.overflow = "hidden";

    return () => {
      if (header) header.style.display = prevHeaderDisplay;
      if (footer) footer.style.display = prevFooterDisplay;
      if (fabCart) fabCart.style.display = prevFabDisplay;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "password") {
        await loginWithPassword({ phone, password });
      } else {
        await loginWithOtp({ phone, otp });
      }
      router.push("/products");
      router.refresh();
    } catch (err) {
      setError(normalizeError(err, "Login failed").message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 h-dvh w-screen overflow-hidden font-[Plus_Jakarta_Sans,sans-serif]">
      {/* ── Background gradient ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f4f4f8] from-[38%] via-[#3b7fff] via-[60%] to-[#1a56db]" />

      {/* ── Soft radial orb ── */}
      <div
        className="absolute left-1/2 top-[36%] -translate-x-1/2 h-[340px] w-[340px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(99,150,255,0.5) 0%, transparent 70%)",
          filter: "blur(36px)",
        }}
      />

      {/* ── Scrolling words ── */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-md mx-auto px-6 pt-16 pb-10">
        <WordScroll />

        {/* ── Bottom section ── */}
        <div className="mt-auto">
          <h1 className="mb-2 text-[42px] leading-tight font-bold text-[#111] sm:text-[46px]">
            Water booking,<br />made simple
          </h1>
          <p className="mb-6 text-[14px] leading-relaxed text-white/75">
            Sign in to book water cans, choose your delivery slot, manage deposits,
            and track every order in one place.
          </p>

          {/* ── Card ── */}
          <div
            className="rounded-[20px] p-5 "
          
          >
            {/* Mode tabs */}
            <div className="flex rounded-xl p-[3px] mb-4" style={{ background: "rgba(0,0,0,0.18)" }}>
              {(["password", "otp"] as LoginMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`
                    flex-1 py-2 rounded-[10px] text-[12px] font-medium capitalize
                    transition-all duration-200
                    ${mode === m ? "bg-white text-[#111]" : "text-white/55"}
                  `}
                >
                  {m === "otp" ? "OTP" : "Password"}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="space-y-2.5">
              <input
                className="
                  w-full rounded-xl px-4 py-3 text-[13px] text-white
                  placeholder:text-white/45 outline-none border border-white/20
                  focus:border-white/50 transition-colors
                "
                style={{ background: "rgba(255,255,255,0.11)" }}
                placeholder="Phone number"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              {mode === "password" ? (
                <input
                  className="
                    w-full rounded-xl px-4 py-3 text-[13px] text-white
                    placeholder:text-white/45 outline-none border border-white/20
                    focus:border-white/50 transition-colors
                  "
                  style={{ background: "rgba(255,255,255,0.11)" }}
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              ) : (
                <input
                  className="
                    w-full rounded-xl px-4 py-3 text-[13px] text-white
                    placeholder:text-white/45 outline-none border border-white/20
                    focus:border-white/50 transition-colors tracking-[6px]
                  "
                  style={{ background: "rgba(255,255,255,0.11)" }}
                  placeholder="OTP"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              )}

              {error && (
                <p className="text-[12px] text-red-300 px-1">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full bg-white text-[#111] rounded-[14px] py-3.5
                  text-[14px] font-semibold transition-opacity
                  disabled:opacity-60 hover:opacity-90 active:scale-[0.98]
                "
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="text-center text-[11px] text-white/40 my-3">or</div>

            <Link
              href="/auth/register"
              className="
                flex items-center justify-center w-full rounded-[14px] py-3.5
                text-[13px] font-medium text-white/80 border border-white/20
                transition-colors hover:bg-white/10
              "
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              Create new account
            </Link>
          </div>

          <p className="text-center text-[11px] text-white/45 mt-4">
            Forgot password?{" "}
            <Link href="/auth/forgot-password" className="text-white/80 font-medium underline underline-offset-2">
              Reset here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Animated word scroller ────────────────────────────────────────────────────
const WORDS = ["Purity", "Hydration", "Delivery"];
const WORD_ICONS = [
  {
    bg: "bg-gradient-to-br from-cyan-500 to-sky-400",
    svg: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 1.2C6 1.2 2.5 5 2.5 7.2A3.5 3.5 0 0 0 6 10.7A3.5 3.5 0 0 0 9.5 7.2C9.5 5 6 1.2 6 1.2Z" fill="white" fillOpacity="0.9" />
      </svg>
    ),
  },
  {
    bg: "bg-gradient-to-br from-blue-600 to-indigo-500",
    svg: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6.4C3.4 4.7 4.7 3.8 6 3.8C7.3 3.8 8.6 4.7 10 6.4" stroke="white" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M3.2 7.6C4.2 6.5 5.1 5.9 6 5.9C6.9 5.9 7.8 6.5 8.8 7.6" stroke="white" strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="6" cy="8.8" r="1" fill="white" />
      </svg>
    ),
  },
  {
    bg: "bg-gradient-to-br from-violet-600 to-purple-400",
    svg: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="1.2" y="4" width="9.6" height="5.8" rx="1.1" fill="white" fillOpacity="0.92" />
        <path d="M3.4 4V3.2A1.6 1.6 0 0 1 5 1.6H7A1.6 1.6 0 0 1 8.6 3.2V4" stroke="white" strokeWidth="0.9" strokeOpacity="0.7" />
      </svg>
    ),
  },
];

function WordScroll() {
  const [active, setActive] = useState(1);

  useEffect(() => {
    const t = setInterval(() => {
      setActive((prev) => (prev + 1) % WORDS.length);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative h-[68px] overflow-hidden mb-1 select-none">
      {WORDS.map((word, i) => {
        const offset = ((i - active + WORDS.length) % WORDS.length);
        const isActive = offset === 0;
        const isAbove  = offset === WORDS.length - 1;

        return (
          <div
            key={word}
            className="absolute left-0 flex items-center gap-2 transition-all duration-500"
            style={{
              transform: isActive ? "translateY(10px)" : isAbove ? "translateY(-28px)" : "translateY(52px)",
              opacity: isActive ? 1 : 0,
              fontSize: isActive ? "30px" : "26px",
              fontWeight: isActive ? 700 : 300,
              color: isActive ? "#111" : "rgba(0,0,0,0.2)",
            }}
          >
            {isActive && (
              <span className={`inline-flex items-center justify-center w-[30px] h-[20px] rounded-[6px] ${WORD_ICONS[i]?.bg}`}>
                {WORD_ICONS[i]?.svg}
              </span>
            )}
            {word}
          </div>
        );
      })}
    </div>
  );
}