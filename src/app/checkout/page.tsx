"use client";

import { useEffect, useMemo, useState } from "react";
import { AddressForm } from "@/components/checkout/address-form";
import { OrderSuccess } from "@/components/checkout/order-success";
import dynamic from "next/dynamic";
import { addAddress, listAddresses } from "@/features/addresses/api";
import { getDepositPublicConfig } from "@/features/deposits/api";
import { createOrder, quoteOrder } from "@/features/orders/api";
import { ReturnedCansPrompt } from "@/components/checkout/returned-cans-prompt";
import { useCartStore } from "@/store/cart.store";
import { getCanQuantityFromItems } from "@/lib/cart-cans";
import type { Address } from "@/types/address";
import type { DepositPublicConfig } from "@/types/deposit";
import type { OrderQuoteResponse, PaymentMethod } from "@/types/order";
import { normalizeError } from "@/lib/error";
import {
  ArrowRight, ChevronLeft, ChevronRight,
  CreditCard, Loader2, MapPin, ReceiptText,
  RotateCcw, Sparkles, Wallet, AlertTriangle,
} from "lucide-react";
import Link from "next/link";

const ADDRESS_CACHE_KEY = "wf-addresses-cache";

const DeliverySlotPicker = dynamic(
  () => import("@/components/checkout/delivery-slot-picker").then((m) => m.DeliverySlotPicker),
  { ssr: false, loading: () => <div className="chk-slot-skeleton" /> },
);

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const checkoutMeta = useCartStore((s) => s.checkoutMeta);
  const setCheckoutMeta = useCartStore((s) => s.setCheckoutMeta);
  const clearCart = useCartStore((s) => s.clearCart);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(checkoutMeta.addressId ?? "");
  const [timeSlot, setTimeSlot] = useState("10:00-12:00");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(checkoutMeta.paymentMethod ?? "COD");
  const [quote, setQuote] = useState<OrderQuoteResponse | null>(null);
  const [depositConfig, setDepositConfig] = useState<DepositPublicConfig | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);
  const [addressSheetMessage, setAddressSheetMessage] = useState("");
  const [pendingAddressInput, setPendingAddressInput] = useState<{
    label?: string; line1: string; city: string;
    state: string; pincode: string; phone?: string;
  } | null>(null);

  const orderItems = useMemo(
    () => items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
    [items],
  );

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const totalCans = items.reduce((s, i) => s + i.quantity, 0);
  const canQuantity = getCanQuantityFromItems(items);
  const returnedCanCount = checkoutMeta.returnedCanCount;
  const chargeableCanCount = Math.max(canQuantity - returnedCanCount, 0);
  const normalizedReturnedCanCount = Math.max(0, Math.min(returnedCanCount, canQuantity));
  const ifCanRefund = normalizedReturnedCanCount > 0;

  useEffect(() => {
    let alive = true;
    const hydrateAddresses = async () => {
      try {
        const cached = typeof window !== "undefined" ? window.localStorage.getItem(ADDRESS_CACHE_KEY) : null;
        if (cached) {
          const parsed = JSON.parse(cached) as Address[];
          if (Array.isArray(parsed) && parsed.length > 0 && alive) {
            setAddresses(parsed);
            setAddressesLoading(false);
          }
        }
      } catch { /* ignore */ }
      try {
        const fresh = await listAddresses();
        if (!alive) return;
        setAddresses(fresh);
        if (typeof window !== "undefined")
          window.localStorage.setItem(ADDRESS_CACHE_KEY, JSON.stringify(fresh));
      } catch {
        if (alive && addresses.length === 0) setAddresses([]);
      } finally {
        if (alive) setAddressesLoading(false);
      }
    };
    void hydrateAddresses();
    void getDepositPublicConfig().then(setDepositConfig).catch(() => setDepositConfig(null));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCheckoutMeta({ addressId: selectedAddressId, paymentMethod });
  }, [paymentMethod, selectedAddressId, setCheckoutMeta]);

  const handleAddAddress = async (values: {
    label?: string; line1: string; city: string;
    state: string; pincode: string; phone?: string;
  }) => {
    try {
      const created = await addAddress(values);
      setAddresses((prev) => [created, ...prev]);
      setSelectedAddressId(created.id);
      setShowAddressForm(false);
      setAddressSheetOpen(false);
      setAddressSheetMessage("");
      setPendingAddressInput(null);
    } catch (err) {
      const parsed = normalizeError(err, "Unable to save address. Please try again.");
      const isNetworkIssue = /network/i.test(parsed.message);
      setPendingAddressInput(values);
      setAddressSheetMessage(
        isNetworkIssue
          ? "Network problem while saving address. Check your connection and try again."
          : parsed.message,
      );
      setAddressSheetOpen(true);
    }
  };

  const retryAddAddress = async () => {
    if (!pendingAddressInput) return;
    await handleAddAddress(pendingAddressInput);
  };

  const requestQuote = async () => {
    if (!selectedAddressId || orderItems.length === 0) return;
    setError(""); setQuoteLoading(true);
    try {
      const q = await quoteOrder({
        addressId: selectedAddressId, timeSlot, paymentMethod,
        ifCanRefund, returnedCanCount: normalizedReturnedCanCount, items: orderItems,
      });
      setQuote(q);
    } catch (err) {
      setError(normalizeError(err, "Unable to fetch quote").message);
    } finally {
      setQuoteLoading(false);
    }
  };

  useEffect(() => {
    if (!quote || !selectedAddressId || orderItems.length === 0) return;
    const t = window.setTimeout(() => { void requestQuote(); }, 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote, checkoutMeta.returnedCanCount, selectedAddressId, timeSlot, paymentMethod]);

  const placeOrder = async () => {
    if (!selectedAddressId || orderItems.length === 0) return;
    setError(""); setOrderLoading(true);
    try {
      const created = await createOrder({
        addressId: selectedAddressId, timeSlot, paymentMethod,
        ifCanRefund, returnedCanCount: normalizedReturnedCanCount, items: orderItems,
      });
      clearCart();
      setOrderSuccess(true);
      setStatus(created.id);
    } catch (err) {
      setError(normalizeError(err, "Unable to place order").message);
    } finally {
      setOrderLoading(false);
    }
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const canPlaceOrder = !!selectedAddressId && orderItems.length > 0;

  /* ══ SUCCESS SCREEN ══ */
  if (orderSuccess) {
    return <OrderSuccess status={status} />;
  }

  /* ══ MAIN ══ */
  return (
    <>
      <ChkStyles />
      <ReturnedCansPrompt enabled={items.length > 0} />

      <div className="chk-root">

        {/* ── Header ── */}
        <header className="chk-header">
          <div className="chk-header-inner">
            <Link href="/cart" className="chk-back">
              <ChevronLeft size={15} strokeWidth={2} />
              <span>Cart</span>
            </Link>
            <div className="chk-header-center">
              <h1 className="chk-header-title">Checkout</h1>
              {totalCans > 0 && (
                <p className="chk-header-sub">
                  {totalCans} item{totalCans !== 1 ? "s" : ""} · Rs. {subtotal.toLocaleString()}
                </p>
              )}
            </div>
            <div className="chk-steps">
              <span className="chk-step chk-step--active">
                <span className="chk-step-num">1</span> Details
              </span>
              <ChevronRight size={11} strokeWidth={2} className="chk-step-arrow" />
              <span className="chk-step">
                <span className="chk-step-num">2</span> Confirm
              </span>
            </div>
          </div>
        </header>

        {/* ── Main ── */}
        <main className="chk-body">
          <div className="chk-grid">

            {/* ══ LEFT ══ */}
            <div className="chk-left">

              {/* Card: Address */}
              <div className="chk-card" style={{ animationDelay: "0ms" }}>
                <div className="chk-card-header">
                  <div className="chk-card-icon"><MapPin size={14} strokeWidth={1.8} /></div>
                  <div>
                    <h2 className="chk-card-title">Delivery Address</h2>
                    <p className="chk-card-subtitle">Where should we deliver?</p>
                  </div>
                </div>

                {addressesLoading ? (
                  <div className="chk-addr-skeleton">
                    <div className="chk-skeleton-line" style={{ width: "42%" }} />
                    <div className="chk-skeleton-line" style={{ width: "72%" }} />
                    <div className="chk-skeleton-line" style={{ width: "52%" }} />
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="chk-addr-list">
                    {addresses.map((addr) => {
                      const isSel = selectedAddressId === addr.id;
                      return (
                        <label key={addr.id} className={`chk-addr-card${isSel ? " chk-addr-card--sel" : ""}`}>
                          <input
                            type="radio" name="address" value={addr.id}
                            checked={isSel}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="chk-addr-radio"
                          />
                          <div className={`chk-addr-dot${isSel ? " chk-addr-dot--sel" : ""}`}>
                            <span className={`chk-addr-dot-inner${isSel ? " chk-addr-dot-inner--sel" : ""}`} />
                          </div>
                          <div className="chk-addr-info">
                            <p className="chk-addr-label">{addr.label ?? "Address"}</p>
                            <p className="chk-addr-line">
                              {addr.line1}, {addr.city}, {addr.state} – {addr.pincode}
                            </p>
                            {addr.phone && <p className="chk-addr-phone">{addr.phone}</p>}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="chk-addr-empty">
                    <MapPin size={15} strokeWidth={1.5} />
                    <div>
                      <p style={{ fontWeight: 700, marginBottom: 2, color: "var(--fg)" }}>No saved addresses</p>
                      <p>Add your first address below to continue.</p>
                    </div>
                  </div>
                )}

                <button
                  className="chk-add-addr-toggle"
                  onClick={() => setShowAddressForm((v) => !v)}
                >
                  <span className={`chk-add-addr-icon${showAddressForm ? " chk-add-addr-icon--open" : ""}`}>
                    {showAddressForm ? "−" : "+"}
                  </span>
                  {showAddressForm ? "Cancel" : "Add new address"}
                </button>

                {showAddressForm && (
                  <div className="chk-addr-form-wrap">
                    <AddressForm onSubmitAddress={handleAddAddress} submitLabel="Save Address" />
                  </div>
                )}
              </div>

              {/* Card: Payment */}
              <div className="chk-card" style={{ animationDelay: "60ms" }}>
                <div className="chk-card-header">
                  <div className="chk-card-icon"><CreditCard size={14} strokeWidth={1.8} /></div>
                  <div>
                    <h2 className="chk-card-title">Payment Method</h2>
                    <p className="chk-card-subtitle">Cash on Delivery is available</p>
                  </div>
                </div>
                <div className="chk-payment-grid">
                  {([
                    { value: "COD",    label: "Cash on Delivery", icon: <Wallet size={18} strokeWidth={1.5} /> },
                    { value: "ONLINE", label: "Pay Online",        icon: <CreditCard size={18} strokeWidth={1.5} /> },
                  ] as const).map((m) => {
                    const isSel = paymentMethod === m.value;
                    return (
                      <button
                        key={m.value}
                        className={`chk-payment-btn${isSel ? " chk-payment-btn--sel" : ""}`}
                        onClick={() => setPaymentMethod(m.value)}
                      >
                        <span className="chk-payment-btn-icon">{m.icon}</span>
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card: Delivery Slot */}
              <div className="chk-card" style={{ animationDelay: "120ms" }}>
                <div className="chk-card-header">
                  <div className="chk-card-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="chk-card-title">Delivery Slot</h2>
                    <p className="chk-card-subtitle">Pick a convenient time</p>
                  </div>
                </div>
                <div className="chk-slot-wrap">
                  <DeliverySlotPicker
                    onChange={({ slot }) => setTimeSlot(slot.replace(" - ", "-"))}
                  />
                </div>
              </div>
            </div>

            {/* ══ RIGHT ══ */}
            <aside className="chk-right">
              <div className="bill-wrap">
                <div className="bill-edge-top">
                  <svg viewBox="0 0 360 18" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="360" height="18" fill="var(--bg)" />
                    <path d="M0,18 Q9,6 18,18 Q27,6 36,18 Q45,6 54,18 Q63,6 72,18 Q81,6 90,18 Q99,6 108,18 Q117,6 126,18 Q135,6 144,18 Q153,6 162,18 Q171,6 180,18 Q189,6 198,18 Q207,6 216,18 Q225,6 234,18 Q243,6 252,18 Q261,6 270,18 Q279,6 288,18 Q297,6 306,18 Q315,6 324,18 Q333,6 342,18 Q351,6 360,18" fill="var(--surface)" stroke="var(--border-soft)" strokeWidth="1" />
                  </svg>
                </div>
                <div className="bill-body">
                  <p className="bill-store-name">WaterFlow</p>
                  <p className="bill-store-sub">Order Summary</p>
                  <div className="bill-dash" />

                  <div className="bill-meta-row"><span>Date</span><span>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
                  <div className="bill-meta-row"><span>Payment</span><span>{paymentMethod === "COD" ? "Cash on Delivery" : "Online"}</span></div>
                  {selectedAddress && (
                    <div className="bill-meta-row">
                      <span>Deliver to</span>
                      <span className="bill-meta-val-trunc">
                        {selectedAddress.line1}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                      </span>
                    </div>
                  )}
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
                  {depositConfig && <div className="bill-price-row"><span>Deposit est.</span><span>Rs. {(chargeableCanCount * depositConfig.perCanAmount).toLocaleString()}</span></div>}

                  {canQuantity > 0 && (
                    <>
                      <div className="bill-dash" />
                      <div className="bill-can-box">
                        <p className="bill-can-title">Can Return</p>
                        <div className="bill-can-stepper-row">
                          <button
                            className="bill-stepper-btn"
                            disabled={returnedCanCount <= 0}
                            onClick={() => setCheckoutMeta({ returnedCanCount: Math.max(returnedCanCount - 1, 0), returnedCansPromptAcknowledged: true })}
                          >
                            −
                          </button>
                          <div className="bill-stepper-center">
                            <span className="bill-stepper-val">{returnedCanCount}</span>
                            <span className="bill-stepper-lbl">returned</span>
                          </div>
                          <button
                            className="bill-stepper-btn"
                            disabled={returnedCanCount >= canQuantity}
                            onClick={() => setCheckoutMeta({ returnedCanCount: Math.min(returnedCanCount + 1, canQuantity), returnedCansPromptAcknowledged: true })}
                          >
                            +
                          </button>
                        </div>
                        <div className="bill-can-stat"><span>Chargeable</span><span>{chargeableCanCount} can{chargeableCanCount !== 1 ? "s" : ""}</span></div>
                        {returnedCanCount > 0 && depositConfig && (
                          <div className="bill-can-stat bill-can-stat--green"><span>You save</span><span>Rs. {(returnedCanCount * depositConfig.perCanAmount).toLocaleString()}</span></div>
                        )}
                      </div>
                    </>
                  )}

                  {quote && (
                    <>
                      <div className="bill-dash" />
                      <p className="bill-section-label">Quote</p>
                      <div className="bill-price-row"><span>Deposit base</span><span>Rs. {quote.depositBase.toLocaleString()}</span></div>
                      {quote.depositDiscount > 0 && <div className="bill-price-row bill-price-row--green"><span>Promo discount</span><span>−Rs. {quote.depositDiscount.toLocaleString()}</span></div>}
                      <div className="bill-price-row"><span>Deposit charge</span><span>Rs. {quote.depositCharge.toLocaleString()}</span></div>
                    </>
                  )}

                  <div className="bill-dash" />
                  <div className="bill-total-block">
                    <p className="bill-total-label">Total Amount</p>
                    <p className="bill-total-amount">Rs. {(quote ? quote.totalAmount : subtotal + (depositConfig ? chargeableCanCount * depositConfig.perCanAmount : 0)).toLocaleString()}</p>
                  </div>
                  <div className="bill-dash" />

                  <div className="bill-ctas">
                    <button className="bill-quote-btn" onClick={requestQuote} disabled={!canPlaceOrder || quoteLoading}>
                      {quoteLoading ? <Loader2 size={13} className="chk-spin" /> : <Sparkles size={13} strokeWidth={1.8} />}
                      {quoteLoading ? "Calculating..." : "[ Get Quote ]"}
                    </button>
                    <button className="bill-place-btn" onClick={placeOrder} disabled={!canPlaceOrder || orderLoading}>
                      {orderLoading ? "Processing..." : "Place Order →"}
                    </button>
                  </div>

                  {error && <div className="bill-error"><AlertTriangle size={12} />{error}</div>}

                  <div className="bill-barcode">
                    {[3, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 3, 1, 2, 1, 1, 2, 1, 3, 2, 1, 2].map((w, i) => (
                      <div key={i} className="bill-barcode-bar" style={{ width: w, height: 18 + (i % 3) * 4 }} />
                    ))}
                  </div>
                  <p className="bill-thankyou">Thank you for your order</p>
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
        </main>
      </div>

      {/* ── Network Error Bottom Sheet ── */}
      {addressSheetOpen && (
        <div
          className="chk-sheet-backdrop"
          role="presentation"
          onClick={() => setAddressSheetOpen(false)}
        >
          <div
            className="chk-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Network problem"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="chk-sheet-handle" />
            <div className="chk-sheet-icon-wrap">
              <div className="chk-sheet-icon">
                <AlertTriangle size={22} strokeWidth={1.6} />
              </div>
            </div>
            <h3 className="chk-sheet-title">Network Problem</h3>
            <p className="chk-sheet-msg">{addressSheetMessage || "Please try again."}</p>
            <div className="chk-sheet-actions">
              <button className="chk-btn-ghost" onClick={() => setAddressSheetOpen(false)}>
                Dismiss
              </button>
              <button className="chk-btn-primary" onClick={retryAddAddress}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════
   SCOPED STYLES
════════════════════════════════ */
function ChkStyles() {
  return (
    <style>{`
      :root {
        --fg:          #0a0a0a;
        --fg-2:        #4a4a4a;
        --fg-3:        #9a9a9a;
        --bg:          #f6f6f6;
        --surface:     #ffffff;
        --border:      #e4e4e4;
        --border-soft: #efefef;
        --accent:      #0a0a0a;
        --accent-fg:   #ffffff;
        --green:       #16a34a;
        --green-bg:    #f0fdf4;
        --green-border:#bbf7d0;
        --red:         #dc2626;
        --red-bg:      #fff5f5;
        --red-border:  #fecaca;
        --ease: cubic-bezier(0.22, 1, 0.36, 1);
        --r-xs:8px; --r-sm:10px; --r-md:14px; --r-lg:18px; --r-xl:22px;
      }

      .chk-root {
        min-height: 100svh; background: var(--bg);
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
      }

      /* ── Header ── */
      .chk-header {
        position: sticky; top: 0; z-index: 50;
        background: rgba(246,246,246,0.92);
        backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        border-bottom: 1px solid var(--border-soft);
      }
      .chk-header-inner {
        max-width: 1080px; margin: 0 auto;
        padding: clamp(12px,1.8vw,16px) clamp(16px,4vw,32px);
        display: flex; align-items: center; gap: clamp(10px,2vw,20px);
      }
      .chk-back {
        display: flex; align-items: center; gap: 4px;
        font-size: clamp(12px,1.3vw,13px); font-weight: 500;
        color: var(--fg-3); text-decoration: none; flex-shrink: 0;
        transition: color 0.18s var(--ease);
      }
      .chk-back:hover { color: var(--fg); }
      .chk-header-center { flex: 1; min-width: 0; }
      .chk-header-title {
        font-size: clamp(15px,2vw,19px); font-weight: 800;
        color: var(--fg); letter-spacing: -0.04em; margin: 0; line-height: 1.1;
      }
      .chk-header-sub { font-size: clamp(10px,1.1vw,11px); color: var(--fg-3); margin-top: 2px; }
      .chk-steps { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
      .chk-step {
        display: flex; align-items: center; gap: 4px;
        font-size: clamp(10px,1.1vw,11px); font-weight: 600;
        color: var(--fg-3); letter-spacing: 0.02em;
      }
      .chk-step--active { color: var(--fg); }
      .chk-step-num {
        display: inline-flex; align-items: center; justify-content: center;
        width: 18px; height: 18px; border-radius: 50%;
        border: 1.5px solid currentColor; font-size: 9px; font-weight: 800;
      }
      .chk-step-arrow { color: var(--fg-3); flex-shrink: 0; }

      /* ── Body / Grid ── */
      .chk-body {
        max-width: 1080px; margin: 0 auto;
        padding: clamp(18px,3vw,32px) clamp(16px,4vw,32px) 100px;
      }
      .chk-grid {
        display: grid; grid-template-columns: 1fr;
        gap: clamp(12px,2vw,18px); align-items: start;
      }
      @media (min-width: 860px)  { .chk-grid { grid-template-columns: 1fr 340px; } }
      @media (min-width: 1060px) { .chk-grid { grid-template-columns: 1fr 380px; } }
      .chk-left { display: flex; flex-direction: column; gap: clamp(10px,1.6vw,14px); }

      /* ── Card ── */
      .chk-card {
        background: var(--surface); border: 1px solid var(--border-soft);
        border-radius: var(--r-xl); padding: clamp(16px,2.2vw,22px);
        animation: chk-fade-up 0.4s var(--ease) both;
        transition: border-color 0.2s var(--ease), box-shadow 0.2s var(--ease);
      }
      .chk-card:hover { border-color: var(--border); box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
      .chk-card--sticky { position: sticky; top: 72px; }
      .chk-card-header {
        display: flex; align-items: flex-start; gap: 11px;
        margin-bottom: clamp(14px,1.8vw,18px);
      }
      .chk-card-icon {
        width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0; margin-top: 1px;
        background: var(--bg); border: 1px solid var(--border-soft);
        display: flex; align-items: center; justify-content: center; color: var(--fg-2);
      }
      .chk-card-title {
        font-size: clamp(13px,1.5vw,15px); font-weight: 800;
        color: var(--fg); letter-spacing: -0.025em; margin: 0;
      }
      .chk-card-subtitle { font-size: clamp(10px,1.1vw,11px); color: var(--fg-3); margin: 3px 0 0; }

      /* ── Address ── */
      .chk-addr-skeleton {
        display: flex; flex-direction: column; gap: 8px; padding: 14px;
        border: 1px solid var(--border-soft); border-radius: var(--r-md);
        background: var(--bg); margin-bottom: 14px;
      }
      .chk-skeleton-line {
        height: 11px; background: var(--border); border-radius: 6px;
        animation: chk-pulse 1.6s ease infinite;
      }
      .chk-addr-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
      .chk-addr-empty {
        display: flex; align-items: flex-start; gap: 10px; padding: 14px 16px;
        border: 1px dashed var(--border); border-radius: var(--r-md);
        background: var(--bg); font-size: clamp(11px,1.2vw,12px); color: var(--fg-3);
        margin-bottom: 14px; line-height: 1.5;
      }
      .chk-addr-card {
        display: flex; align-items: flex-start; gap: 12px;
        padding: clamp(11px,1.4vw,14px) clamp(12px,1.6vw,15px);
        border: 1.5px solid var(--border-soft); border-radius: var(--r-md); cursor: pointer;
        transition: border-color 0.18s var(--ease), background 0.18s var(--ease);
      }
      .chk-addr-card:hover { background: var(--bg); border-color: var(--border); }
      .chk-addr-card--sel { border-color: var(--fg) !important; background: var(--bg); }
      .chk-addr-radio { position: absolute; opacity: 0; pointer-events: none; }
      .chk-addr-dot {
        width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border);
        flex-shrink: 0; margin-top: 2px; display: flex; align-items: center; justify-content: center;
        transition: border-color 0.18s;
      }
      .chk-addr-dot--sel { border-color: var(--fg); }
      .chk-addr-dot-inner { width: 8px; height: 8px; border-radius: 50%; background: transparent; transition: background 0.18s; }
      .chk-addr-dot-inner--sel { background: var(--fg); }
      .chk-addr-label { font-size: clamp(12px,1.3vw,13px); font-weight: 700; color: var(--fg); margin: 0 0 3px; }
      .chk-addr-line { font-size: clamp(11px,1.2vw,12px); color: var(--fg-2); margin: 0; line-height: 1.45; }
      .chk-addr-phone { font-size: 11px; color: var(--fg-3); margin: 3px 0 0; }
      .chk-add-addr-toggle {
        display: inline-flex; align-items: center; gap: 8px;
        font-size: clamp(12px,1.3vw,13px); font-weight: 500;
        color: var(--fg-2); background: transparent; border: none;
        cursor: pointer; padding: 0; font-family: inherit; transition: color 0.18s;
      }
      .chk-add-addr-toggle:hover { color: var(--fg); }
      .chk-add-addr-icon {
        width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
        background: var(--bg); border: 1px solid var(--border);
        display: flex; align-items: center; justify-content: center;
        font-size: 15px; color: var(--fg); transition: background 0.15s, color 0.15s, border-color 0.15s;
      }
      .chk-add-addr-icon--open { background: var(--fg); color: #fff; border-color: var(--fg); }
      .chk-addr-form-wrap { margin-top: 14px; padding-top: 16px; border-top: 1px solid var(--border-soft); }

      /* ── Payment ── */
      .chk-payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .chk-payment-btn {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 7px; padding: clamp(12px,1.6vw,16px) 10px;
        border: 1.5px solid var(--border-soft); border-radius: var(--r-md);
        background: transparent; color: var(--fg-2);
        font-size: clamp(11px,1.2vw,12px); font-weight: 600; font-family: inherit;
        cursor: pointer; letter-spacing: -0.01em;
        transition: border-color 0.18s, background 0.18s, color 0.18s;
      }
      .chk-payment-btn-icon { color: inherit; }
      .chk-payment-btn:hover { border-color: var(--border); color: var(--fg); background: var(--bg); }
      .chk-payment-btn--sel { border-color: var(--fg) !important; background: var(--fg); color: #fff; }

      /* ── Slot ── */
      .chk-slot-wrap { margin-top: -4px; }
      .chk-slot-skeleton {
        height: 180px; background: var(--bg); border: 1px solid var(--border-soft);
        border-radius: var(--r-md); animation: chk-pulse 1.6s ease infinite;
      }

      /* ── Items ── */
      .chk-items { display: flex; flex-direction: column; gap: 9px; margin-bottom: 16px; }
      .chk-item-row { display: flex; align-items: center; gap: 10px; }
      .chk-item-thumb {
        width: 38px; height: 38px; border-radius: 9px; flex-shrink: 0;
        background: var(--bg); border: 1px solid var(--border-soft);
        display: flex; align-items: center; justify-content: center;
        font-size: 15px; font-weight: 800; color: var(--fg-3);
      }
      .chk-item-info { flex: 1; min-width: 0; }
      .chk-item-name {
        font-size: clamp(12px,1.3vw,13px); font-weight: 600; color: var(--fg);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; letter-spacing: -0.01em;
      }
      .chk-item-qty { font-size: 11px; color: var(--fg-3); margin: 2px 0 0; }
      .chk-item-total {
        font-size: clamp(12px,1.3vw,13px); font-weight: 800; color: var(--fg);
        flex-shrink: 0; letter-spacing: -0.03em;
      }

      /* ── Pricing ── */
      .chk-divider { height: 1px; background: var(--border-soft); }
      .chk-thin-divider { height: 1px; background: var(--border-soft); margin: 8px 0; }
      .chk-pricing { display: flex; flex-direction: column; gap: 8px; padding: 14px 0; }
      .chk-price-row {
        display: flex; justify-content: space-between; align-items: center;
        font-size: clamp(11px,1.2vw,12px); color: var(--fg-2);
      }
      .chk-price-row--green { color: var(--green); }
      .chk-price-row--muted { color: var(--fg-3); }
      .chk-price-bold { font-weight: 800; color: var(--fg); }
      .chk-total-row {
        display: flex; justify-content: space-between; align-items: baseline;
        font-size: clamp(15px,1.8vw,17px); font-weight: 900;
        color: var(--fg); letter-spacing: -0.04em;
      }
      .chk-quote-hint {
        font-size: clamp(10px,1.1vw,11px); color: var(--fg-3); line-height: 1.55;
        padding: 10px 12px; background: var(--bg); border-radius: var(--r-sm);
        border: 1px dashed var(--border);
      }
      .chk-promo-badge {
        display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700;
        color: var(--green); background: var(--green-bg); border: 1px solid var(--green-border);
        border-radius: 100px; padding: 4px 10px; margin-top: 4px;
      }

      /* ── Can box ── */
      .chk-can-box {
        padding: 13px 14px; border-radius: var(--r-md);
        border: 1px solid var(--border-soft); background: var(--bg);
        display: flex; flex-direction: column; gap: 8px;
      }
      .chk-can-box-header {
        display: flex; align-items: center; gap: 7px;
        font-size: 12px; font-weight: 800; color: var(--fg); letter-spacing: -0.01em;
      }
      .chk-can-box-desc { font-size: 11px; color: var(--fg-3); line-height: 1.45; margin: -2px 0 2px; }
      .chk-can-stepper { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .chk-stepper-btn {
        width: 40px; height: 40px; border-radius: 50%; border: 1.5px solid var(--border);
        background: var(--surface); display: flex; align-items: center; justify-content: center;
        font-size: 20px; font-weight: 300; color: var(--fg); cursor: pointer; flex-shrink: 0;
        transition: background 0.15s, border-color 0.15s, opacity 0.15s;
      }
      .chk-stepper-btn:hover:not(:disabled) { background: var(--bg); border-color: var(--border); }
      .chk-stepper-btn:disabled { opacity: 0.32; cursor: not-allowed; }
      .chk-stepper-center {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 1px;
      }
      .chk-stepper-val {
        font-size: clamp(26px,3.5vw,32px); font-weight: 900;
        color: var(--fg); letter-spacing: -0.05em; line-height: 1;
      }
      .chk-stepper-lbl {
        font-size: 9px; font-weight: 700; color: var(--fg-3);
        letter-spacing: 0.08em; text-transform: uppercase;
      }
      .chk-can-stats { display: flex; flex-direction: column; gap: 5px; padding-top: 2px; }

      /* ── Meta chips ── */
      .chk-meta-chips { display: flex; flex-direction: column; gap: 6px; padding: 12px 0; }
      .chk-meta-chip {
        display: flex; align-items: center; gap: 7px;
        font-size: 11px; color: var(--fg-3); line-height: 1.4;
      }
      .chk-meta-chip svg { flex-shrink: 0; }
      .chk-meta-chip--deposit { color: var(--red); }

      /* ── Bill / Receipt ── */
      .bill-wrap { background: var(--bg); padding: 0; }
      .bill-edge-top svg, .bill-edge-bottom svg { display: block; width: 100%; height: 18px; }
      .bill-body {
        font-family: 'Courier New', Courier, monospace;
        padding: 0 22px;
        border-left: 1.5px solid var(--border-soft);
        border-right: 1.5px solid var(--border-soft);
        background: var(--surface);
      }
      .bill-store-name { text-align: center; font-size: clamp(18px,2.3vw,22px); font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--fg); padding: 12px 0 2px; margin: 0; }
      .bill-store-sub { text-align: center; font-size: 12px; color: var(--fg-3); letter-spacing: 0.08em; padding-bottom: 10px; margin: 0; }
      .bill-dash { border: none; border-top: 1.5px dashed var(--border); margin: 8px 0; }
      .bill-meta-row { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: var(--fg-2); padding: 3px 0; }
      .bill-meta-val-trunc { max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: right; }
      .bill-section-label { font-size: 11px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--fg-3); margin: 10px 0 5px; }
      .bill-item-row { display: grid; grid-template-columns: 1fr auto auto; gap: 6px; font-size: 14px; font-weight: 700; color: var(--fg); padding: 4px 0; align-items: baseline; }
      .bill-item-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .bill-item-qty { color: var(--fg-3); font-size: 12px; font-weight: 700; text-align: right; }
      .bill-item-price { text-align: right; min-width: 64px; font-weight: 800; }
      .bill-price-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; color: var(--fg-2); padding: 4px 0; }
      .bill-price-row--green { color: var(--green); }
      .bill-total-block { padding: 12px 0 10px; text-align: center; }
      .bill-total-label { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-3); margin: 0 0 4px; }
      .bill-total-amount { font-size: clamp(28px,4vw,36px); font-weight: 700; color: var(--fg); letter-spacing: -0.03em; margin: 0; }
      .bill-can-box { border: 1.5px dashed var(--border); border-radius: 4px; padding: 10px 12px; margin: 8px 0; }
      .bill-can-title { font-size: 9px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-3); margin: 0 0 8px; }
      .bill-can-stepper-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
      .bill-stepper-btn { width: 30px; height: 30px; border-radius: 50%; border: 1.5px solid var(--border); background: transparent; font-size: 18px; font-weight: 300; color: var(--fg); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.13s; }
      .bill-stepper-btn:hover:not(:disabled) { background: var(--bg); }
      .bill-stepper-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      .bill-stepper-center { text-align: center; }
      .bill-stepper-val { font-size: clamp(28px,3.4vw,34px); font-weight: 700; color: var(--fg); display: block; letter-spacing: -0.03em; line-height: 1; }
      .bill-stepper-lbl { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--fg-3); }
      .bill-can-stat { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: var(--fg-2); padding: 2px 0; }
      .bill-can-stat--green { color: var(--green); }
      .bill-ctas { padding: 4px 0 10px; display: flex; flex-direction: column; gap: 8px; }
      .bill-quote-btn { width: 100%; padding: 10px; border: 1.5px dashed var(--border); background: transparent; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 13px; letter-spacing: 0.06em; color: var(--fg-2); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: background 0.15s, color 0.15s; }
      .bill-quote-btn:hover:not(:disabled) { background: var(--bg); color: var(--fg); }
      .bill-quote-btn:disabled { opacity: 0.35; cursor: not-allowed; }
      .bill-place-btn { width: 100%; padding: 12px; border: 1.5px solid var(--fg); background: var(--fg); border-radius: 4px; font-family: 'Courier New', monospace; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--surface); cursor: pointer; transition: opacity 0.15s, transform 0.12s; }
      .bill-place-btn:hover:not(:disabled) { opacity: 0.85; }
      .bill-place-btn:active:not(:disabled) { transform: scale(0.98); }
      .bill-place-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .bill-error { display: flex; align-items: flex-start; gap: 7px; font-size: 11px; color: var(--red); padding: 8px 0; }
      .bill-barcode { display: flex; justify-content: center; align-items: flex-end; gap: 1.5px; padding: 10px 0 4px; }
      .bill-barcode-bar { background: var(--fg); border-radius: 1px; }
      .bill-thankyou { text-align: center; font-size: 9px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--fg-3); padding-bottom: 12px; margin: 0; }

      /* ── CTAs ── */
      .chk-ctas { display: flex; flex-direction: column; gap: 8px; }
      .chk-btn-primary {
        display: flex; align-items: center; justify-content: center; gap: 8px;
        width: 100%; padding: clamp(13px,1.7vw,15px) 20px;
        background: var(--accent); color: var(--accent-fg);
        border: none; border-radius: var(--r-md);
        font-size: clamp(13px,1.4vw,14px); font-weight: 700; letter-spacing: -0.01em;
        cursor: pointer; font-family: inherit; text-decoration: none;
        transition: background 0.18s var(--ease), transform 0.15s var(--ease),
                    box-shadow 0.18s var(--ease), opacity 0.18s;
        box-shadow: 0 2px 8px rgba(0,0,0,0.14);
      }
      .chk-btn-primary:hover:not(:disabled) { background: #1a1a1a; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
      .chk-btn-primary:active:not(:disabled) { transform: translateY(0); }
      .chk-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
      .chk-btn-ghost {
        display: flex; align-items: center; justify-content: center; gap: 8px;
        width: 100%; padding: clamp(11px,1.5vw,13px) 20px;
        background: transparent; color: var(--fg-2);
        border: 1.5px solid var(--border); border-radius: var(--r-md);
        font-size: clamp(12px,1.3vw,13px); font-weight: 600; letter-spacing: -0.01em;
        cursor: pointer; font-family: inherit;
        transition: border-color 0.18s, color 0.18s, background 0.18s, opacity 0.18s;
      }
      .chk-btn-ghost:hover:not(:disabled) { border-color: var(--fg); color: var(--fg); background: var(--bg); }
      .chk-btn-ghost:disabled { opacity: 0.38; cursor: not-allowed; }

      /* ── Error ── */
      .chk-error {
        display: flex; align-items: flex-start; gap: 8px;
        margin-top: 10px; padding: 11px 13px;
        background: var(--red-bg); border: 1px solid var(--red-border);
        border-radius: var(--r-sm); font-size: 12px; color: var(--red); line-height: 1.45;
      }
      .chk-error svg { flex-shrink: 0; margin-top: 1px; }

      /* ── Bottom Sheet ── */
      .chk-sheet-backdrop {
        position: fixed; inset: 0; z-index: 100;
        background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
        display: flex; align-items: flex-end; justify-content: center;
      }
      .chk-sheet {
        width: min(100%, 580px); background: var(--surface);
        border-radius: 22px 22px 0 0;
        padding: 10px 20px calc(20px + env(safe-area-inset-bottom, 0px));
        box-shadow: 0 -12px 40px rgba(0,0,0,0.18);
        animation: chk-sheet-up 0.28s var(--ease) both;
      }
      .chk-sheet-handle {
        width: 40px; height: 4px; border-radius: 2px;
        background: var(--border); margin: 0 auto 18px;
      }
      .chk-sheet-icon-wrap { display: flex; justify-content: center; margin-bottom: 14px; }
      .chk-sheet-icon {
        width: 52px; height: 52px; border-radius: 50%;
        background: var(--red-bg); border: 1px solid var(--red-border);
        display: flex; align-items: center; justify-content: center; color: var(--red);
      }
      .chk-sheet-title {
        font-size: 17px; font-weight: 800; color: var(--fg);
        letter-spacing: -0.03em; text-align: center; margin: 0 0 8px;
      }
      .chk-sheet-msg {
        font-size: 13px; color: var(--fg-2); line-height: 1.55;
        text-align: center; margin: 0 0 20px;
      }
      .chk-sheet-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

      /* ── Success ── */
      .chk-success {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        text-align: center; min-height: 100svh; padding: 40px 24px;
        animation: chk-fade-up 0.5s var(--ease) both;
      }
      .chk-success-ring {
        padding: 6px; border-radius: 50%; border: 1px solid var(--border);
        margin-bottom: 24px; animation: chk-scale-in 0.5s var(--ease) both;
      }
      .chk-success-icon {
        width: 72px; height: 72px; border-radius: 50%;
        background: var(--fg); color: var(--accent-fg);
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      }
      .chk-success-title {
        font-size: clamp(28px,4.5vw,40px); font-weight: 900;
        color: var(--fg); letter-spacing: -0.05em; margin: 0 0 10px;
      }
      .chk-success-sub { font-size: clamp(13px,1.6vw,15px); color: var(--fg-2); margin: 0 0 8px; }
      .chk-success-id {
        font-weight: 800; color: var(--fg); font-family: 'Courier New', monospace;
        background: var(--bg); padding: 2px 8px; border-radius: 5px; border: 1px solid var(--border);
      }
      .chk-success-note {
        font-size: clamp(11px,1.2vw,13px); color: var(--fg-3);
        max-width: 280px; line-height: 1.6; margin: 0;
      }
      .chk-success-cta { width: auto !important; margin-top: 24px; padding: 13px 32px !important; }

      /* ── Animations ── */
      @keyframes chk-fade-up {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes chk-scale-in {
        from { opacity: 0; transform: scale(0.7); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes chk-sheet-up {
        from { transform: translateY(24px); opacity: 0; }
        to   { transform: translateY(0); opacity: 1; }
      }
      @keyframes chk-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      @keyframes chk-rotate { to { transform: rotate(360deg); } }
      .chk-spin { animation: chk-rotate 0.7s linear infinite; }
    `}</style>
  );
}