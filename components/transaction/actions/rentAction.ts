// components/transactions/actions/rentActions.ts

export function computeRentActionLabel(
  type: "Purchases" | "Sales",
  status?: string
) {
  if (!status) return "";

  const s = status.toLowerCase();

  // =============================
  // BUYER VIEW (Purchases)
  // =============================
  if (type === "Purchases") {
    if (s === "paid") return "Waiting for Pickup";
    if (s === "pickedup") return "Return Item";
    if (s === "returned") return "Waiting for Review";
    if (s === "completed") return "Completed";
    return "";
  }

  // =============================
  // SELLER VIEW (Sales)
  // =============================
  if (type === "Sales") {
    if (s === "paid") return "Mark as Picked Up";
    if (s === "pickedup") return "On Rent";
    if (s === "returned") return "Confirm Return";
    if (s === "completed") return "Completed";
    return "";
  }

  return "";
}
