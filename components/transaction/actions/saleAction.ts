export function computeSaleActionLabel(
  type: "Purchases" | "Sales",
  status?: string,
  paymentMethod?: string,
  fulfillmentMethod?: string
) {
  if (!status) return "";
  const s = status.toLowerCase();

  // ------------------------------------------------------------
  // FLOW A — CASH ON HAND + MEETUP
  // ------------------------------------------------------------
  if (paymentMethod === "Cash on Hand" && fulfillmentMethod === "Meetup") {
    // BUYER VIEW
    if (type === "Purchases") {
      if (s === "accepted") return "Item Received";
      if (s === "completed") return "Completed";
      if (s === "cancelled") return "Cancelled";
      return "";
    }

    // SELLER VIEW
    if (type === "Sales") {
      if (s === "accepted") return "Waiting for Confirmation";
      if (s === "completed") return "Completed";
      if (s === "cancelled") return "Cancelled";
      return "";
    }
  }

  // ------------------------------------------------------------
  // FLOW C — ONLINE PAYMENT + MEETUP
  // ------------------------------------------------------------
  if (paymentMethod === "Online Payment" && fulfillmentMethod === "Meetup") {
    // BUYER VIEW
    if (type === "Purchases") {
      if (s === "paid") return "Item Received";
      if (s === "completed") return "Completed";
      if (s === "cancelled") return "Cancelled";
      return "";
    }

    // SELLER VIEW
    if (type === "Sales") {
      if (s === "paid") return "Waiting for Confirmation";
      if (s === "completed") return "Completed";
      if (s === "cancelled") return "Cancelled";
      return "";
    }
  }

  // ------------------------------------------------------------
  // FLOW B — ONLINE PAYMENT + DELIVERY  (Original Logic)
  // ------------------------------------------------------------
  if (paymentMethod === "Online Payment" && fulfillmentMethod === "Delivery") {
    // BUYER VIEW
    if (type === "Purchases") {
      if (s === "paid") return "Waiting for Delivery";
      if (s === "pickedup") return "Order Received";
      if (s === "completed") return "Completed";
      if (s === "cancelled") return "Cancelled";
      return "";
    }

    // SELLER VIEW
    if (type === "Sales") {
      if (s === "paid") return "Order Picked Up";
      if (s === "pickedup") return "On Hold";
      if (s === "completed") return "Completed";
      if (s === "cancelled") return "Cancelled";
      return "";
    }
  }

  return "";
}
