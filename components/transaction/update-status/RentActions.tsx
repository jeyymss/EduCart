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


type RentActionsProps = {
  action: string;                                 
  transactionId: string;                          
  type: "Purchases" | "Sales";                   
  onPrimary?: (id: string) => void;               
};

export default function RentActions({
  action,
  transactionId,
  type,
  onPrimary,
}: RentActionsProps) {
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // TYPE ENDPOINTS to stop implicit any errors
  const updateRentStatus = async (
    endpoint: "pickedup" | "return" | "confirm-return",
    successMsg: string
  ) => {
    try {
      setIsUpdating(true);
      const loading = toast.loading("Updating...");

      const res = await fetch(`/api/status-update/rent/${endpoint}`, {
        method: "POST",
        body: JSON.stringify({ transactionId }),
      });

      toast.dismiss(loading);

      if (!res.ok) throw new Error("Failed to update.");

      toast.success(successMsg);
      onPrimary?.(transactionId);
    } catch {
      toast.error("Failed to update rent status.");
    } finally {
      setIsUpdating(false);
      setOpen(false);
    }
  };

  // Maps UI action → API endpoint
  const handleAction = () => {
    if (action === "Mark as Picked Up")
      return updateRentStatus("pickedup", "Item marked as picked up.");

    if (action === "Return Item")
      return updateRentStatus("return", "Item returned.");

    if (action === "Confirm Return")
      return updateRentStatus(
        "confirm-return",
        "Rent completed. Review unlocked."
      );
  };

  // Disabled states
  const disabledStates = [
    "Waiting for Pickup",
    "On Rent",
    "Waiting for Review",
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
            {action === "Mark as Picked Up" &&
              "Confirm that the buyer picked up the rented item."}

            {action === "Return Item" &&
              "Confirm that you are returning the rented item."}

            {action === "Confirm Return" &&
              "Confirm that the rented item has been returned safely."}
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
