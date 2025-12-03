export function computeSaleActionLabel(type: "Purchases" | "Sales", status?: string) {
  if (!status) return "";

  const s = status.toLowerCase();

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

  return "";
}
