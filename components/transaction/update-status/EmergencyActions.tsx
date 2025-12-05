"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type EmergencyActionsProps = {
  action: string;
  transactionId: string;
  type: "Purchases" | "Sales";
  onPrimary?: (id: string) => void;
};

export default function EmergencyActions({
  action,
  transactionId,
  type,
  onPrimary,
}: EmergencyActionsProps) {
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // ---------------------------------------------------------
  // UPDATE STATUS — SAME STYLE AS RENTACTIONS
  // ---------------------------------------------------------
  const updateEmergencyStatus = async (
    endpoint: "pickedup" | "returned" | "confirm-return",
    successMsg: string
  ) => {
    try {
      setIsUpdating(true);
      const loading = toast.loading("Updating...");

      const res = await fetch(`/api/status-update/emergency/${endpoint}`, {
        method: "POST",
        body: JSON.stringify({ transactionId }),
      });

      toast.dismiss(loading);

      if (!res.ok) throw new Error();

      toast.success(successMsg);
      onPrimary?.(transactionId);

    } catch {
      toast.error("Failed to update emergency lending status.");
    } finally {
      setIsUpdating(false);
      setOpen(false);
    }
  };

  // ---------------------------------------------------------
  // UI ACTION → ENDPOINT
  // ---------------------------------------------------------
  const handleAction = () => {
    if (action === "Item Picked Up")
      return updateEmergencyStatus("pickedup", "Item marked as picked up.");

    if (action === "Return Item")
      return updateEmergencyStatus("returned", "Item returned.");

    if (action === "Confirm Return")
      return updateEmergencyStatus(
        "confirm-return",
        "Emergency lending completed."
      );
  };

  // ---------------------------------------------------------
  // DISABLED / FINAL STATES
  // ---------------------------------------------------------
  const disabledStates = [
    "Waiting for Confirmation",
    "Waiting for Seller",
    "Waiting for Pickup",
    "On Loan",
    "Waiting for Return",
    "Completed",
    "Cancelled",
  ];

  if (disabledStates.includes(action)) {
    return (
      <Button
        size="sm"
        className="rounded-full text-xs px-5 h-8 bg-gray-400 text-white"
        disabled
      >
        {action}
      </Button>
    );
  }

  // ---------------------------------------------------------
  // MAIN UI
  // ---------------------------------------------------------
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          className="rounded-full text-xs px-5 h-8 text-white bg-slate-900"
          disabled={isUpdating}
        >
          {isUpdating ? "Processing..." : action}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{action}</AlertDialogTitle>

          <AlertDialogDescription>
            {action === "Item Picked Up" &&
              "Confirm that the borrower has picked up the item."}

            {action === "Return Item" &&
              "Confirm that you are returning the borrowed item."}

            {action === "Confirm Return" &&
              "Confirm that the borrowed item has been safely returned."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction onClick={handleAction} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
