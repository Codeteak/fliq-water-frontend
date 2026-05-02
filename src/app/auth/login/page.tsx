"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithOtp, sendLoginOtp } from "@/features/auth/api";
import { normalizeError } from "@/lib/error";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpHint, setOtpHint] = useState("");
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

  const onSendLoginOtp = async () => {
    setError("");
    setOtpHint("");
    setLoading(true);
    try {
      const res = await sendLoginOtp({ phone });
      setOtpSent(true);
      setOtp("");
      setOtpHint(res.message || "Check your SMS for the login code.");
    } catch (err) {
      setError(normalizeError(err, "Could not send OTP").message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!otpSent) {
      setError("Send the OTP to your phone first.");
      return;
    }
    setLoading(true);
    try {
      await loginWithOtp({ phone, otp });
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
      <div className="absolute inset-0 bg-gradient-to-b from-[#f4f4f8] from-[38%] via-[#3b7fff] via-[60%] to-[#1a56db]" />

      <div
        className="absolute left-1/2 top-[36%] -translate-x-1/2 h-[340px] w-[340px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(99,150,255,0.5) 0%, transparent 70%)",
          filter: "blur(36px)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col px-6 pt-16 pb-10">
        <WordScroll />

        <div className="mt-auto">
          <h1 className="mb-2 text-[42px] leading-tight font-bold text-[#111] sm:text-[46px]">
            Water booking,
            <br />
            made simple
          </h1>
          <p className="mb-6 text-[14px] leading-relaxed text-white/75">
            Sign in with your phone number. We&apos;ll text you a one-time code to complete login.
          </p>

          <div className="rounded-[20px] p-5">
            <form onSubmit={onSubmit} className="space-y-2.5">
              <input
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-[13px] text-white outline-none transition-colors placeholder:text-white/45 focus:border-white/50"
                placeholder="Phone number (10 digits)"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              />

              {!otpSent ? (
                <button
                  type="button"
                  onClick={onSendLoginOtp}
                  disabled={loading || phone.length !== 10}
                  className="w-full rounded-[14px] border border-white/20 bg-white/10 py-3.5 text-[13px] font-medium text-white/90 transition-colors hover:bg-white/15 disabled:opacity-50"
                >
                  {loading ? "Sending…" : "Send OTP"}
                </button>
              ) : (
                <>
                  {otpHint ? <p className="px-1 text-[12px] text-white/80">{otpHint}</p> : null}
                  <input
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-[13px] tracking-[6px] text-white outline-none transition-colors placeholder:text-white/45 focus:border-white/50"
                    placeholder="6-digit OTP"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                  <button
                    type="button"
                    onClick={onSendLoginOtp}
                    disabled={loading}
                    className="w-full rounded-[14px] border border-white/20 py-2.5 text-[12px] font-medium text-white/75 transition-colors hover:bg-white/10 disabled:opacity-60"
                  >
                    Resend OTP
                  </button>
                </>
              )}

              {error ? <p className="px-1 text-[12px] text-red-300">{error}</p> : null}

              <button
                type="submit"
                disabled={loading || !otpSent}
                className="w-full rounded-[14px] bg-white py-3.5 text-[14px] font-semibold text-[#111] transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const WORDS = ["Purity", "Hydration", "Delivery"];
const WORD_ICONS = [
  {
    bg: "bg-gradient-to-br from-cyan-500 to-sky-400",
    svg: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M6 1.2C6 1.2 2.5 5 2.5 7.2A3.5 3.5 0 0 0 6 10.7A3.5 3.5 0 0 0 9.5 7.2C9.5 5 6 1.2 6 1.2Z"
          fill="white"
          fillOpacity="0.9"
        />
      </svg>
    ),
  },
  {
    bg: "bg-gradient-to-br from-blue-600 to-indigo-500",
    svg: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M2 6.4C3.4 4.7 4.7 3.8 6 3.8C7.3 3.8 8.6 4.7 10 6.4"
          stroke="white"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path
          d="M3.2 7.6C4.2 6.5 5.1 5.9 6 5.9C6.9 5.9 7.8 6.5 8.8 7.6"
          stroke="white"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <circle cx="6" cy="8.8" r="1" fill="white" />
      </svg>
    ),
  },
  {
    bg: "bg-gradient-to-br from-violet-600 to-purple-400",
    svg: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="1.2" y="4" width="9.6" height="5.8" rx="1.1" fill="white" fillOpacity="0.92" />
        <path
          d="M3.4 4V3.2A1.6 1.6 0 0 1 5 1.6H7A1.6 1.6 0 0 1 8.6 3.2V4"
          stroke="white"
          strokeWidth="0.9"
          strokeOpacity="0.7"
        />
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
    <div className="relative mb-1 h-[68px] select-none overflow-hidden">
      {WORDS.map((word, i) => {
        const offset = (i - active + WORDS.length) % WORDS.length;
        const isActive = offset === 0;
        const isAbove = offset === WORDS.length - 1;

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
              <span
                className={`inline-flex h-[20px] w-[30px] items-center justify-center rounded-[6px] ${WORD_ICONS[i]?.bg}`}
              >
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
