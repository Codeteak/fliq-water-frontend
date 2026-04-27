"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Check,
  ChevronDown,
  CircleUserRound,
  Mail,
  MapPinned,
  Package,
  Phone,
  ShoppingBag,
  Truck,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { trackOrder } from "@/features/orders/api";
import { useAuth } from "@/hooks/use-auth";
import type { Order, OrderStatus } from "@/types/order";

function resolveDeliveryPartner(order: Order | null) {
  const o = order as unknown as Record<string, unknown> | null;
  if (!o)
    return {
      name: undefined as string | undefined,
      phone: undefined as string | undefined,
    };

  const nestedCandidates = [
    o.deliveryPartner,
    o.assignedDeliveryPartner,
    o.partner,
    o.driver,
    o.courier,
    o.assignedDriver,
  ].filter(Boolean);

  for (const cand of nestedCandidates) {
    if (!cand || typeof cand !== "object") continue;
    const c = cand as Record<string, unknown>;

    const name =
      (typeof c.name === "string" && c.name.trim()) ||
      (typeof c.fullName === "string" && c.fullName.trim()) ||
      (typeof c.driverName === "string" && c.driverName.trim()) ||
      (typeof c.partnerName === "string" && c.partnerName.trim()) ||
      (typeof c.userName === "string" && c.userName.trim()) ||
      (typeof c.username === "string" && c.username.trim());

    const phone =
      (typeof c.phone === "string" && c.phone.trim()) ||
      (typeof c.mobile === "string" && c.mobile.trim()) ||
      (typeof c.phoneNumber === "string" && c.phoneNumber.trim()) ||
      (typeof c.contact === "string" && c.contact.trim()) ||
      (typeof c.driverPhone === "string" && c.driverPhone.trim()) ||
      (typeof c.partnerPhone === "string" && c.partnerPhone.trim());

    if (typeof name === "string" || typeof phone === "string") {
      return {
        name: typeof name === "string" ? name : undefined,
        phone: typeof phone === "string" ? phone : undefined,
      };
    }
  }

  const flatName =
    o.deliveryPartnerName ?? o.driverName ?? o.partnerName ?? o.courierName;
  const flatPhone =
    o.deliveryPartnerPhone ?? o.driverPhone ?? o.partnerPhone ?? o.courierPhone;

  return {
    name: typeof flatName === "string" ? flatName : undefined,
    phone: typeof flatPhone === "string" ? flatPhone : undefined,
  };
}

function resolveShippingAddress(order: Order | null) {
  const o = order as unknown as Record<string, unknown> | null;
  if (!o) return null;

  const nestedCandidates = [
    o.shippingAddress,
    o.deliveryAddress,
    o.address,
    o.orderAddress,
    o.billingAddress,
    o.customerAddress,
    o.deliverTo,
  ].filter(Boolean);

  for (const cand of nestedCandidates) {
    if (!cand || typeof cand !== "object") continue;
    const a = cand as Record<string, unknown>;

    const line1 =
      (typeof a.line1 === "string" && a.line1.trim()) ||
      (typeof a.addressLine1 === "string" && a.addressLine1.trim()) ||
      (typeof a.street === "string" && a.street.trim());
    const city =
      (typeof a.city === "string" && a.city.trim()) ||
      (typeof a.town === "string" && a.town.trim());
    const state =
      (typeof a.state === "string" && a.state.trim()) ||
      (typeof a.region === "string" && a.region.trim());
    const pincode =
      (typeof a.pincode === "string" && a.pincode.trim()) ||
      (typeof a.pinCode === "string" && a.pinCode.trim()) ||
      (typeof a.postalCode === "string" && a.postalCode.trim());
    const phone =
      (typeof a.phone === "string" && a.phone.trim()) ||
      (typeof a.mobile === "string" && a.mobile.trim()) ||
      (typeof a.phoneNumber === "string" && a.phoneNumber.trim());

    if (line1 || city || state || pincode || phone) {
      return { line1, city, state, pincode, phone };
    }
  }

  // Flattened fallback keys
  const flatLine1 =
    (typeof o.line1 === "string" && o.line1.trim()) ||
    (typeof o.addressLine1 === "string" && o.addressLine1.trim());
  const flatCity = typeof o.city === "string" ? o.city.trim() : undefined;
  const flatState = typeof o.state === "string" ? o.state.trim() : undefined;
  const flatPincode =
    typeof o.pincode === "string" ? o.pincode.trim() : undefined;
  const flatPhone = typeof o.phone === "string" ? o.phone.trim() : undefined;

  if (flatLine1 || flatCity || flatState || flatPincode || flatPhone) {
    return {
      line1: flatLine1,
      city: flatCity,
      state: flatState,
      pincode: flatPincode,
      phone: flatPhone,
    };
  }

  return null;
}

function resolveCustomerDetails(order: Order | null) {
  const o = order as unknown as Record<string, unknown> | null;
  if (!o) return null;

  const nestedCandidates = [
    o.customer,
    o.user,
    o.profile,
    o.customerInfo,
    o.orderCustomer,
    o.orderUser,
  ].filter(Boolean);

  for (const cand of nestedCandidates) {
    if (!cand || typeof cand !== "object") continue;
    const c = cand as Record<string, unknown>;

    const name =
      (typeof c.name === "string" && c.name.trim()) ||
      (typeof c.fullName === "string" && c.fullName.trim()) ||
      (typeof c.userName === "string" && c.userName.trim()) ||
      (typeof c.username === "string" && c.username.trim());

    const email =
      (typeof c.email === "string" && c.email.trim()) ||
      (typeof c.mail === "string" && c.mail.trim()) ||
      (typeof c.contactEmail === "string" && c.contactEmail.trim());

    const phone =
      (typeof c.phone === "string" && c.phone.trim()) ||
      (typeof c.mobile === "string" && c.mobile.trim()) ||
      (typeof c.phoneNumber === "string" && c.phoneNumber.trim()) ||
      (typeof c.contact === "string" && c.contact.trim());

    if (name || email || phone) {
      return {
        name: typeof name === "string" ? name : undefined,
        email: typeof email === "string" ? email : undefined,
        phone: typeof phone === "string" ? phone : undefined,
      };
    }
  }

  const flatName =
    (typeof o.customerName === "string" && o.customerName.trim()) ||
    (typeof o.userName === "string" && o.userName.trim()) ||
    (typeof o.name === "string" && o.name.trim()) ||
    (typeof o.fullName === "string" && o.fullName.trim());

  const flatEmail =
    (typeof o.customerEmail === "string" && o.customerEmail.trim()) ||
    (typeof o.email === "string" && o.email.trim()) ||
    (typeof o.userEmail === "string" && o.userEmail.trim());

  const flatPhone =
    (typeof o.customerPhone === "string" && o.customerPhone.trim()) ||
    (typeof o.phone === "string" && o.phone.trim()) ||
    (typeof o.mobile === "string" && o.mobile.trim()) ||
    (typeof o.userPhone === "string" && o.userPhone.trim());

  if (flatName || flatEmail || flatPhone) {
    return {
      name: typeof flatName === "string" ? flatName : undefined,
      email: typeof flatEmail === "string" ? flatEmail : undefined,
      phone: typeof flatPhone === "string" ? flatPhone : undefined,
    };
  }

  return null;
}

const TRACK_STEPS: Array<{
  key: Exclude<OrderStatus, "CANCELLED">;
  label: string;
  icon: ReactNode;
}> = [
  {
    key: "RECEIVED",
    label: "Received",
    icon: <ShoppingBag className="size-4" />,
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    icon: <CheckCircle2 className="size-4" />,
  },
  {
    key: "PACKED",
    label: "Packed",
    icon: <Package className="size-4" />,
  },
  {
    key: "DISPATCHED",
    label: "Dispatched",
    icon: <Truck className="size-4" />,
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    icon: <Check className="size-4" />,
  },
];

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const { userName } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params?.id) return;
    void trackOrder(params.id)
      .then((data) => {
        setOrder(data);
        setError("");
      })
      .catch(() => setError("Unable to load order details"))
      .finally(() => setLoading(false));
  }, [params?.id]);

  const progressIndex = useMemo(() => {
    if (!order) return 0;
    if (order.status === "CANCELLED") return 0;
    const idx = TRACK_STEPS.findIndex((s) => s.key === order.status);
    return idx === -1 ? 0 : idx;
  }, [order]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mx-auto max-w-5xl space-y-3">
          <div className="bg-muted h-6 w-40 animate-pulse rounded" />
          <div className="bg-muted h-20 animate-pulse rounded-xl" />
          <div className="bg-muted h-44 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order || error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-muted-foreground mx-auto max-w-3xl rounded-xl border border-dashed p-6 text-sm">
          {error || "Order not found."}
          <div className="mt-3">
            <Link
              href="/orders"
              className="text-primary underline underline-offset-4"
            >
              Back to orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = Math.max(order.totalAmount - order.depositCharge, 0);
  const created = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const partner = resolveDeliveryPartner(order);
  const shipping = resolveShippingAddress(order);
  const customer = resolveCustomerDetails(order);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium">
            Order ID : {order.id}
          </p>
          {order.status === "CANCELLED" ? (
            <p className="flex items-center gap-2 text-sm text-red-600">
              <XCircle className="size-4" />
              This order was cancelled.
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              Tracking status updated. Current:{" "}
              <span className="text-foreground font-medium">
                {order.status}
              </span>
            </p>
          )}
        </div>

        <div className="rounded-xl border p-4">
          <style>{`
            @keyframes orderTrackProgressExpand {
              from { width: 0%; }
              to { width: var(--target-width); }
            }
            .chk-progress-animate {
              width: 0%;
              animation: orderTrackProgressExpand 700ms ease-out both;
            }
          `}</style>
          <div className="relative py-3">
            <div className="bg-muted absolute top-7 right-0 left-0 h-1.5 rounded-full">
              {(() => {
                const denom = Math.max(1, TRACK_STEPS.length - 1);
                const targetPct =
                  order.status === "CANCELLED"
                    ? 0
                    : (progressIndex / denom) * 100;
                return (
                  <div
                    key={order.status}
                    className={`h-full rounded-full ${
                      order.status === "CANCELLED"
                        ? "bg-red-500"
                        : "bg-emerald-500"
                    } chk-progress-animate`}
                    style={
                      {
                        ["--target-width" as unknown as string]: `${targetPct}%`,
                      } as CSSProperties
                    }
                  />
                );
              })()}
            </div>

            <div className="relative flex items-start justify-between gap-2">
              {TRACK_STEPS.map((step, index) => {
                const done =
                  order.status !== "CANCELLED"
                    ? index < progressIndex
                    : index === 0;
                const current =
                  order.status !== "CANCELLED" && index === progressIndex;

                return (
                  <div
                    key={step.key}
                    className="flex w-full flex-col items-center text-center"
                  >
                    <div className="relative z-10 flex items-center justify-center">
                      <div
                        className={[
                          "flex size-9 items-center justify-center rounded-full border",
                          done
                            ? "border-emerald-500 bg-emerald-600 text-white"
                            : current
                              ? "border-sky-500 bg-sky-600 text-white"
                              : "border-border bg-background text-muted-foreground",
                        ].join(" ")}
                      >
                        {done ? (
                          <Check className="size-4" />
                        ) : (
                          <span className={current ? "animate-pulse" : ""}>
                            {step.icon}
                          </span>
                        )}
                      </div>

                      {current && (
                        <span className="pointer-events-none absolute inset-0 m-auto size-9 animate-ping rounded-full border border-sky-400/70" />
                      )}
                    </div>
                    <p
                      className={[
                        "mt-2 text-xs font-medium",
                        done
                          ? "text-emerald-700"
                          : current
                            ? "text-sky-700"
                            : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <Card className="rounded-xl border py-0">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Delivery Partner</h4>
            </div>

            {partner.name ? (
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <Truck className="size-4" />
                {partner.name}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                Partner not assigned yet
              </p>
            )}

            {partner.phone ? (
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <Phone className="size-4" />
                {partner.phone}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-xl border py-0">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-start gap-3">
              <div className="bg-muted flex size-20 items-center justify-center rounded-lg">
                <ShoppingBag className="text-muted-foreground size-8" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Order item</p>
                <h2 className="text-xl font-semibold">Water Delivery</h2>
                <p className="text-muted-foreground text-sm">
                  Status: {order.status}
                </p>
              </div>
            </div>
            <p className="text-lg font-semibold">
              Rs. {order.totalAmount.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border py-0">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Order Summary</h3>
              <ChevronDown className="text-muted-foreground size-4" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Deposit Base</span>
                <span>Rs. {order.depositBase.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Deposit Discount</span>
                <span>- Rs. {order.depositDiscount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Deposit Charge</span>
                <span>Rs. {order.depositCharge.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
                <span>Total</span>
                <span>Rs. {order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card className="rounded-xl border py-0">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Customer</h4>
                <ChevronDown className="text-muted-foreground size-4" />
              </div>
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <CircleUserRound className="size-4" />
                {customer?.name || userName || "Customer"}
              </p>
              <p className="text-muted-foreground text-xs">
                Ordered on {created}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border py-0">
            <CardContent className="space-y-3 p-4">
              <h4 className="font-semibold">Customer Information</h4>
              {customer?.email ? (
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Mail className="size-4" />
                  {customer.email}
                </p>
              ) : null}
              {customer?.phone ? (
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Phone className="size-4" />
                  {customer.phone}
                </p>
              ) : null}
              {!customer?.email && !customer?.phone ? (
                <p className="text-muted-foreground text-sm">
                  Customer contact not available.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-xl border py-0">
            <CardContent className="space-y-3 p-4">
              <h4 className="font-semibold">Shipping Address</h4>
              {shipping ? (
                <>
                  <p className="text-muted-foreground flex items-start gap-2 text-sm">
                    <MapPinned className="mt-0.5 size-4 shrink-0" />
                    <span>
                      {shipping.line1 ? shipping.line1 : null}
                      {shipping.line1 && (shipping.city || shipping.state)
                        ? ", "
                        : null}
                      {shipping.city ? shipping.city : null}
                      {shipping.city && shipping.state
                        ? `, ${shipping.state}`
                        : null}
                      {shipping.pincode ? ` - ${shipping.pincode}` : null}
                    </span>
                  </p>
                  {shipping.phone ? (
                    <p className="text-muted-foreground text-xs">
                      Phone: {shipping.phone}
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="text-muted-foreground flex items-start gap-2 text-sm">
                    <MapPinned className="mt-0.5 size-4 shrink-0" />
                    Address selected during checkout.
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Billing address same as shipping address.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
