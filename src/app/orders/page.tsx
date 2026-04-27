"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, ChevronRight, Download, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listMyOrders, trackOrder } from "@/features/orders/api";
import type { Order } from "@/types/order";

type OrdersTab = "all" | "summary" | "completed" | "cancelled";

function OrderCardSkeleton() {
  return (
    <Card className="rounded-xl border py-0">
      <CardContent className="p-0">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-4 w-36 animate-pulse rounded bg-muted" />
            <div className="h-3 w-44 animate-pulse rounded bg-muted" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div className="flex items-start gap-3">
            <div className="size-20 animate-pulse rounded-lg bg-muted" />
            <div className="space-y-2">
              <div className="h-5 w-40 animate-pulse rounded bg-muted" />
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-14 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          <div className="h-9 w-24 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<OrdersTab>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrateOrders = async () => {
      try {
        const baseOrders = await listMyOrders();
        setOrders(baseOrders);

        // /orders/my may not include item images; enrich with /orders/:id/track
        const detailedOrders = await Promise.all(
          baseOrders.map(async (order) => {
            try {
              const detailed = await trackOrder(order.id);
              return detailed.items?.length ? { ...order, items: detailed.items } : order;
            } catch {
              return order;
            }
          }),
        );

        setOrders(detailedOrders);
      } finally {
        setLoading(false);
      }
    };

    void hydrateOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const date = new Date(order.createdAt);
    const byFrom = fromDate ? date >= new Date(`${fromDate}T00:00:00`) : true;
    const byTo = toDate ? date <= new Date(`${toDate}T23:59:59`) : true;
    if (!(byFrom && byTo)) return false;

    if (activeTab === "completed") return order.status === "DELIVERED";
    if (activeTab === "cancelled") return order.status === "CANCELLED";
    if (activeTab === "summary") return order.status !== "CANCELLED";
    return true;
  });

  const statusClass = (status: Order["status"]) => {
    if (status === "DELIVERED") return "text-emerald-600";
    if (status === "CANCELLED") return "text-red-600";
    return "text-amber-600";
  };

  const formatDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "NA";
    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getOrderImageUrls = (order: Order): string[] => {
    const urls =
      order.items?.flatMap((item) => [
        item.imageUrl,
        item.product?.imageUrl,
        item.product?.photoUrl,
        ...(item.product?.photoUrls ?? []),
      ]) ?? [];
    const seen = new Set<string>();
    return urls.filter((value): value is string => {
      if (!value || seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold sm:text-3xl">Order History</h1>
          <p className="text-sm text-muted-foreground">Track your placed orders and payment summary.</p>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="min-w-0 flex-1">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OrdersTab)} className="w-full">
              <TabsList
                variant="line"
                className="scrollbar-hide h-11 w-full min-w-0 max-w-full flex-nowrap justify-start gap-0 overflow-x-auto overflow-y-hidden rounded-none border-0 bg-transparent p-0 sm:h-10 lg:overflow-x-visible lg:overflow-y-visible"
              >
                <TabsTrigger value="all" className="h-11 shrink-0 px-3 text-sm sm:h-10 lg:min-w-0 lg:flex-1 lg:justify-center">
                  All Order
                </TabsTrigger>
                <TabsTrigger value="summary" className="h-11 shrink-0 px-3 text-sm sm:h-10 lg:min-w-0 lg:flex-1 lg:justify-center">
                  Summary
                </TabsTrigger>
                <TabsTrigger value="completed" className="h-11 shrink-0 px-3 text-sm sm:h-10 lg:min-w-0 lg:flex-1 lg:justify-center">
                  Completed
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="h-11 shrink-0 px-3 text-sm sm:h-10 lg:min-w-0 lg:flex-1 lg:justify-center">
                  Cancelled
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 lg:w-auto lg:max-w-none">
            <div className="relative min-w-0 flex-1 sm:min-w-[150px] sm:flex-initial lg:w-[158px]">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                aria-label="From date"
                className="h-11 w-full min-w-0 pl-9 sm:h-10"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <span className="hidden shrink-0 self-center px-1 text-center text-xs font-medium tabular-nums text-muted-foreground sm:inline">
              To
            </span>
            <div className="relative min-w-0 flex-1 sm:min-w-[150px] sm:flex-initial lg:w-[158px]">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                aria-label="To date"
                className="h-11 w-full min-w-0 pl-9 sm:h-10"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="rounded-xl border border-dashed py-0">
            <CardContent className="p-6 text-sm text-muted-foreground">No orders found for this filter.</CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="rounded-xl border py-0">
                <CardContent className="p-0">
                  <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold">Order : #{order.id}</p>
                      <p className="text-muted-foreground">Order Payment : {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="h-9">
                        <Download className="size-4" />
                        Show Invoice
                      </Button>
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex h-9 min-w-[110px] items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                      >
                        View Detail
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                    <div className="flex items-start gap-3">
                      <div className="w-full space-y-2">
                        {order.items && order.items.length > 0 ? (
                          order.items.slice(0, 3).map((item, index) => {
                            const itemName = item.productName ?? item.product?.name ?? "Product";
                            const itemImage =
                              item.imageUrl ??
                              item.product?.imageUrl ??
                              item.product?.photoUrl ??
                              item.product?.photoUrls?.[0];
                            return (
                              <div key={`${order.id}-${item.productId ?? index}`} className="flex items-center gap-2 rounded-md border p-2">
                                <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                                  {itemImage ? (
                                    <Image
                                      src={itemImage}
                                      alt={itemName}
                                      fill
                                      sizes="40px"
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="flex size-full items-center justify-center">
                                      <ShoppingBag className="size-4 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold">{itemName}</p>
                                  <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex items-center gap-2 rounded-md border p-2">
                            <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                              <div className="flex size-full items-center justify-center">
                                <ShoppingBag className="size-4 text-muted-foreground" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">Order items</p>
                            </div>
                          </div>
                        )}
                        {order.items && order.items.length > 3 ? (
                          <p className="text-xs text-muted-foreground">+{order.items.length - 3} more item(s)</p>
                        ) : null}
                        <div className="pt-1 text-sm">
                          <p className="text-muted-foreground">Deposit: Rs. {order.depositCharge.toFixed(2)}</p>
                          <p className="font-semibold">Total: Rs. {order.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Status</p>
                      <p className={`font-semibold ${statusClass(order.status)}`}>{order.status}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Delivery Expected by</p>
                      <p className="font-semibold">{formatDate(order.updatedAt)}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <Button variant="ghost" className="h-9 justify-start px-0 text-muted-foreground hover:text-foreground">
                      Cancel order
                    </Button>
                    <p className="font-semibold">Total Price: Rs. {order.totalAmount.toFixed(2)}</p>
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
                    >
                      Open
                      <ChevronRight className="ml-1 size-4" />
                    </Link>
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
