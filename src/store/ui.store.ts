"use client";

import { create } from "zustand";

type ToastType = "success" | "error" | "info";

interface ToastState {
  type: ToastType;
  message: string;
}

interface UIState {
  isLoading: boolean;
  toast: ToastState | null;
  setLoading: (loading: boolean) => void;
  setToast: (toast: ToastState | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  toast: null,
  setLoading: (loading) => set({ isLoading: loading }),
  setToast: (toast) => set({ toast }),
}));
