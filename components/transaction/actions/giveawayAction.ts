export type GiveawayUserType = "Purchases" | "Sales";
export type GiveawayStatus =
  | "Pending"
  | "Accepted"
  | "PickedUp"
  | "Shipped"
  | "Completed"
  | "Cancelled";

export function computeGiveawayActionLabel(
  type: GiveawayUserType,
  status?: GiveawayStatus,
  fulfillmentMethod?: string // "Delivery" | "Meetup"
): string {
  if (!status) return "";
  const s = status.toLowerCase();

  // -------------------------------
  // BUYER VIEW
  // -------------------------------
  if (type === "Purchases") {
    if (s === "pickedup") return "Received";
    if (s === "shipped") return "Received";
    if (s === "completed") return "Completed";
    return "";
  }

  // -------------------------------
  // SELLER VIEW
  // -------------------------------
  if (type === "Sales") {
    // Accepted → Seller chooses based on method
    if (s === "accepted") {
      if (fulfillmentMethod === "Meetup") return "Item PickedUp";
      if (fulfillmentMethod === "Delivery") return "Shipped";
    }

    if (s === "completed") return "Completed";
    return "";
  }

  return "";
}
