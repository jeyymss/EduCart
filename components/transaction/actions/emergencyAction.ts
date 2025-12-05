export type EmergencyUserType = "Purchases" | "Sales";
export type EmergencyStatus =
  | "Pending"
  | "Accepted"
  | "PickedUp"
  | "Returned"
  | "Completed"
  | "Cancelled";

export function computeEmergencyActionLabel(
  type: EmergencyUserType,
  status?: EmergencyStatus
): string {
  if (!status) return "";
  const s = status.toLowerCase();

  // ------------------------
  // BUYER (Borrower)
  // ------------------------
  if (type === "Purchases") {
    if (s === "accepted") return "Waiting for Confirmation";
    if (s === "pickedup") return "Return Item";
    if (s === "returned") return "Waiting for Seller";
    if (s === "completed") return "Completed";
    return "";
  }

  // ------------------------
  // SELLER (Lender)
  // ------------------------
  if (type === "Sales") {
    if (s === "accepted") return "Item Picked Up";
    if (s === "pickedup") return "On Loan";
    if (s === "returned") return "Confirm Return";
    if (s === "completed") return "Completed";
    return "";
  }

  return "";
}
