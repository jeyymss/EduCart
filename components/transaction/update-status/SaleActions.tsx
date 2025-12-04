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
 

type SaleActionsProps = {
  action: string; 
  transactionId: string;
  type: "Purchases" | "Sales";
  onPrimary?: (id: string) => void;
};

export default function SaleActions({
  action,
  transactionId,
  type,
  onPrimary,
}: SaleActionsProps) {
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateSaleStatus = async (newStatus: string, successMsg: string) => {
    try {
      setIsUpdating(true);
      const loading = toast.loading("Updating transaction...");

      const res = await fetch("/api/status-update/sale", {
        method: "POST",
        body: JSON.stringify({ transactionId, newStatus }),
      });

      toast.dismiss(loading);

      if (!res.ok) throw new Error();

      toast.success(successMsg);
      onPrimary?.(transactionId);
    } catch (e) {
      toast.error("Failed to update transaction.");
    } finally {
      setIsUpdating(false);
      setOpen(false);
    }
  };

  const handleAction = () => {
    if (action === "Order Picked Up")
      return updateSaleStatus("PickedUp", "Order marked as picked up.");

    if (action === "Order Received")
      return updateSaleStatus("Completed", "Transaction completed.");

    // NEW: CASH ON HAND → Buyer marks as completed
    if (action === "Item Received")
      return updateSaleStatus("Completed", "Transaction completed.");
  };


  const disabledStates = ["Waiting for Confirmation", "On Hold", "Completed", "Cancelled"];

  if (disabledStates.includes(action)) {
    return (
      <Button
        size="sm"
        className="rounded-full text-xs px-5 h-8 bg-gray-400"
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
            {action === "Item Received" &&
              "Confirm that you have received the item. This will complete the transaction."}

            {action === "Order Picked Up" &&
              "Confirm that the buyer or courier picked up the order."}

            {action === "Order Received" &&
              "Confirm that you have received the item. This will complete the transaction."}
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
