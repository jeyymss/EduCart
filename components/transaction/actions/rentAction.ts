export type RentUserType = "Purchases" | "Sales";
export type RentStatus =
  | "active"
  | "completed"
  | "cancelled"
  | "Accepted"
  | "Completed"
  | "Cancelled"
  | "Pending"
  | "Processing"
  | "Paid"
  | "PickedUp"
  | "Returned"
  | string;

export function computeRentActionLabel(
  type: RentUserType,
  status?: RentStatus,
  paymentMethod?: string // 👈 added payment method
): string {
  if (!status) return "";

  const s = status.toLowerCase();

  const isCash = paymentMethod === "Cash on Hand";
  const isOnline = paymentMethod === "Online Payment";

  // =====================================================
  // BUYER VIEW
  // =====================================================

  if (type === "Purchases") {
    // ⭐ CASH ON HAND FLOW
    if (isCash) {
      if (s === "pending") return "Waiting for Seller";
      if (s === "accepted") return "Waiting for Pickup"; // instead of 'paid'
      if (s === "pickedup") return "Return Item";
      if (s === "returned") return "Waiting for Review";
      if (s === "completed") return "Completed";
      return "";
    }

    // ⭐ ONLINE PAYMENT FLOW (original)
    if (isOnline) {
      if (s === "pending") return "Waiting for Seller";
      if (s === "accepted") return "Pay Now"
      if (s === "paid") return "Waiting for Pickup";
      if (s === "pickedup") return "Return Item";
      if (s === "returned") return "Waiting for Review";
      if (s === "completed") return "Completed";
      return "";
    }
  }

  // =====================================================
  // SELLER VIEW
  // =====================================================

  if (type === "Sales") {
    // ⭐ CASH ON HAND FLOW
    if (isCash) {
      if (s === "pending") return "Action";
      if (s === "accepted") return "Mark as Picked Up"; // replaces 'paid'
      if (s === "pickedup") return "On Rent";
      if (s === "returned") return "Confirm Return";
      if (s === "completed") return "Completed";
      return "";
    }

    // ⭐ ONLINE PAYMENT FLOW (original)
    if (isOnline) {
      if (s === "pending") return "Action";
      if (s === "accepted") return "Waiting for Payment"
      if (s === "paid") return "Mark as Picked Up";
      if (s === "pickedup") return "On Rent";
      if (s === "returned") return "Confirm Return";
      if (s === "completed") return "Completed";
      return "";
    }
  }

  return "";
}
