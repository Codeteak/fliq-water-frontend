import type { CartItem } from "@/types/cart";

/** Count of 20L / can line items in the cart (deposit-return flow). */
export function getCanQuantityFromItems(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const isCan =
      item.product.type === "CAN_20L" || (item.product.category ?? "").includes("20");
    return sum + (isCan ? item.quantity : 0);
  }, 0);
}
