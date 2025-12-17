export function computePasaBuyActionLabel(
  type: "Purchases" | "Sales",
  status?: string,
  paymentMethod?: string,
  fulfillmentMethod?: string
) {
  if (!status) return "";
  const s = status.toLowerCase();

  // ------------------------------------------------------------
  // ONLINE PAYMENT + DELIVERY
  // ------------------------------------------------------------
  if (paymentMethod === "Online Payment" && fulfillmentMethod === "Delivery") {
    // BUYER VIEW
    if (type === "Purchases") {
      if (s === "pending") return "Pay Now";
      if (s === "paid") return "Waiting for Delivery";
      if (s === "pickedup") return "Order Received";
      if (s === "completed") return "Completed";
      if (s === "cancelled") return "Cancelled";
      return "";
    }

    // SELLER VIEW
    if (type === "Sales") {
      if (s === "pending") return "Action";
      if (s === "paid") return "Order Picked Up";
      if (s === "pickedup") return "On Hold";
      if (s === "completed") return "Completed";
      if (s === "cancelled") return "Cancelled";
      return "";
    }
  }

  // ------------------------------------------------------------
  // CASH ON HAND + MEETUP
  // ------------------------------------------------------------
  if (paymentMethod === "Cash on Hand" && fulfillmentMethod === "Meetup") {
    // BUYER VIEW
    if (type === "Purchases") {
      if (s === "pending") return "Waiting for Seller";
      if (s === "accepted") return "Item Received";
      if (s === "completed") return "Completed";
      if (s === "cancelled") return "Cancelled";
      return "";
    }

    // SELLER VIEW
    if (type === "Sales") {
      if (s === "pending") return "Action";
      if (s === "accepted") return "Waiting for Confirmation";
      if (s === "completed") return "Completed";
      if (s === "cancelled") return "Cancelled";
      return "";
    }
  }

  // ------------------------------------------------------------
  // ONLINE PAYMENT + MEETUP
  // ------------------------------------------------------------
  if (paymentMethod === "Online Payment" && fulfillmentMethod === "Meetup") {
    // BUYER VIEW
    if (type === "Purchases") {
      if (s === "pending") return "Waiting for Seller";
      if (s === "accepted") return "Pay Now"
      if (s === "paid") return "Item Received";
      if (s === "completed") return "Completed";
      if (s === "cancelled") return "Cancelled";
      return "";
    }

    // SELLER VIEW
    if (type === "Sales") {
      if (s === "pending") return "Action";
      if (s === "accepted") return "Waiting for Payment";
      if (s === "paid") return "Waiting for Confirmation";
      if (s === "completed") return "Completed";
      if (s === "cancelled") return "Cancelled";
      return "";
    }
  }

  return "";
}
