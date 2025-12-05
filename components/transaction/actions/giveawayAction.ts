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
  fulfillmentMethod?: string
) {
  if (!status) return "";
  const s = status.toLowerCase();

  // BUYER VIEW
  if (type === "Purchases") {
    if (s === "accepted") return "Waiting for Pickup";
    if (s === "pickedup") return "Mark as Received";
    if (s === "shipped") return "Received";
    if (s === "completed") return "Completed";
    return "";
  }

  // SELLER VIEW
  if (type === "Sales") {
    if (s === "accepted") {
      if (fulfillmentMethod === "Meetup") return "Mark as Picked Up";
      if (fulfillmentMethod === "Delivery") return "Mark as Shipped";
    }

    if (s === "pickedup") return "Waiting for Buyer"; // seller waits for buyer
    if (s === "completed") return "Completed";
    return "";
  }

  return "";
}
