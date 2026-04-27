"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleDollarSign, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listMyOrders } from "@/features/orders/api";
import { normalizeError } from "@/lib/error";
import type { Order } from "@/types/order";

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "NA";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DepositsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void listMyOrders()
      .then((data) => {
        setOrders(data);
        setError("");
      })
      .catch((err) => setError(normalizeError(err, "Unable to load deposits").message))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return orders
      .filter((order) => order.depositBase > 0 || order.depositCharge > 0 || order.depositDiscount > 0)
      .filter((order) => {
        if (!term) return true;
        return order.id.toLowerCase().includes(term) || order.status.toLowerCase().includes(term);
      });
  }, [orders, query]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, order) => {
        acc.base += order.depositBase;
        acc.discount += order.depositDiscount;
        acc.charge += order.depositCharge;
        return acc;
      },
      { base: 0, discount: 0, charge: 0 },
    );
  }, [rows]);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold sm:text-3xl">Deposits</h1>
          <p className="text-sm text-muted-foreground">
            Deposit amount details for your orders.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card className="rounded-xl py-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Deposit Base</p>
              <p className="mt-1 text-xl font-semibold">Rs. {totals.base.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl py-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Discount</p>
              <p className="mt-1 text-xl font-semibold text-emerald-600">Rs. {totals.discount.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl py-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Charged</p>
              <p className="mt-1 text-xl font-semibold text-sky-700">Rs. {totals.charge.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 pl-9"
            placeholder="Search by order id or status"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-xl bg-muted" />
            <div className="h-20 animate-pulse rounded-xl bg-muted" />
            <div className="h-20 animate-pulse rounded-xl bg-muted" />
          </div>
        ) : error ? (
          <Card className="rounded-xl border border-red-200 py-0">
            <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
          </Card>
        ) : rows.length === 0 ? (
          <Card className="rounded-xl border border-dashed py-0">
            <CardContent className="p-6 text-sm text-muted-foreground">
              No deposit entries found.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {rows.map((order) => (
              <Card key={order.id} className="rounded-xl py-0">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)} · {order.status}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-md bg-muted px-2.5 py-1.5 text-xs">
                      <CircleDollarSign className="size-4 text-sky-700" />
                      <span>{order.depositRefunded ? "Refunded" : "Not refunded"}</span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Deposit Base</p>
                      <p className="font-medium">Rs. {order.depositBase.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Discount</p>
                      <p className="font-medium text-emerald-600">Rs. {order.depositDiscount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Deposit Charge</p>
                      <p className="font-medium">Rs. {order.depositCharge.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Order Total</p>
                      <p className="font-medium">Rs. {order.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
