"use client";

import type { CartItem } from "@/types/cart";
import type { CheckoutMeta } from "@/types/cart";
import { getCanQuantityFromItems } from "@/lib/cart-cans";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

interface CartState {
  items: CartItem[];
  checkoutMeta: CheckoutMeta;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDelivery: (
    productId: string,
    deliveryDate: string,
    timeSlot: string,
  ) => void;
  setCheckoutMeta: (meta: Partial<CheckoutMeta>) => void;
  clearCart: () => void;
}

const CART_STORAGE_KEY = "wf-cart-store";
const CART_PERSIST_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type TtlEnvelope = {
  expiresAt: number;
  value: string;
};

const cartStateStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(name);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as TtlEnvelope;
      if (!parsed.expiresAt || Date.now() > parsed.expiresAt) {
        window.localStorage.removeItem(name);
        return null;
      }
      return parsed.value;
    } catch {
      window.localStorage.removeItem(name);
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    const payload: TtlEnvelope = {
      expiresAt: Date.now() + CART_PERSIST_TTL_MS,
      value,
    };
    window.localStorage.setItem(name, JSON.stringify(payload));
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(name);
  },
};

function resetAckIfCanQtyChanged(
  prevItems: CartItem[],
  nextItems: CartItem[],
): Pick<CheckoutMeta, "returnedCansPromptAcknowledged"> | undefined {
  const prev = getCanQuantityFromItems(prevItems);
  const next = getCanQuantityFromItems(nextItems);
  if (prev !== next) return { returnedCansPromptAcknowledged: false };
  return undefined;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
  items: [],
  checkoutMeta: {
    paymentMethod: "COD",
    returnedCanCount: 0,
    returnedCansPromptAcknowledged: false,
  },
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (entry) => entry.product.id === item.product.id,
      );
      const nextItems = existing
        ? state.items.map((entry) =>
            entry.product.id === item.product.id
              ? { ...entry, quantity: entry.quantity + item.quantity }
              : entry,
          )
        : [...state.items, item];
      const canQty = getCanQuantityFromItems(nextItems);
      const ackPatch = resetAckIfCanQtyChanged(state.items, nextItems);
      if (existing) {
        return {
          items: nextItems,
          checkoutMeta: {
            ...state.checkoutMeta,
            ...ackPatch,
            returnedCanCount: Math.min(
              state.checkoutMeta.returnedCanCount,
              canQty,
            ),
          },
        };
      }
      return {
        items: nextItems,
        checkoutMeta: {
          ...state.checkoutMeta,
          ...ackPatch,
          returnedCanCount: Math.min(
            state.checkoutMeta.returnedCanCount,
            canQty,
          ),
        },
      };
    }),
  removeItem: (productId) =>
    set((state) => {
      const nextItems = state.items.filter(
        (item) => item.product.id !== productId,
      );
      const canQty = getCanQuantityFromItems(nextItems);
      const ackPatch = resetAckIfCanQtyChanged(state.items, nextItems);
      return {
        items: nextItems,
        checkoutMeta: {
          ...state.checkoutMeta,
          ...ackPatch,
          returnedCanCount: Math.min(
            state.checkoutMeta.returnedCanCount,
            canQty,
          ),
        },
      };
    }),
  updateQuantity: (productId, quantity) =>
    set((state) => {
      const nextItems = state.items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item,
      );
      const canQty = getCanQuantityFromItems(nextItems);
      const ackPatch = resetAckIfCanQtyChanged(state.items, nextItems);
      return {
        items: nextItems,
        checkoutMeta: {
          ...state.checkoutMeta,
          ...ackPatch,
          returnedCanCount: Math.min(
            state.checkoutMeta.returnedCanCount,
            canQty,
          ),
        },
      };
    }),
  setDelivery: (productId, deliveryDate, timeSlot) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId
          ? { ...item, deliveryDate, timeSlot }
          : item,
      ),
    })),
  setCheckoutMeta: (meta) =>
    set((state) => ({
      checkoutMeta: {
        ...state.checkoutMeta,
        ...meta,
        returnedCanCount: Math.max(
          0,
          Math.min(
            meta.returnedCanCount ?? state.checkoutMeta.returnedCanCount,
            getCanQuantityFromItems(state.items),
          ),
        ),
      },
    })),
  clearCart: () =>
    set({
      items: [],
      checkoutMeta: {
        paymentMethod: "COD",
        returnedCanCount: 0,
        returnedCansPromptAcknowledged: false,
      },
    }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => cartStateStorage),
    },
  ),
);
