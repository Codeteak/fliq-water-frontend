/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getCanQuantityFromItems } from "@/lib/cart-cans";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

type ReturnedCansPromptProps = {
  /** When false, the prompt never opens. */
  enabled?: boolean;
};

export function ReturnedCansPrompt({
  enabled = true,
}: ReturnedCansPromptProps) {
  // Prevent SSR/first-hydration mismatches due to Zustand state and viewport detection.
  const [mounted, setMounted] = useState(false);

  const items = useCartStore((state) => state.items);
  const returnedCanCount = useCartStore(
    (state) => state.checkoutMeta.returnedCanCount ?? 0,
  );
  const returnedCansPromptAcknowledged = useCartStore(
    (state) => state.checkoutMeta.returnedCansPromptAcknowledged === true,
  );
  const setCheckoutMeta = useCartStore((state) => state.setCheckoutMeta);

  const isMobile = useIsMobile();
  const canQuantity = getCanQuantityFromItems(items);
  const showPrompt =
    enabled &&
    items.length > 0 &&
    canQuantity > 0 &&
    !returnedCansPromptAcknowledged;

  useEffect(() => {
    setMounted(true);
  }, []);

  const [open, setOpen] = useState(showPrompt);
  const [draft, setDraft] = useState(() =>
    Math.min(returnedCanCount, canQuantity),
  );
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (!showPrompt) {
      setOpen(false);
      return;
    }
    setOpen(true);
  }, [showPrompt]);

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setDraft(Math.min(returnedCanCount, canQuantity));
    }
    prevOpenRef.current = open;
  }, [open, returnedCanCount, canQuantity]);

  useEffect(() => {
    setDraft((d) => Math.min(d, canQuantity));
  }, [canQuantity]);

  const persistAndClose = (next: number) => {
    const clamped = Math.max(0, Math.min(next, canQuantity));
    setCheckoutMeta({
      returnedCanCount: clamped,
      returnedCansPromptAcknowledged: true,
    });
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setOpen(true);
      return;
    }
    if (showPrompt) {
      persistAndClose(draft);
    } else {
      setOpen(false);
    }
  };

  const stepper = (
    <div className="flex flex-col gap-4 py-2">
      <p className="text-muted-foreground text-sm">
        You are ordering{" "}
        <span className="text-foreground font-medium">
          {canQuantity} refill can{canQuantity !== 1 ? "s" : ""}
        </span>
        . How many empty 20L cans will you hand back? You can choose up to{" "}
        {canQuantity} — the same as your can quantity in this order.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-full"
          aria-label="Fewer returned cans"
          disabled={draft <= 0}
          onClick={() => setDraft((d) => Math.max(0, d - 1))}
        >
          −
        </Button>
        <div className="min-w-[4.5rem] text-center">
          <p className="text-3xl leading-none font-semibold tabular-nums">
            {draft}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            empty can{draft !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-full"
          aria-label="More returned cans"
          disabled={draft >= canQuantity}
          onClick={() => setDraft((d) => Math.min(canQuantity, d + 1))}
        >
          +
        </Button>
      </div>
    </div>
  );

  const footerActions = (
    <>
      <Button
        type="button"
        variant="outline"
        className={cn(!isMobile && "sm:flex-1")}
        onClick={() => persistAndClose(0)}
      >
        No empty cans
      </Button>
      <Button
        type="button"
        className={cn(!isMobile && "sm:flex-1")}
        onClick={() => persistAndClose(draft)}
      >
        Continue
      </Button>
    </>
  );

  const headerIcon = (
    <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
      <RotateCcw
        className="text-foreground h-6 w-6"
        strokeWidth={1.8}
        aria-hidden
      />
    </div>
  );

  if (!mounted) return null;
  if (!showPrompt) return null;
  if (!isMobile) return null;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton
        className="rounded-t-2xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="items-center gap-3 text-center sm:text-center">
          {headerIcon}
          <SheetTitle className="text-lg">Returning empty cans?</SheetTitle>
          <SheetDescription className="text-left text-sm">
            Returning cans reduces your deposit on this order.
          </SheetDescription>
        </SheetHeader>
        {stepper}
        <SheetFooter className="flex-col gap-2 sm:flex-col">
          {footerActions}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
