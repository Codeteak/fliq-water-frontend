"use client";

import Link from "next/link";
import Image from "next/image";
import { ReturnedCansPrompt } from "@/components/checkout/returned-cans-prompt";
import { getCanQuantityFromItems } from "@/lib/cart-cans";
import { getProductImageSrc } from "@/lib/product-image";
import { useCartStore } from "@/store/cart.store";
import {
  ArrowRight,
  MapPin,
  RotateCcw,
  ShoppingBag,
  Trash2,
  ChevronLeft,
} from "lucide-react";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const checkoutMeta = useCartStore((state) => state.checkoutMeta);
  const setCheckoutMeta = useCartStore((state) => state.setCheckoutMeta);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const totalCans = items.reduce((sum, item) => sum + item.quantity, 0);
  const canQuantity = getCanQuantityFromItems(items);
  const returnedCanCount = Math.min(
    checkoutMeta.returnedCanCount ?? 0,
    canQuantity,
  );
  const chargeableCanCount = Math.max(canQuantity - returnedCanCount, 0);
  const depositPerCan =
    items.find((item) => (item.product.depositPerCan ?? 0) > 0)?.product
      .depositPerCan ?? 50;
  const estimatedDeposit = chargeableCanCount * depositPerCan;
  const grandTotal = subtotal + estimatedDeposit;

  return (
    <>
      <ReturnedCansPrompt enabled={items.length > 0} />
      <style>{`
        /* ── Tokens ── */
        :root {
          --fg: #0a0a0a;
          --fg-2: #4a4a4a;
          --fg-3: #9a9a9a;
          --bg: #fafafa;
          --surface: #ffffff;
          --border: #e8e8e8;
          --border-soft: #f0f0f0;
          --accent: #0a0a0a;
          --accent-fg: #ffffff;
          --danger: #e53935;
          --ease: cubic-bezier(0.22, 1, 0.36, 1);
          --r-sm: 12px;
          --r-md: 16px;
          --r-lg: 20px;
        }

        /* ── Page ── */
        .cp-root {
          min-height: 100svh;
          background: var(--bg);
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* ── Header ── */
        .cp-header {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(250,250,250,0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
        }
        .cp-header-inner {
          max-width: 1040px;
          margin: 0 auto;
          padding: clamp(14px, 2vw, 18px) clamp(16px, 4vw, 32px);
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .cp-back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--fg-3);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: color 0.18s var(--ease);
          flex-shrink: 0;
        }
        .cp-back-btn:hover { color: var(--fg); }
        .cp-header-title-group { flex: 1; min-width: 0; }
        .cp-header-title {
          font-size: clamp(17px, 2.2vw, 21px);
          font-weight: 700;
          color: var(--fg);
          letter-spacing: -0.03em;
          margin: 0;
          line-height: 1.1;
        }
        .cp-header-sub {
          font-size: clamp(11px, 1.2vw, 12px);
          color: var(--fg-3);
          margin-top: 2px;
        }
        .cp-header-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 24px;
          padding: 0 8px;
          background: var(--fg);
          color: var(--accent-fg);
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }

        /* ── Body ── */
        .cp-body {
          max-width: 1040px;
          margin: 0 auto;
          padding: clamp(20px, 3vw, 32px) clamp(16px, 4vw, 32px) 80px;
        }

        /* ── Grid ── */
        .cp-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(16px, 2.5vw, 24px);
          align-items: start;
        }
        @media (min-width: 900px) {
          .cp-grid { grid-template-columns: 1fr 320px; }
        }
        @media (min-width: 1100px) {
          .cp-grid { grid-template-columns: 1fr 360px; }
        }

        /* ── Section label ── */
        .cp-section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--fg-3);
          margin-bottom: clamp(10px, 1.5vw, 14px);
        }

        /* ── Cart items list ── */
        .cp-items-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        /* ── Cart item ── */
        .cp-item {
          display: grid;
          grid-template-columns: 48px 1fr auto auto auto;
          align-items: center;
          gap: clamp(10px, 1.5vw, 14px);
          padding: clamp(12px, 1.8vw, 16px);
          background: var(--surface);
          border: 1px solid var(--border-soft);
          border-radius: var(--r-lg);
          transition: border-color 0.2s var(--ease), box-shadow 0.2s var(--ease),
                      transform 0.2s var(--ease);
          cursor: default;
        }
        .cp-item:hover {
          border-color: var(--border);
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          transform: translateY(-1px);
        }

        /* thumb */
        .cp-item-thumb {
          position: relative;
          width: 48px;
          height: 48px;
          border-radius: var(--r-sm);
          background: var(--bg);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          color: var(--fg-3);
          flex-shrink: 0;
          overflow: hidden;
        }
        .cp-item-thumb-img {
          object-fit: cover;
        }

        /* info */
        .cp-item-info { min-width: 0; }
        .cp-item-name {
          font-size: clamp(13px, 1.4vw, 14px);
          font-weight: 600;
          color: var(--fg);
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
        }
        .cp-item-unit {
          font-size: clamp(11px, 1.2vw, 12px);
          color: var(--fg-3);
          margin-top: 3px;
        }

        /* qty stepper */
        .cp-stepper {
          display: flex;
          align-items: center;
          gap: 0;
          border: 1px solid var(--border);
          border-radius: 100px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .cp-stepper-btn {
          width: clamp(28px, 3.5vw, 32px);
          height: clamp(28px, 3.5vw, 32px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 16px;
          font-weight: 400;
          color: var(--fg);
          transition: background 0.14s;
          line-height: 1;
        }
        .cp-stepper-btn:hover { background: var(--bg); }
        .cp-stepper-btn:active { background: var(--border); }
        .cp-stepper-val {
          font-size: clamp(12px, 1.3vw, 13px);
          font-weight: 700;
          width: clamp(24px, 3vw, 28px);
          text-align: center;
          color: var(--fg);
          user-select: none;
        }

        /* line total */
        .cp-item-total {
          font-size: clamp(13px, 1.4vw, 14px);
          font-weight: 700;
          color: var(--fg);
          letter-spacing: -0.02em;
          text-align: right;
          min-width: 60px;
          flex-shrink: 0;
        }
        @media (max-width: 540px) {
          .cp-item { grid-template-columns: 44px 1fr auto auto; }
          .cp-item-total { display: none; }
        }

        /* remove btn */
        .cp-remove-btn {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: var(--fg-3);
          transition: background 0.14s, color 0.14s;
          flex-shrink: 0;
        }
        .cp-remove-btn:hover { background: #fff0f0; color: var(--danger); }

        /* ── Sidebar / Summary ── */
        .cp-sidebar {
          position: sticky;
          top: 80px;
        }
        .cp-summary-card {
          background: var(--surface);
          border: 1px solid var(--border-soft);
          border-radius: var(--r-lg);
          overflow: hidden;
        }
        .cp-summary-top {
          padding: clamp(16px, 2vw, 22px);
        }
        .cp-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: clamp(12px, 1.3vw, 13px);
          color: var(--fg-2);
          margin-bottom: 10px;
        }
        .cp-summary-row:last-of-type { margin-bottom: 0; }
        .cp-summary-row-val {
          font-weight: 600;
          color: var(--fg);
        }
        .cp-divider {
          height: 1px;
          background: var(--border-soft);
          margin: 0;
        }

        /* Can return */
        .cp-can-block {
          padding: clamp(14px, 1.8vw, 18px) clamp(16px, 2vw, 22px);
          background: var(--bg);
        }
        .cp-can-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .cp-can-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: var(--surface);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cp-can-title {
          font-size: clamp(12px, 1.3vw, 13px);
          font-weight: 700;
          color: var(--fg);
          letter-spacing: -0.01em;
        }
        .cp-can-desc {
          font-size: clamp(10px, 1.1vw, 11px);
          color: var(--fg-3);
          line-height: 1.5;
          margin-bottom: 12px;
        }
        .cp-can-stepper-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cp-can-label {
          font-size: 11px;
          color: var(--fg-3);
          margin-left: 2px;
        }
        .cp-can-stats {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px dashed var(--border);
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .cp-can-stat-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--fg-3);
        }
        .cp-can-stat-val {
          font-weight: 700;
          color: var(--fg);
        }

        /* Total */
        .cp-total-block {
          padding: clamp(16px, 2vw, 20px) clamp(16px, 2vw, 22px);
        }
        .cp-total-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        .cp-total-label {
          font-size: clamp(12px, 1.3vw, 13px);
          font-weight: 600;
          color: var(--fg-2);
        }
        .cp-total-val {
          font-size: clamp(22px, 3vw, 28px);
          font-weight: 800;
          color: var(--fg);
          letter-spacing: -0.04em;
        }
        .cp-cod-note {
          font-size: 11px;
          color: var(--fg-3);
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        /* CTAs */
        .cp-cta-block {
          padding: 0 clamp(16px, 2vw, 22px) clamp(16px, 2vw, 22px);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cp-btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: clamp(13px, 1.7vw, 15px) 20px;
          background: var(--accent);
          color: var(--accent-fg);
          border: none;
          border-radius: var(--r-md);
          font-size: clamp(13px, 1.4vw, 14px);
          font-weight: 700;
          letter-spacing: -0.01em;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.18s var(--ease), transform 0.15s var(--ease),
                      box-shadow 0.18s var(--ease);
          text-decoration: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .cp-btn-primary:hover {
          background: #222;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
        .cp-btn-primary:active { transform: translateY(0); }

        .cp-btn-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          width: 100%;
          padding: clamp(11px, 1.5vw, 13px) 20px;
          background: transparent;
          color: var(--fg-2);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          font-size: clamp(12px, 1.3vw, 13px);
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.18s, color 0.18s, background 0.18s;
          text-decoration: none;
        }
        .cp-btn-secondary:hover {
          border-color: var(--fg);
          color: var(--fg);
          background: var(--bg);
        }

        /* ── Empty State ── */
        .cp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(10px, 1.5vw, 14px);
          padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 40px);
          text-align: center;
          background: var(--surface);
          border: 1px solid var(--border-soft);
          border-radius: var(--r-lg);
        }
        .cp-empty-icon {
          width: clamp(52px, 7vw, 64px);
          height: clamp(52px, 7vw, 64px);
          border-radius: 50%;
          background: var(--bg);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--fg-3);
          margin-bottom: 4px;
        }
        .cp-empty-title {
          font-size: clamp(16px, 2vw, 19px);
          font-weight: 700;
          color: var(--fg);
          letter-spacing: -0.02em;
          margin: 0;
        }
        .cp-empty-sub {
          font-size: clamp(12px, 1.3vw, 13px);
          color: var(--fg-3);
          margin: 0;
          max-width: 240px;
        }

        /* ── Fade-in animation ── */
        @keyframes cp-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cp-item {
          animation: cp-fade-up 0.38s var(--ease) both;
        }

        /* ── Bill / Receipt (Cart Summary) ── */
        .bill-wrap { background: var(--bg); padding: 0; border-radius: var(--r-lg); overflow: hidden; }
        .bill-edge-top svg, .bill-edge-bottom svg { display: block; width: 100%; height: 18px; }
        .bill-body {
          font-family: 'Courier New', Courier, monospace;
          padding: 0 18px 14px;
          border-left: 1.5px solid var(--border-soft);
          border-right: 1.5px solid var(--border-soft);
          background: var(--surface);
        }
        .bill-store-name { text-align: center; font-size: 17px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--fg); padding: 12px 0 2px; margin: 0; }
        .bill-store-sub { text-align: center; font-size: 10px; color: var(--fg-3); letter-spacing: 0.08em; padding-bottom: 10px; margin: 0; }
        .bill-dash { border: none; border-top: 1.5px dashed var(--border); margin: 8px 0; }
        .bill-meta-row { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: var(--fg-2); padding: 2px 0; }
        .bill-section-label { font-size: 10px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--fg-3); margin: 10px 0 5px; }
        .bill-item-row { display: grid; grid-template-columns: 1fr auto auto; gap: 6px; font-size: 12px; font-weight: 700; color: var(--fg); padding: 3px 0; align-items: baseline; }
        .bill-item-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bill-item-qty { color: var(--fg-3); font-size: 11px; text-align: right; }
        .bill-item-price { text-align: right; min-width: 64px; font-weight: 800; }
        .bill-price-row { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: var(--fg-2); padding: 3px 0; }
        .bill-total-block { padding: 10px 0 8px; text-align: center; }
        .bill-total-label { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-3); margin: 0 0 4px; }
        .bill-total-amount { font-size: clamp(24px,3vw,30px); font-weight: 800; color: var(--fg); letter-spacing: -0.03em; margin: 0; }
        .bill-can-box { border: 1.5px dashed var(--border); border-radius: 4px; padding: 10px 12px; margin: 8px 0; }
        .bill-can-title { font-size: 9px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-3); margin: 0 0 8px; }
        .bill-can-stepper-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .bill-stepper-btn { width: 30px; height: 30px; border-radius: 50%; border: 1.5px solid var(--border); background: transparent; font-size: 18px; font-weight: 300; color: var(--fg); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.13s; }
        .bill-stepper-btn:hover:not(:disabled) { background: var(--bg); }
        .bill-stepper-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .bill-stepper-center { text-align: center; }
        .bill-stepper-val { font-size: 26px; font-weight: 700; color: var(--fg); display: block; letter-spacing: -0.03em; line-height: 1; }
        .bill-stepper-lbl { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--fg-3); }
        .bill-can-stat { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: var(--fg-2); padding: 2px 0; }
        .bill-ctas { padding: 6px 0 8px; display: flex; flex-direction: column; gap: 8px; }
        .bill-quote-btn { width: 100%; padding: 9px; border: 1.5px dashed var(--border); background: transparent; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; letter-spacing: 0.06em; color: var(--fg-2); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; text-decoration: none; transition: background 0.15s, color 0.15s; }
        .bill-quote-btn:hover { background: var(--bg); color: var(--fg); }
        .bill-place-btn { width: 100%; padding: 12px; border: 1.5px solid var(--fg); background: var(--fg); border-radius: 4px; font-family: 'Courier New', monospace; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--surface); cursor: pointer; transition: opacity 0.15s; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .bill-place-btn:hover { opacity: 0.85; }
      `}</style>

      <div className="cp-root">
        {/* ── Header ── */}
        <header className="cp-header">
          <div className="cp-header-inner">
            <Link href="/" className="cp-back-btn">
              <ChevronLeft size={15} strokeWidth={2} />
              <span>Shop</span>
            </Link>
            <div className="cp-header-title-group">
              <h1 className="cp-header-title">Cart</h1>
              {items.length > 0 && (
                <p className="cp-header-sub">
                  {totalCans} item{totalCans !== 1 ? "s" : ""} · Rs.{" "}
                  {subtotal.toLocaleString()}
                </p>
              )}
            </div>
            {items.length > 0 && (
              <span className="cp-header-badge">{items.length}</span>
            )}
          </div>
        </header>

        {/* ── Body ── */}
        <main className="cp-body">
          {items.length === 0 ? (
            /* Empty */
            <div className="cp-empty">
              <div className="cp-empty-icon">
                <ShoppingBag size={28} strokeWidth={1.2} />
              </div>
              <p className="cp-empty-title">Your cart is empty</p>
              <p className="cp-empty-sub">Add some products to get started</p>
              <Link
                href="/"
                className="cp-btn-primary"
                style={{ width: "auto", marginTop: 8, padding: "12px 28px" }}
              >
                Browse Products
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </div>
          ) : (
            <div className="cp-grid">
              {/* ── Items ── */}
              <div>
                <p className="cp-section-label">Items</p>
                <div className="cp-items-list">
                  {items.map((item, idx) => {
                    const thumbSrc = getProductImageSrc(item.product);
                    return (
                      <div
                        key={item.product.id}
                        className="cp-item"
                        style={{ animationDelay: `${idx * 55}ms` }}
                      >
                        {/* Thumb */}
                        <div className="cp-item-thumb">
                          {thumbSrc ? (
                            <Image
                              src={thumbSrc}
                              alt=""
                              fill
                              className="cp-item-thumb-img"
                              sizes="48px"
                            />
                          ) : (
                            item.product.name.charAt(0).toUpperCase()
                          )}
                        </div>

                        {/* Info */}
                        <div className="cp-item-info">
                          <p className="cp-item-name">{item.product.name}</p>
                          <p className="cp-item-unit">
                            Rs. {item.product.price.toLocaleString()} each
                          </p>
                        </div>

                        {/* Stepper */}
                        <div className="cp-stepper">
                          <button
                            className="cp-stepper-btn"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            aria-label="Decrease"
                          >
                            −
                          </button>
                          <span className="cp-stepper-val">
                            {item.quantity}
                          </span>
                          <button
                            className="cp-stepper-btn"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            aria-label="Increase"
                          >
                            +
                          </button>
                        </div>

                        {/* Line total */}
                        <div className="cp-item-total">
                          Rs.{" "}
                          {(
                            item.product.price * item.quantity
                          ).toLocaleString()}
                        </div>

                        {/* Remove */}
                        <button
                          className="cp-remove-btn"
                          onClick={() => removeItem(item.product.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} strokeWidth={1.8} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Sidebar ── */}
              <aside className="cp-sidebar">
                <p className="cp-section-label">Order Summary</p>
                <div className="bill-wrap">
                  <div className="bill-edge-top">
                    <svg viewBox="0 0 360 18" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="360" height="18" fill="var(--bg)" />
                      <path d="M0,18 Q9,6 18,18 Q27,6 36,18 Q45,6 54,18 Q63,6 72,18 Q81,6 90,18 Q99,6 108,18 Q117,6 126,18 Q135,6 144,18 Q153,6 162,18 Q171,6 180,18 Q189,6 198,18 Q207,6 216,18 Q225,6 234,18 Q243,6 252,18 Q261,6 270,18 Q279,6 288,18 Q297,6 306,18 Q315,6 324,18 Q333,6 342,18 Q351,6 360,18" fill="var(--surface)" stroke="var(--border-soft)" strokeWidth="1" />
                    </svg>
                  </div>
                  <div className="bill-body">
                    <p className="bill-store-name">WaterFlow</p>
                    <p className="bill-store-sub">Cart Summary</p>
                    <div className="bill-dash" />
                    <div className="bill-meta-row"><span>Date</span><span>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
                    <div className="bill-meta-row"><span>Payment</span><span>Cash on Delivery</span></div>
                    <div className="bill-dash" />
                    <p className="bill-section-label">Items</p>
                    {items.map((item) => (
                      <div key={item.product.id} className="bill-item-row">
                        <span className="bill-item-name">{item.product.name}</span>
                        <span className="bill-item-qty">x{item.quantity}</span>
                        <span className="bill-item-price">Rs. {(item.product.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="bill-dash" />
                    <div className="bill-price-row"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
                    <div className="bill-price-row"><span>Deposit est.</span><span>Rs. {estimatedDeposit.toLocaleString()}</span></div>
                    <div className="bill-dash" />
                    <div className="bill-can-box">
                      <p className="bill-can-title">Can Return</p>
                      <div className="bill-can-stepper-row">
                        <button
                          className="bill-stepper-btn"
                          onClick={() =>
                            setCheckoutMeta({
                              returnedCanCount: Math.max(returnedCanCount - 1, 0),
                              returnedCansPromptAcknowledged: true,
                            })
                          }
                          aria-label="Decrease returned"
                        >
                          −
                        </button>
                        <div className="bill-stepper-center">
                          <span className="bill-stepper-val">{returnedCanCount}</span>
                          <span className="bill-stepper-lbl">returned</span>
                        </div>
                        <button
                          className="bill-stepper-btn"
                          onClick={() =>
                            setCheckoutMeta({
                              returnedCanCount: Math.min(returnedCanCount + 1, canQuantity),
                              returnedCansPromptAcknowledged: true,
                            })
                          }
                          aria-label="Increase returned"
                        >
                          +
                        </button>
                      </div>
                      <div className="bill-can-stat"><span>Chargeable</span><span>{chargeableCanCount} cans</span></div>
                      <div className="bill-can-stat"><span>Rate</span><span>Rs. {depositPerCan}/can</span></div>
                    </div>
                    <div className="bill-dash" />
                    <div className="bill-total-block">
                      <p className="bill-total-label">Total Amount</p>
                      <p className="bill-total-amount">Rs. {grandTotal.toLocaleString()}</p>
                    </div>
                    <div className="bill-ctas">
                      <Link href="/checkout" className="bill-place-btn">
                        Proceed to Checkout <ArrowRight size={14} strokeWidth={2.2} />
                      </Link>
                      <Link href="/account" className="bill-quote-btn">
                        <MapPin size={13} strokeWidth={1.8} />
                        Manage Addresses
                      </Link>
                    </div>
                  </div>
                  <div className="bill-edge-bottom">
                    <svg viewBox="0 0 360 18" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="360" height="18" fill="var(--bg)" />
                      <path d="M0,0 Q9,12 18,0 Q27,12 36,0 Q45,12 54,0 Q63,12 72,0 Q81,12 90,0 Q99,12 108,0 Q117,12 126,0 Q135,12 144,0 Q153,12 162,0 Q171,12 180,0 Q189,12 198,0 Q207,12 216,0 Q225,12 234,0 Q243,12 252,0 Q261,12 270,0 Q279,12 288,0 Q297,12 306,0 Q315,12 324,0 Q333,12 342,0 Q351,12 360,0" fill="var(--surface)" stroke="var(--border-soft)" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
