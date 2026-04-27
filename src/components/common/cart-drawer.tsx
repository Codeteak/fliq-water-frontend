"use client";

import Link from "next/link";
import Image from "next/image";
import { getProductImageSrc } from "@/lib/product-image";
import { useCartStore } from "@/store/cart.store";
import { useEffect, useRef, useState } from "react";
import { X, ShoppingBag, Minus, Plus, ArrowRight } from "lucide-react";

export function CartDrawer() {
  const items = useCartStore((state) => state.items);
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen(true)}
        className="cart-trigger"
        aria-label="Open cart"
      >
        <ShoppingBag size={18} strokeWidth={1.6} />
        <span className="cart-trigger-label">Cart</span>
        {items.length > 0 && (
          <span className="cart-badge">{items.length}</span>
        )}
      </button>

      {/* ── Backdrop ── */}
      <div
        ref={overlayRef}
        className={`cart-overlay${open ? " cart-overlay--visible" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* ── Panel (bottom sheet on mobile / sidebar on desktop) ── */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`cart-panel${open ? " cart-panel--open" : ""}`}
      >
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-left">
            <ShoppingBag size={16} strokeWidth={1.5} />
            <span className="cart-title">Your Cart</span>
            {items.length > 0 && (
              <span className="cart-count">{items.length} item{items.length !== 1 ? "s" : ""}</span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="cart-close"
            aria-label="Close cart"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Divider */}
        <div className="cart-divider" />

        {/* Body */}
        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <ShoppingBag size={28} strokeWidth={1} />
              </div>
              <p className="cart-empty-title">Nothing here yet</p>
              <p className="cart-empty-sub">Add items to get started</p>
            </div>
          ) : (
            <ul className="cart-items">
              {items.map((item) => {
                const thumbSrc = getProductImageSrc(item.product);
                return (
                  <li key={item.product.id} className="cart-item">
                    <div className="cart-item-thumb" aria-hidden="true">
                      {thumbSrc ? (
                        <Image
                          src={thumbSrc}
                          alt=""
                          fill
                          className="cart-item-thumb-img"
                          sizes="44px"
                        />
                      ) : (
                        item.product.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="cart-item-info">
                      <p className="cart-item-name">{item.product.name}</p>
                      <p className="cart-item-price">
                        Rs. {(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    {/* Qty controls — wired to your store's increment/decrement if available */}
                    <div className="cart-item-qty">
                      <button className="qty-btn" aria-label="Decrease">
                        <Minus size={11} strokeWidth={2} />
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" aria-label="Increase">
                        <Plus size={11} strokeWidth={2} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-divider" />
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span className="cart-summary-label">Subtotal</span>
                <span className="cart-summary-value">Rs. {total.toLocaleString()}</span>
              </div>
              <div className="cart-summary-row cart-summary-row--muted">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            <Link href="/checkout" onClick={() => setOpen(false)}>
              <button className="cart-checkout-btn">
                Checkout
                <ArrowRight size={15} strokeWidth={1.8} />
              </button>
            </Link>
          </div>
        )}
      </aside>

      {/* ── Styles ── */}
      <style>{`
        /* ─── Tokens ─── */
        :root {
          --cart-bg: #ffffff;
          --cart-fg: #0a0a0a;
          --cart-muted: #6b6b6b;
          --cart-border: #e8e8e8;
          --cart-hover: #f4f4f4;
          --cart-accent: #0a0a0a;
          --cart-accent-fg: #ffffff;
          --cart-radius: 16px;
          --cart-thumb-bg: #f0f0f0;
          --cart-shadow: 0 24px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06);
          --cart-w: 400px;
          --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* ─── Trigger ─── */
        .cart-trigger {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px 8px 12px;
          background: #0a0a0a;
          color: #fff;
          border: none;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: background 0.18s, transform 0.15s;
          font-family: inherit;
        }
        .cart-trigger:hover { background: #222; transform: translateY(-1px); }
        .cart-trigger:active { transform: translateY(0); }
        .cart-trigger-label { font-size: 13px; }
        .cart-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: #ff3b3b;
          color: #fff;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #fff;
          line-height: 1;
        }

        /* ─── Overlay ─── */
        .cart-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0);
          backdrop-filter: blur(0px);
          z-index: 100000;
          pointer-events: none;
          transition: background 0.35s var(--ease-out), backdrop-filter 0.35s var(--ease-out);
        }
        .cart-overlay--visible {
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(4px);
          pointer-events: all;
        }

        /* ─── Panel base ─── */
        .cart-panel {
          position: fixed;
          z-index: 100001;
          background: var(--cart-bg);
          display: flex;
          flex-direction: column;
          box-shadow: var(--cart-shadow);
          transition: transform 0.42s var(--ease-out);
          will-change: transform;
          font-family: inherit;
        }

        /* ─── Mobile: bottom sheet ─── */
        @media (max-width: 767px) {
          .cart-panel {
            left: 0; right: 0; bottom: 0;
            width: 100%;
            max-height: 88dvh;
            border-radius: var(--cart-radius) var(--cart-radius) 0 0;
            transform: translateY(100%);
          }
          .cart-panel--open { transform: translateY(0); }
          /* drag handle */
          .cart-panel::before {
            content: '';
            display: block;
            width: 36px;
            height: 4px;
            background: var(--cart-border);
            border-radius: 2px;
            margin: 10px auto 4px;
            flex-shrink: 0;
          }
        }

        /* ─── Desktop: right sidebar ─── */
        @media (min-width: 768px) {
          .cart-panel {
            top: 0; right: 0; bottom: 0;
            width: var(--cart-w);
            border-radius: var(--cart-radius) 0 0 var(--cart-radius);
            transform: translateX(100%);
          }
          .cart-panel--open { transform: translateX(0); }
        }

        /* ─── Header ─── */
        .cart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 20px 16px;
          flex-shrink: 0;
        }
        .cart-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cart-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--cart-fg);
          letter-spacing: -0.01em;
        }
        .cart-count {
          font-size: 11px;
          font-weight: 500;
          color: var(--cart-muted);
          background: var(--cart-hover);
          padding: 2px 8px;
          border-radius: 100px;
        }
        .cart-close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid var(--cart-border);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--cart-fg);
          transition: background 0.15s, transform 0.15s;
        }
        .cart-close:hover {
          background: var(--cart-hover);
          transform: rotate(90deg);
        }

        /* ─── Divider ─── */
        .cart-divider {
          height: 1px;
          background: var(--cart-border);
          flex-shrink: 0;
        }

        /* ─── Body ─── */
        .cart-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
          scrollbar-width: thin;
          scrollbar-color: var(--cart-border) transparent;
        }
        .cart-body::-webkit-scrollbar { width: 4px; }
        .cart-body::-webkit-scrollbar-thumb { background: var(--cart-border); border-radius: 2px; }

        /* ─── Empty state ─── */
        .cart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 56px 0;
          color: var(--cart-muted);
        }
        .cart-empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--cart-hover);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
          color: #bbb;
        }
        .cart-empty-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--cart-fg);
          margin: 0;
        }
        .cart-empty-sub {
          font-size: 13px;
          color: var(--cart-muted);
          margin: 0;
        }

        /* ─── Items ─── */
        .cart-items {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .cart-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          transition: background 0.15s;
        }
        .cart-item:hover { background: var(--cart-hover); }

        .cart-item-thumb {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: var(--cart-thumb-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 600;
          color: var(--cart-muted);
          flex-shrink: 0;
          border: 1px solid var(--cart-border);
          overflow: hidden;
        }
        .cart-item-thumb-img {
          object-fit: cover;
        }
        .cart-item-info {
          flex: 1;
          min-width: 0;
        }
        .cart-item-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--cart-fg);
          margin: 0 0 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cart-item-price {
          font-size: 12px;
          color: var(--cart-muted);
          margin: 0;
        }
        .cart-item-qty {
          display: flex;
          align-items: center;
          gap: 0;
          border: 1px solid var(--cart-border);
          border-radius: 100px;
          overflow: hidden;
        }
        .qty-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--cart-fg);
          transition: background 0.12s;
        }
        .qty-btn:hover { background: var(--cart-hover); }
        .qty-value {
          font-size: 12px;
          font-weight: 600;
          width: 24px;
          text-align: center;
          color: var(--cart-fg);
          user-select: none;
        }

        /* ─── Footer ─── */
        .cart-footer {
          flex-shrink: 0;
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        .cart-summary {
          padding: 16px 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .cart-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: 13px;
        }
        .cart-summary-label { font-weight: 400; color: var(--cart-muted); }
        .cart-summary-value { font-size: 18px; font-weight: 700; color: var(--cart-fg); letter-spacing: -0.03em; }
        .cart-summary-row--muted { font-size: 11px; color: #bbb; }
        .cart-checkout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: calc(100% - 40px);
          margin: 4px 20px 20px;
          padding: 15px 24px;
          background: var(--cart-accent);
          color: var(--cart-accent-fg);
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .cart-checkout-btn:hover {
          background: #222;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
        .cart-checkout-btn:active { transform: translateY(0); }
      `}</style>
    </>
  );
}