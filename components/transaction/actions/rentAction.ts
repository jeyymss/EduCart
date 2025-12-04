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
  status?: RentStatus
): string {
  if (!status) return "";

  const s = status.toLowerCase();

  // --------------------------
  // BUYER VIEW
  // --------------------------
  if (type === "Purchases") {
    if (s === "paid") return "Waiting for Pickup";
    if (s === "pickedup") return "Return Item";
    if (s === "returned") return "Waiting for Review";
    if (s === "completed") return "Completed";
    return "";
  }

  // --------------------------
  // SELLER VIEW
  // --------------------------
  if (type === "Sales") {
    if (s === "paid") return "Mark as Picked Up";
    if (s === "pickedup") return "On Rent";
    if (s === "returned") return "Confirm Return";
    if (s === "completed") return "Completed";
    return "";
  }

  return "";
}
