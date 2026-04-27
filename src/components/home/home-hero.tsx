"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CartDrawer } from "@/components/common/cart-drawer";

const HERO_QUOTES = [
  "Stay Hidrated ..",
  "Hydration is your daily power.",
  "Drink pure, live better.",
  "Every drop keeps you going.",
  "Water first. Wellness follows.",
  "Refresh your body, refresh your mind.",
  "Sip smart. Stay strong.",
  "Hydrate today for a better tomorrow.",
  "Pure water, pure energy.",
  "Keep calm and drink water.",
  "Your body loves clean water.",
  "Hydration is self-care.",
  "Drink more water, feel more alive.",
  "Water is life in every drop.",
  "Start fresh, stay hydrated.",
  "Fuel your day with pure water.",
  "One glass at a time, one healthy life.",
  "Hydrate often, smile often.",
  "Clear water, clear mind.",
  "Wellness begins with water.",
  "Stay cool, stay hydrated.",
  "Drink water and keep moving.",
];

export function HomeHero() {
  const [showMobileVideo, setShowMobileVideo] = useState(false);
  const [showDesktopBg, setShowDesktopBg] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);
  const activationTimerRef = useRef<number | null>(null);
  const desktopActivationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("hero-video-state", { detail: showMobileVideo || showDesktopBg }));
    return () => {
      window.dispatchEvent(new CustomEvent("hero-video-state", { detail: false }));
    };
  }, [showDesktopBg, showMobileVideo]);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) return;

    const clearActivationTimer = () => {
      if (activationTimerRef.current !== null) {
        window.clearTimeout(activationTimerRef.current);
        activationTimerRef.current = null;
      }
    };

    const scheduleVideoActivation = () => {
      clearActivationTimer();
      activationTimerRef.current = window.setTimeout(() => {
        const stillAtHeroTop = window.scrollY <= 8;
        if (stillAtHeroTop) {
          setShowMobileVideo(true);
        }
      }, 5000);
    };

    const handleScroll = () => {
      const atHeroTop = window.scrollY <= 8;
      if (!atHeroTop) {
        setShowMobileVideo(false);
        setQuoteIndex(0);
        setQuoteVisible(true);
        clearActivationTimer();
        return;
      }

      if (!showMobileVideo && activationTimerRef.current === null) {
        scheduleVideoActivation();
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearActivationTimer();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showMobileVideo]);

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (!isDesktop) return;

    const clearDesktopActivationTimer = () => {
      if (desktopActivationTimerRef.current !== null) {
        window.clearTimeout(desktopActivationTimerRef.current);
        desktopActivationTimerRef.current = null;
      }
    };

    const scheduleDesktopActivation = () => {
      clearDesktopActivationTimer();
      desktopActivationTimerRef.current = window.setTimeout(() => {
        const stillAtHeroTop = window.scrollY <= 8;
        if (stillAtHeroTop) {
          setShowDesktopBg(true);
        }
      }, 5000);
    };

    const handleScroll = () => {
      const atHeroTop = window.scrollY <= 8;
      if (!atHeroTop) {
        setShowDesktopBg(false);
        setQuoteIndex(0);
        setQuoteVisible(true);
        clearDesktopActivationTimer();
        return;
      }

      if (!showDesktopBg && desktopActivationTimerRef.current === null) {
        scheduleDesktopActivation();
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearDesktopActivationTimer();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showDesktopBg]);

  useEffect(() => {
    if (!showMobileVideo && !showDesktopBg) return;

    const switchTimer = window.setInterval(() => {
      setQuoteVisible(false);
      window.setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % HERO_QUOTES.length);
        setQuoteVisible(true);
      }, 320);
    }, 3000);

    return () => window.clearInterval(switchTimer);
  }, [showDesktopBg, showMobileVideo]);

  return (
    <section className="relative isolate -mt-16 z-0 flex min-h-dvh w-full max-w-none flex-col items-center justify-center overflow-hidden bg-white px-4 pt-20 text-center sm:px-8 sm:pt-24 md:pt-24">
      <div
        className={`pointer-events-none absolute inset-0 z-0 transition-opacity duration-700 ${
          showMobileVideo ? "opacity-100" : "opacity-0"
        } md:hidden`}
        aria-hidden
      >
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src="/girl-drinking-water.mp4" type="video/mp4" />
        </video>
      </div>
      <div
        className={`pointer-events-none absolute inset-0 z-0 hidden transition-opacity duration-700 md:block ${
          showDesktopBg ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      >
        <Image
          src="/gif/water-desktop-video.gif"
          alt="Desktop hydration background"
          fill
          className="object-cover"
          sizes="100vw"
          unoptimized
          priority
        />
      </div>

      <div
        className={`relative z-10 flex flex-1 flex-col items-center justify-center transition-opacity duration-500 ${
          showMobileVideo ? "opacity-0 md:opacity-100" : "opacity-100"
        } ${showDesktopBg ? "md:opacity-0" : "md:opacity-100"}`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Pure water, delivered</p>
        <h1 className="mt-3 max-w-3xl text-balance text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
          Fresh drinking water at your doorstep
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-base text-slate-600 sm:text-lg">
          Order 20L refill cans, bottle packs, and subscriptions-book a slot and we&apos;ll bring quality water
          when you need it.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/products"
            className="inline-flex h-10 items-center justify-center rounded-full bg-sky-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
          >
            Browse products
          </Link>
          <CartDrawer />
        </div>
      </div>
      <div
        className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6 text-center transition-opacity duration-500 md:hidden ${
          showMobileVideo ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!showMobileVideo}
      >
        <p
          className={`max-w-[16ch] text-4xl font-bold tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)] transition-all duration-300 ${
            quoteVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
          }`}
        >
          {HERO_QUOTES[quoteIndex]}
        </p>
      </div>
      <div
        className={`pointer-events-none absolute inset-0 z-20 hidden items-center justify-center px-6 text-center transition-opacity duration-500 md:flex ${
          showDesktopBg ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!showDesktopBg}
      >
        <p
          className={`max-w-[20ch] text-5xl font-bold tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)] transition-all duration-300 ${
            quoteVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
          }`}
        >
          {HERO_QUOTES[quoteIndex]}
        </p>
      </div>
      <div
        className={`relative z-10 mt-6 flex w-full shrink-0 justify-center pb-2 transition-opacity duration-700 sm:pb-4 ${
          showMobileVideo ? "opacity-0 md:opacity-100" : "opacity-100"
        } ${showDesktopBg ? "md:opacity-0" : "md:opacity-100"}`}
      >
        <Image
          src="/image.png"
          alt="Water splash"
          width={760}
          height={380}
          className="h-auto w-full max-w-[min(100%,560px)] object-contain"
          sizes="(max-width: 640px) 100vw, 560px"
          priority
        />
      </div>
    </section>
  );
}
