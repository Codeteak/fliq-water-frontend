"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronRight,
  Home,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  User,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  isAuthenticated: boolean;
  signOut: () => void;
  user?: { name: string; email?: string };
  orderCount?: number;
}

const NAV_ITEMS = [
  { href: "/", label: "Home", sub: "Browse the store", icon: Home },
  { href: "/products", label: "Products", sub: "Explore catalogue", icon: ShoppingBag },
  { href: "/orders", label: "Orders", sub: "Track your orders", icon: Package },
  { href: "/account", label: "Account", sub: "Settings & profile", icon: User },
];

export function MobileNav({ isAuthenticated, signOut, user, orderCount }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="h-11 w-11" />}>
          <Menu className="h-5 w-5" />
        </SheetTrigger>

        <SheetContent side="left" className="flex w-[82vw] max-w-sm flex-col gap-0 p-0">
          <SheetHeader className="border-border/50 border-b px-6 pt-8 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="border-border/50 bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-full border">
                  <User className="text-muted-foreground h-4 w-4" />
                </div>
                {isAuthenticated && user ? (
                  <div>
                    <p className="text-[13px] leading-tight font-medium">{user.name}</p>
                    {user.email ? (
                      <p className="text-muted-foreground mt-0.5 text-[11px]">{user.email}</p>
                    ) : null}
                  </div>
                ) : (
                  <SheetTitle className="text-[15px] font-medium">Fliq</SheetTitle>
                )}
              </div>
            </div>
          </SheetHeader>

          <nav className="flex-1 px-4 pt-3 pb-2">
            <p className="text-muted-foreground mb-1 px-2 text-[10px] font-medium tracking-[1.2px] uppercase">
              Menu
            </p>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isOrders = item.href === "/orders";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="group hover:bg-muted/80 active:bg-muted mb-0.5 flex items-center gap-3.5 rounded-[10px] px-3 py-3.5 transition-colors"
                >
                  <div className="border-border/50 bg-muted group-hover:bg-background flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border transition-colors">
                    <Icon className="h-[15px] w-[15px]" strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] leading-tight font-medium">{item.label}</p>
                    <p className="text-muted-foreground mt-0.5 text-[11px]">{item.sub}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {isOrders && orderCount && orderCount > 0 ? (
                      <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-full px-2 py-0.5 text-[10px] font-medium">
                        {orderCount}
                      </span>
                    ) : null}
                    <ChevronRight className="text-muted-foreground/60 h-3.5 w-3.5" strokeWidth={2} />
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="border-border/50 border-t px-4 pt-2 pb-8">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="border-border/50 hover:bg-destructive/5 active:bg-destructive/10 group flex w-full items-center gap-3 rounded-[10px] border px-3 py-3 text-left transition-colors"
              >
                <div className="bg-destructive/10 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg">
                  <LogOut className="text-destructive h-[15px] w-[15px]" strokeWidth={1.8} />
                </div>
                <span className="text-destructive text-[15px] font-medium">Logout</span>
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="bg-foreground text-background hover:opacity-90 active:opacity-80 flex h-11 items-center justify-center rounded-[10px] text-[14px] font-medium transition-opacity"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setOpen(false)}
                  className="border-border/50 hover:bg-muted flex h-11 items-center justify-center rounded-[10px] border text-[14px] font-medium transition-colors"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
