"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { registerStepOne, registerStepTwo } from "@/features/auth/api";
import { normalizeError } from "@/lib/error";

export default function RegisterPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  const requestOtp = async () => {
    setError("");
    setLoading(true);
    try {
      await registerStepOne({ phone, name, password });
      setOtpSent(true);
    } catch (err) {
      setError(normalizeError(err, "Failed to send OTP").message);
    } finally {
      setLoading(false);
    }
  };

  const completeRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerStepTwo({ phone, name, password, otp });
      router.push("/products");
      router.refresh();
    } catch (err) {
      setError(normalizeError(err, "Registration failed").message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 h-dvh w-screen overflow-hidden font-[Plus_Jakarta_Sans,sans-serif]">
      <div className="absolute inset-0 reg-gradient-anim bg-gradient-to-t from-[#f4f4f8] from-[38%] via-[#3b7fff] via-[60%] to-[#1a56db]" />

      <div
        className="absolute left-1/2 top-[18%] h-[340px] w-[340px] -translate-x-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(99,150,255,0.45) 0%, transparent 70%)",
          filter: "blur(36px)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col px-6 pb-10 pt-16">
        <div className="mb-1 select-none">
          <p className="text-[30px] font-bold leading-tight text-white">Create Account</p>
          <p className="mt-1 text-[14px] text-white/75">
            Start booking water cans in seconds with secure OTP verification.
          </p>
        </div>

        <div className="mt-auto">
          <h1 className="mb-2 text-[42px] font-bold leading-tight text-white sm:text-[46px]">
            Join Fliq,
            <br />
            stay hydrated
          </h1>
          <p className="mb-6 text-[14px] leading-relaxed text-white/75">
            Create your account to manage deliveries, deposits, and orders from one place.
          </p>

          <div className="p-1">
            <form onSubmit={completeRegister} className="space-y-2.5">
              <input
                className="w-full rounded-xl border border-blue-100/70 px-4 py-3 text-[13px] text-white outline-none transition-colors placeholder:text-blue-100/90 focus:border-white"
                style={{ background: "rgba(30, 64, 175, 0.82)" }}
                placeholder="Phone number"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
              <input
                className="w-full rounded-xl border border-blue-100/70 px-4 py-3 text-[13px] text-white outline-none transition-colors placeholder:text-blue-100/90 focus:border-white"
                style={{ background: "rgba(30, 64, 175, 0.82)" }}
                placeholder="Full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <div className="relative">
                <input
                  className="w-full rounded-xl border border-blue-100/70 px-4 py-3 pr-12 text-[13px] text-white outline-none transition-colors placeholder:text-blue-100/90 focus:border-white"
                  style={{ background: "rgba(30, 64, 175, 0.82)" }}
                  placeholder="Password (min 6 chars)"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/85 transition hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={requestOtp}
                  disabled={loading}
                  className="w-full rounded-[14px] border border-blue-100/70 bg-blue-800 py-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              ) : (
                <>
                  <p className="px-1 text-[12px] text-white/70">
                    OTP sent to {phone}. Enter the 6-digit code to complete registration.
                  </p>
                  <input
                    className="w-full rounded-xl border border-blue-100/70 px-4 py-3 text-[13px] tracking-[6px] text-white outline-none transition-colors placeholder:text-blue-100/90 focus:border-white"
                    style={{ background: "rgba(30, 64, 175, 0.82)" }}
                    placeholder="OTP"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={requestOtp}
                    disabled={loading}
                    className="w-full rounded-[14px] border border-blue-100/70 bg-blue-800 py-3 text-[12px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                  >
                    Resend OTP
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-[14px] bg-blue-950 py-3.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  >
                    {loading ? "Creating account..." : "Verify OTP and Register"}
                  </button>
                </>
              )}

              {error ? <p className="px-1 text-[12px] text-red-200">{error}</p> : null}
            </form>

            <div className="my-3 text-center text-[11px] text-white/40">or</div>

            <Link
              href="/auth/login"
              className="flex w-full items-center justify-center rounded-[14px] border border-blue-100/70 bg-blue-800 py-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .reg-gradient-anim {
          animation: regGradientRise 520ms ease-out both;
        }
        @keyframes regGradientRise {
          0% {
            transform: translateY(14%);
            filter: saturate(0.96);
          }
          100% {
            transform: translateY(0);
            filter: saturate(1);
          }
        }
      `}</style>
    </div>
  );
}
