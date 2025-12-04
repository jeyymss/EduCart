export type TradeUserType = "Purchases" | "Sales";
export type TradeStatus =
  | "active"
  | "Accepted"
  | "Paid"
  | "PickedUp"
  | "Received"
  | "Completed"
  | "Cancelled"
  | string;

export function computeTradeActionLabel(
  type: TradeUserType,
  status?: TradeStatus,
  paymentMethod?: string // nullable now
): string {
  if (!status) return "";
  const s = status.toLowerCase();

  const isCash = paymentMethod === "Cash on Hand";
  const isOnline = paymentMethod === "Online Payment";
  const noPayment = !paymentMethod; // ⭐ pure trade (no added cash)

  // ===================================================================
  // BUYER VIEW
  // ===================================================================
  if (type === "Purchases") {

    // ⭐ PURE TRADE (NO CASH ADDED, NO PAYMENT METHOD)
    if (noPayment) {
      if (s === "accepted") return "Confirm Item Received";
      if (s === "received") return "Waiting for Seller";
      if (s === "completed") return "Completed";
      if (s === "cancelled") return "Cancelled";
      return "";
    }

    // ⭐ TRADE — CASH ON HAND (MEETUP)
    if (isCash) {
      if (s === "accepted") return "Confirm Item Received";
      if (s === "received") return "Waiting for Seller";
      if (s === "completed") return "Completed";
      if (s === "cancelled") return "Cancelled";
      return "";
    }

    // ⭐ TRADE — ONLINE PAYMENT (Buyer pays cash top-up first)
    if (isOnline) {
      if (s === "accepted") return "Pay Now";
      if (s === "paid") return "Waiting for Seller";
      if (s === "pickedup") return "Confirm Exchange";
      if (s === "completed") return "Completed";
      if (s === "cancelled") return "Cancelled";
      return "";
    }
  }

  // ===================================================================
  // SELLER VIEW
  // ===================================================================
  if (type === "Sales") {

    // ⭐ PURE TRADE (NO PAYMENT METHOD)
    if (noPayment) {
      if (s === "accepted") return "Waiting for Buyer";
      if (s === "received") return "Confirm Item Received";
      if (s === "completed") return "Completed";
      if (s === "cancelled") return "Cancelled";
      return "";
    }

    // ⭐ TRADE — CASH ON HAND
    if (isCash) {
      if (s === "accepted") return "Waiting for Buyer";
      if (s === "received") return "Confirm Item Received";
      if (s === "completed") return "Completed";
      if (s === "cancelled") return "Cancelled";
      return "";
    }

    // ⭐ TRADE — ONLINE PAYMENT
    if (isOnline) {
      if (s === "paid") return "Mark as Exchanged";
      if (s === "pickedup") return "On Hold";
      if (s === "completed") return "Completed";
      if (s === "cancelled") return "Cancelled";
      return "";
    }
  }

  return "";
}
